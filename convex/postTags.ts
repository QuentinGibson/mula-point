import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

// Find all tags assigned a certain post
export const tagsByPost = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Find the post with the unique slug passed in
    const post = await ctx.db.query("posts").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique()

    // Throw if post does not exists
    if (!post) {
      throw new Error("Post do not exist!")
    }

    // Return all the tags that the unique post has
    const postTags = await ctx.db.query('postTags')
      .withIndex("post", (q) => q.eq("post", post._id)).collect()

    return postTags
  }
})

// Find all posts with a certain tag
export const postsByTag = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {

    // Find the tag with the unique slug passed in
    const tag = await ctx.db.query("tags").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique()

    // Throw if that tag does not exists
    if (!tag) {
      throw new Error("Tag does not exist")
    }

    // Return all the posts that has the unique tag
    const posts = await ctx.db.query("postTags").withIndex("tag", (q) => q.eq("tag", tag._id)).collect()

    return posts
  }
})

//Assign a post to a tag/tags
export const addTag = mutation({
  args: {
    slugs: v.array(v.id("tags")),
    postSlug: v.string()
  },
  handler: async (ctx, args) => {
    // Make sure the user is logged in
    const identifier = ctx.auth.getUserIdentity()

    // If the user is not logged in throw
    if (!identifier) {
      throw new Error("User is not authenticated!")
    }

    // Find the post from the slug
    const post = await ctx.db.query("posts").withIndex("by_slug", (q) => q.eq("slug", args.postSlug)).unique()

    if (!post) {
      throw new Error("Post does not exist")
    }

    //Loop through each slug and add it to a post
    for (const id of args.slugs) {
      await ctx.db.insert("postTags", {
        post: post._id,
        tag: id
      })
    }
  }
})

export const removeTag = mutation({
  args: {
    postId: v.id("posts"),
    tagId: v.id("tags")

  },
  handler: async (ctx, args) => {
    const postTag = await ctx.db
      .query("postTags")
      .withIndex("post_tag",
        (q) => q.eq("post", args.postId).eq("tag", args.tagId)
      ).unique()

    if (!postTag) {
      throw new Error("No relation exists with this post and tag!")
    }
    await ctx.db.delete(postTag._id)
  }
})

export const updateTags = mutation({
  args: {
    postId: v.id("posts"),
    tagIds: v.array(v.id("tags"))
  },
  handler: async (ctx, args) => {
    const postTags = await ctx.db
      .query("postTags")
      .withIndex("post", (q) => q.eq("post", args.postId))
      .collect()

    await Promise.all(postTags.map((postTag) => {
      ctx.db.delete(postTag._id)
    }))

    for (const tag of args.tagIds) {
      await ctx.db.insert("postTags", {
        post: args.postId,
        tag: tag
      })
    }
  }
})

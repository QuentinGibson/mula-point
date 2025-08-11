import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { partial } from "convex-helpers/validators";
import schema from "./schema";

export const list = query({
  args: {},
  handler: async (ctx, _args) => await ctx.db
    .query("posts")
    .order("desc")
    .collect()
})

export const listAmount = query({
  args: {
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .order("desc")
      .paginate(args.paginationOpts)
  }
})

export const create = mutation({
  args: {
    articleBody: v.string(),
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const { articleBody, name, slug } = args
    // Check if user is logged in
    const identifier = await ctx.auth.getUserIdentity()

    if (!identifier) {
      throw new Error("User not authenticated")
    }

    // Check if user is in system
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identifier.tokenIdentifier))
      .unique()

    if (!user) {
      throw new Error("Unauthorized call to create post!")
    }

    // Create a new post with the user as the author
    return await ctx.db
      .insert("posts", {
        articleBody,
        name,
        slug,
        author: user._id
      })

  }
})

export const remove = mutation({
  args: {
    id: v.id("posts")
  },
  handler: async (ctx, args) => {
    const identifier = await ctx.auth.getUserIdentity()

    if (!identifier) {
      throw new Error("User not authenticated")
    }

    await ctx.db.delete(args.id)
  }
})

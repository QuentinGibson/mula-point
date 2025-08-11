import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    author: v.id("users"),
    channel: v.id("channels")
  })
    .index("by_user", ["author"])
    .index("by_channel", ["channel"]),
  tags: defineTable({
    name: v.string(),
    slug: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_name", ["name"]),
  posts: defineTable({
    articleBody: v.string(),
    name: v.string(),
    slug: v.string(),
    author: v.id("users"),
  }).index("by_slug", ["slug"]),
  postLikes: defineTable({
    user: v.id("users"),
    post: v.id("posts")
  })
    .index("by_post", ["post"])
    .index("by_user", ["user"]),
  commentLikes: defineTable({
    user: v.id("users"),
    comment: v.id("comments")
  })
    .index("by_comment", ["comment"])
    .index("by_user", ["user"]),
  comments: defineTable({
    user: v.id("users"),
    post: v.id("posts"),
    body: v.string()
  })
    .index("by_post", ["post"])
    .index("by_user", ["user"]),
  postTags: defineTable({
    post: v.id("posts"),
    tag: v.id("tags"),
  })
    .index("post", ["post"])
    .index("tag", ["tag"])
    .index("post_tag", ["post", "tag"]),
  users: defineTable({
    name: v.string(),
    tokenIdentifier: v.string()
  })
    .index("by_token", ["tokenIdentifier"]),
  channels: defineTable({
    name: v.string(),
    slug: v.string()
  })
    .index("by_slug", ["slug"]),
  channelUsers: defineTable({
    channel: v.id("channels"),
    user: v.id("users"),
  })
    .index("channel", ["channel"])
    .index("user", ["user"])
    .index("channel_user", ["channel", "user"])
});



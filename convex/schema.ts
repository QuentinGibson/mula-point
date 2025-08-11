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
  postTags: defineTable({
    postId: v.id("posts"),
    tagId: v.id("tags"),
  })
    .index("postId", ["postId"])
    .index("tagId", ["tagId"])
    .index("postTagId", ["postId", "tagId"]),
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
    channelId: v.id("channels"),
    userId: v.id("users"),
  })
    .index("channelId", ["channelId"])
    .index("userId", ["userId"])
    .index("channId_userId", ["channelId", "userId"])
});



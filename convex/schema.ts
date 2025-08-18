import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  messages: defineTable({
    body: v.string(),
    author: v.id("users"),
    channel: v.optional(v.id("channels")),
    directMessage: v.optional(v.id("directMessages"))
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
  directMessages: defineTable({
    slug: v.string()
  })
    .index("by_slug", ["slug"]),
  directMessageUsers: defineTable({
    directMessage: v.id("directMessages"),
    user: v.id("users")
  })
    .index("by_user", ["user"])
    .index("by_directMessage", ["directMessage"]),
  channelUsers: defineTable({
    channel: v.id("channels"),
    user: v.id("users"),
  })
    .index("channel", ["channel"])
    .index("user", ["user"])
    .index("channel_user", ["channel", "user"]),
  shows: defineTable({
    title: v.string(),
    releaseDate: v.string(),
    snippet: v.string(),
    description: v.string(),
    isNew: v.boolean(),
    largeThumbnail: v.optional(v.id("_storage")),
    sideThumbnail: v.optional(v.id("_storage"))
  }),
  genres: defineTable({
    show: v.id("shows"),
    name: v.string(),
  })
    .index("by_show", ["show"])
    .index("by_name", ["name"]),
  seasons: defineTable({
    show: v.id("shows"),
    name: v.string()
  })
    .index("by_show", ["show"]),
  videos: defineTable({
    title: v.string(),
    videoLength: v.number(),
    library: v.string(),
    bunnyId: v.string(),
    thunbnail: v.optional(v.string()),
    season: v.id("seasons")
  })
    .index("by_library_bunnyId", ["library", "bunnyId"])
    .index("by_season", ["season"]),
  images: defineTable({
    path: v.id("_storage")
  })
});



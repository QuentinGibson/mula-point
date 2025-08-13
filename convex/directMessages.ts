import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx, _args) => {
    // Check if user is logged in
    const identifier = await ctx.auth.getUserIdentity()

    // Otherwise throw
    if (!identifier) {
      throw new Error("User is not authenticated")
    }

    // Check if user is in system
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identifier.tokenIdentifier))
      .unique()

    // Otherwise throw
    if (!user) {
      throw new Error("User does not exist!")
    }

    const directMessageChannels = await ctx.db
      .query("directMessageUsers")
      .withIndex("by_user", q => q.eq("user", user._id))
      .collect()

    return directMessageChannels
  }
})

export const whisper = mutation({
  args: {
    targetUser: v.id("users")
  },
  handler: async (ctx, args) => {
    // Check if user is logged in
    const identifier = await ctx.auth.getUserIdentity()

    // Otherwise throw
    if (!identifier) {
      throw new Error("User is not authenticated")
    }

    // Check if user is in system
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", identifier.tokenIdentifier))
      .unique()

    // Otherwise throw
    if (!user) {
      throw new Error("User does not exist!")
    }

    const target = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.targetUser))
      .unique()

    if (!target) {
      throw new Error("Target user does not exist!")
    }

    const directMessageChannelId = await ctx.db.insert("directMessages", {
      slug: `${user.name}_${target.name}`
    })

    await ctx.db.insert("directMessageUsers", {
      user: user._id,
      directMessage: directMessageChannelId
    })

    await ctx.db.insert("directMessageUsers", {
      user: target._id,
      directMessage: directMessageChannelId
    })
  }
})

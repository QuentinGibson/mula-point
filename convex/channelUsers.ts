import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const listChannels = query({
  args: {},
  handler: async (ctx, _args) => {

    // Check if user is logged in
    const identifier = await ctx.auth.getUserIdentity()

    // Throw if no user
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

    // Get all channel relations that include user
    const channelRelations = await ctx.db.query("channelUsers").withIndex("userId", q => q.eq("userId", user._id)).collect()

    // Get then return channel information 
    return Promise.all(channelRelations.map((channelUser) => {
      const channel = ctx.db.get(channelUser.channelId)
      return channel
    }))
  }
})

export const listUsers = query({
  args: { id: v.id("channels") },
  handler: async (ctx, args) => {
    // Check if user is logged in
    const identifier = await ctx.auth.getUserIdentity()

    // Throw if no user
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

    // Get all users relations that include channel
    const channelRelations = await ctx.db
      .query("channelUsers")
      .withIndex("channelId", q => q.eq("channelId", args.id))
      .collect()

    // Get then return channel information 
    return Promise.all(channelRelations.map((channelUser) => {
      const user = ctx.db.get(channelUser.userId)
      return user
    }))
  }
})

export const addUser = mutation({
  args: { channelId: v.id("channels"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user is logged in
    const identifier = await ctx.auth.getUserIdentity()

    // Throw if no user
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

    await ctx.db
      .insert("channelUsers", { channelId: args.channelId, userId: args.userId })
  }
})

export const removeUser = mutation({
  args: { channelId: v.id("channels"), userId: v.id("users") },
  handler: async (ctx, args) => {
    // Check if user is logged in
    const identifier = await ctx.auth.getUserIdentity()

    // Throw if no user
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

    const channelUser = await ctx.db
      .query("channelUsers")
      .withIndex("channId_userId", q => q.eq("channelId", args.channelId).eq("userId", args.userId))
      .unique()

    if (!channelUser) {
      throw new Error("User is already not in channel!")
    }

    await ctx.db.delete(channelUser._id)
  }
})

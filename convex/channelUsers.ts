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
    const channelRelations = await ctx.db.query("channelUsers").withIndex("user", q => q.eq("user", user._id)).collect()

    // Get then return channel information 
    const channels = await Promise.all(channelRelations.map((channelUser) => {
      const channel = ctx.db.get(channelUser.channel)
      return channel
    }))

    // Filter out any null channels
    return channels.filter(channel => channel !== null)
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
      .withIndex("channel", q => q.eq("channel", args.id))
      .collect()

    // Get then return channel information 
    return Promise.all(channelRelations.map((channelUser) => {
      const user = ctx.db.get(channelUser.user)
      return user
    }))
  }
})

export const addUser = mutation({
  args: { channel: v.id("channels"), user: v.id("users") },
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

    // Add the user to the channel
    await ctx.db
      .insert("channelUsers", { channel: args.channel, user: args.user })
  }
})

export const removeUser = mutation({
  args: { channel: v.id("channels"), user: v.id("users") },
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

    // Find the relation for the channel and the user
    const channelUser = await ctx.db
      .query("channelUsers")
      .withIndex("channel_user", q => q.eq("channel", args.channel).eq("user", args.user))
      .unique()

    // If not found user is already not in the channel
    if (!channelUser) {
      throw new Error("User is already not in channel!")
    }

    // Remove the user from the channel
    await ctx.db.delete(channelUser._id)
  }
})

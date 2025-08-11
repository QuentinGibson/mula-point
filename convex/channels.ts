import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema from "./schema";
import { partial } from "convex-helpers/validators";


const channelFields = schema.tables.channels.validator.fields

export const list = query({
  args: {},
  handler: async (ctx, _args) => {
    ctx.db.query("channels").collect()
  }
})

export const listUser = query({
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

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const { name, slug } = args

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

    // Create a new channel
    const newChannelId = await ctx.db.insert("channels", {
      name,
      slug
    })

    // Add user to his own channel
    await ctx.db.insert("channelUsers", {
      userId: user._id,
      channelId: newChannelId
    })
  }
})

export const edit = mutation({
  args: {
    id: v.id("channels"),
    patch: v.object(partial(channelFields))
  },
  handler: async (ctx, args) => {
    const { id, patch } = args

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

    // Update channel and log it.
    await ctx.db.patch(id, patch)
    console.log(await ctx.db.get(id))
  }
})

export const remove = mutation({
  args: { id: v.id("channels") },
  // Remove channel by Id
  handler: async (ctx, args) => await ctx.db.delete(args.id)
})

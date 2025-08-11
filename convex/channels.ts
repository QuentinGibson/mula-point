import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import schema from "./schema";
import { partial } from "convex-helpers/validators";


const channelFields = schema.tables.channels.validator.fields

export const list = query({
  args: {},
  // Get all channels
  handler: async (ctx, _args) => ctx.db.query("channels").collect()
})


export const create = mutation({
  args: { name: v.string(), slug: v.string() },
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
      user: user._id,
      channel: newChannelId
    })
  }
})

export const edit = mutation({
  args: {
    id: v.id("channels"),
    value: v.object(partial(channelFields))
  },
  handler: async (ctx, args) => {
    const { id, value } = args

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
    await ctx.db.patch(id, value)
    console.log(await ctx.db.get(id))
  }
})

export const remove = mutation({
  args: { id: v.id("channels") },
  // Remove channel by Id
  handler: async (ctx, args) => await ctx.db.delete(args.id)
})

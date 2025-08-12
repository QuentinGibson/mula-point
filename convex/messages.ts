import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()

    if (!user) {
      throw new Error("Unauthenticated call to getForCurrentUser")
    }

    const messages = await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('author'), user._id))
      .collect()

    return Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.author)
        return {
          userName: user?.name ?? "Anonymous",
          ...message,
        };
      }),
    );
  },
});

export const getForChannel = query({
  args: {
    id: v.id("channels")
  },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called storeUser without authentication!")
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()
    if (!user) {
      throw new Error("Unauthicated call to mutation")
    }

    const channel = await ctx.db.query("channels").withIndex("by_id", q => q.eq("_id", args.id)).unique()

    if (!channel) {
      throw new Error("Channel not found!")
    }

    const messages = await ctx.db.query("messages").withIndex("by_channel", q => q.eq("channel", channel._id)).collect()

    return Promise.all(messages.map(async (message) => {
      const user = await ctx.db.get(message.author)
      return {
        ...message,
        userName: user?.name || "Anonymous"
      }
    }))
  }
})

export const send = mutation({
  args: {
    body: v.string(),
    channel: v.id("channels")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called storeUser without authentication!")
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()
    if (!user) {
      throw new Error("Unauthicated call to mutation")
    }
    const newMessageId = await ctx.db.insert("messages", { body: args.body, author: user._id, channel: args.channel })
    return newMessageId
  }
})

export const list = query({
  args: {},
  handler: async (ctx, _args) => {
    const messages = await ctx.db.query('messages').take(50)
    return messages
  },
})

export const remove = mutation({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => await ctx.db.delete(args.id)
})

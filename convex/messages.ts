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

export const send = mutation({
  args: {
    body: v.string(),
    message: v.string(),
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

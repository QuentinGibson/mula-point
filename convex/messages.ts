import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }
    return await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('author'), identity.email))
      .collect()
  },
})

export const send = mutation({
  args: {
    body: v.string(),
    author: v.string(),
  },
  handler: async (ctx, args) => {
    const newMessageId = await ctx.db.insert("messages", { body: args.body, author: args.author })
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

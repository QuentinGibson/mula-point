import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import schema from "./schema";
import { partial } from "convex-helpers/validators"

const tagFields = schema.tables.tags.validator.fields

export const list = query({
  args: {},
  handler: async (ctx, _args) => {
    const tags = await ctx.db.query("tags").collect()
    return tags
  }
})

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const identifier = ctx.auth.getUserIdentity()

    if (!identifier) {
      throw new Error("User is not authenticated")
    }

    const tagId = await ctx.db.insert("tags", { name: args.name, slug: args.slug })
    return tagId
  }
})

export const update = mutation({
  args: {
    id: v.id("tags"),
    patch: v.object(partial(tagFields))
  },
  handler: async (ctx, args) => {
    const identifier = ctx.auth.getUserIdentity()
    if (!identifier) {
      throw new Error("User not authenticated!")
    }
    await ctx.db.patch(args.id, args.patch)
  }
})

export const destroy = mutation({
  args: {
    id: v.id("tags")
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  }
})

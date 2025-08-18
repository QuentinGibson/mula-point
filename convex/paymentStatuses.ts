import { internalMutationGeneric } from "convex/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  handler: async (ctx) => await ctx.db.query("paymentStatuses").collect()
})

export const init = internalMutationGeneric({
  handler: async (ctx) => {
    // List of payment statuses
    const statuses = [
      "pending",
      "processing",
      "success",
      "failed"
    ]

    // Create payment statuses
    for (const status of statuses) {
      await ctx.db.insert("paymentStatuses", { name: status })
    }
    console.log("Created standard payment statuses")
  }
})

export const send = mutation({
  args: {
    name: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("paymentStatuses", { name: args.name })
    console.log(`created payment status: ${args.name}`)
  }
})

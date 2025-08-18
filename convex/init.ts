import { internalMutation, MutationCtx } from "./_generated/server"
import { internal } from "./_generated/api"

const channels = [
  ["homepage", "home", 0],
  ["formpage", "form", 1000]
] as const

export default internalMutation({
  handler: async (ctx: MutationCtx) => {
    const anyChannel = await ctx.db.query("channels").first();
    if (!anyChannel) {
      let totalDelay = 0
      for (const [name, slug, delay] of channels) {
        totalDelay += delay
        await ctx.scheduler.runAfter(delay, internal.channels.adminCreate, {
          name,
          slug
        })
      }
    }

    // Check if any payment Statuses exists
    let currentStatuses = await ctx.db.query("paymentStatuses").first()

    // No need to populate if any exists
    if (!currentStatuses) {
      await ctx.scheduler.runAfter(0, internal.paymentStatuses.init)
    }

  }
})

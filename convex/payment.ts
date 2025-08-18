import { paginationOptsValidator } from "convex/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { faker } from "@faker-js/faker";

export const pageList = query({
  args: {
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    const payments = await ctx.db.query("payments").paginate(args.paginationOpts)

    const paymentsWithUserNames = await Promise.all(
      payments.page.map(async (payment) => {
        const user = await ctx.db.get(payment.user)
        const status = await ctx.db.get(payment.status)
        const userName = user?.name || "Anonymous"
        return {
          ...payment,
          userName,
          statusName: status?.name
        }
      })
    )

    return {
      ...payments,
      page: paymentsWithUserNames
    }
  }
})

export const send = mutation({
  args: {
    amount: v.number(),
    status: v.string(),
    paymentDate: v.number(),
    user: v.id("users")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("User is not identified while creating a payment")

    const { amount, status, user, paymentDate } = args

    const statusRow = await ctx.db.query("paymentStatuses").withIndex("by_name", q => q.eq("name", status)).unique()
    if (!statusRow) throw new Error("Payment status not found while creating payment!")



    await ctx.db.insert("payments", {
      amount,
      status: statusRow._id,
      user,
      paymentDate
    })
  }
})

export const fakePayments = internalMutation({
  handler: async (ctx) => {
    faker.seed(456)

    const paymentStatuses = await ctx.db.query("paymentStatuses").collect()
    if (paymentStatuses.length === 0) {
      throw new Error("No payment statuses found. Please run paymentStatuses.init first.")
    }

    const users = await ctx.db.query("users").collect()
    if (users.length === 0) {
      throw new Error("No users found. Please create users first.")
    }

    const payments = []

    for (let i = 0; i < 1000; i++) {
      const payment = {
        amount: parseFloat(faker.finance.amount({ min: 5, max: 500, dec: 2 })),
        status: faker.helpers.arrayElement(paymentStatuses)._id,
        user: faker.helpers.arrayElement(users)._id,
        paymentDate: faker.date.between({
          from: '2023-01-01',
          to: '2024-12-31'
        }).getTime()
      }

      payments.push(payment)
    }

    const batchSize = 50
    for (let i = 0; i < payments.length; i += batchSize) {
      const batch = payments.slice(i, i + batchSize)
      await Promise.all(batch.map(payment => ctx.db.insert("payments", payment)))
    }

    return {
      created: payments.length,
      statusesUsed: paymentStatuses.map(s => s.name)
    }
  }
})

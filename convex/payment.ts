import { internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";
import { faker } from "@faker-js/faker";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { TableAggregate } from "@convex-dev/aggregate"
import { Triggers } from "convex-helpers/server/triggers"
import { customMutation, customCtx } from "convex-helpers/server/customFunctions"
import { query } from "./_generated/server"

const triggers = new Triggers<DataModel>()


const aggregateByPaymentDate = new TableAggregate<{
  Key: number;
  DataModel: DataModel;
  TableName: "payments";
}>(components.aggregateByDate, {
  sortKey: (doc) => -doc.paymentDate,
});

triggers.register("payments", aggregateByPaymentDate.trigger())

const mutationWithTriggers = customMutation(
  mutation,
  customCtx(triggers.wrapDB)
)

export const pageList = query({
  args: {
    offset: v.number(),
    numItems: v.number(),
  },
  handler: async (ctx, args) => {
    const firstInPage = await aggregateByPaymentDate.at(ctx, args.offset,)

    const page = await aggregateByPaymentDate.paginate(ctx, {
      bounds: {
        lower: {
          key: firstInPage.key,
          id: firstInPage.id,
          inclusive: true,
        }
      },
      pageSize: args.numItems
    })

    const payments = await Promise.all(
      page.page.map((doc) => ctx.db.get(doc.id))
    )

    const filteredPayments = payments.filter((d) => d !== null)
    return Promise.all(filteredPayments.map(async (payment) => {
      const user = await ctx.db.get(payment.user)
      const status = await ctx.db.get(payment.status)
      const statusName = status?.name
      const userName = user?.name || "Anonymous"
      return {
        ...payment,
        userName,
        statusName
      }
    }))
  }
})

export const send = mutationWithTriggers({
  args: {
    amount: v.number(),
    status: v.string(),
    paymentDate: v.number(),
    user: v.id("users")
  },
  returns: v.id("payments"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("User is not identified while creating a payment")

    const { amount, status, user, paymentDate } = args

    const statusRow = await ctx.db.query("paymentStatuses").withIndex("by_name", q => q.eq("name", status)).unique()
    if (!statusRow) throw new Error("Payment status not found while creating payment!")

    const id = await ctx.db.insert("payments", {
      amount,
      status: statusRow._id,
      user,
      paymentDate
    })

    await ctx.db.get(id)
    return id
  }
})

export const paymentsCount = query({
  args: {},
  handler: async (ctx, _args) => {
    const count = await aggregateByPaymentDate.count(ctx)
    return count
  }
})

export const rankOfPayment = query({
  args: {
    paymentDate: v.number()
  },
  handler: async (ctx, args) => {
    return await aggregateByPaymentDate.indexOf(ctx, -args.paymentDate)
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
      await Promise.all(batch.map(async (payment) => {
        const id = await ctx.db.insert("payments", payment)
        const doc = await ctx.db.get(id)
        await aggregateByPaymentDate.insert(ctx, doc!)
      }
      ))
    }

    return {
      created: payments.length,
      statusesUsed: paymentStatuses.map(s => s.name)
    }
  }
})



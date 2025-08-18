import { internalMutation, mutation, query } from "./_generated/server"
import { faker } from "@faker-js/faker"

export const store = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called storeUser without authentication present")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (user !== null) {
      if (user.name !== identity.name) {
        await ctx.db.patch(user._id, { name: identity.name })
      }
      return user._id
    }

    return await ctx.db.insert("users", {
      name: identity.name || "Anonymous",
      tokenIdentifier: identity.tokenIdentifier
    })
  }
})

export const createFake = internalMutation({
  handler: async (ctx) => {
    faker.seed()

    for (let i = 0; i < 200; i++) {
      await ctx.db.insert("users", {
        name: faker.internet.username(),
        tokenIdentifier: faker.internet.jwt()
      })
    }
  }
})

export const getUsername = query({
  args: {},
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called storeUser without authentication present")
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier),
      )
      .unique()

    if (!user) {
      throw new Error("User is not in system!")
    }

    return user.name

  }
})

export const membersFake = internalMutation({
  handler: async (ctx, _args) => {
    faker.seed()

    const formChannel = await ctx.db
      .query("channels")
      .withIndex("by_slug", q => q.eq("slug", "form"))
      .unique()

    if (!formChannel) {
      throw new Error("Form channel not found")
    }

    // Get all users
    const allUsers = await ctx.db.query("users").collect()

    if (allUsers.length === 0) {
      throw new Error("No users found in database")
    }

    // Get existing channel members to avoid duplicates
    const existingMembers = await ctx.db
      .query("channelUsers")
      .withIndex("channel", q => q.eq("channel", formChannel._id))
      .collect()

    const existingUserIds = new Set(existingMembers.map(m => m.user))

    // Filter out users already in the channel
    const availableUsers = allUsers.filter(u => !existingUserIds.has(u._id))

    // Add random users (up to 20 or available users count)
    const usersToAdd = Math.min(20, availableUsers.length)

    for (let i = 0; i < usersToAdd; i++) {
      const randomIndex = Math.floor(Math.random() * availableUsers.length)
      const randomUser = availableUsers.splice(randomIndex, 1)[0]

      await ctx.db.insert("channelUsers", {
        channel: formChannel._id,
        user: randomUser._id
      })
    }
  }
})

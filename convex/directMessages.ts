import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { faker } from "@faker-js/faker";

export const list = query({
  args: {},
  handler: async (ctx, _args) => {
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

    const directMessageChannels = await ctx.db
      .query("directMessageUsers")
      .withIndex("by_user", q => q.eq("user", user._id))
      .collect()

    const dmChannelsWithOther = await Promise.all(directMessageChannels.map(async (dmChannel) => {
      // Get all users in this DM channel
      const allUsersInChannel = await ctx.db
        .query("directMessageUsers")
        .withIndex("by_directMessage", q => q.eq("directMessage", dmChannel.directMessage))
        .collect()

      // Find the other user (not the current user)
      const otherUserRelation = allUsersInChannel.find(u => u.user !== user._id)

      if (!otherUserRelation) {
        // Single user DM or invalid state - skip this channel
        return null
      }

      // Get the other user's details
      const otherUser = await ctx.db.get(otherUserRelation.user)

      if (!otherUser) {
        return null
      }

      // Get the DM channel details
      const dmChannelDetails = await ctx.db.get(dmChannel.directMessage)

      return {
        _id: dmChannel.directMessage,
        slug: dmChannelDetails?.slug || "",
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name
        }
      }
    }))

    // Filter out any null values (invalid DM channels)
    return dmChannelsWithOther.filter(dm => dm !== null)
  }
})

export const whisper = mutation({
  args: {
    targetUser: v.id("users")
  },
  handler: async (ctx, args) => {
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

    const target = await ctx.db
      .query("users")
      .withIndex("by_token", q => q.eq("tokenIdentifier", args.targetUser))
      .unique()

    if (!target) {
      throw new Error("Target user does not exist!")
    }

    const directMessageChannelId = await ctx.db.insert("directMessages", {
      slug: `${user.name}_${target.name}`
    })

    await ctx.db.insert("directMessageUsers", {
      user: user._id,
      directMessage: directMessageChannelId
    })

    await ctx.db.insert("directMessageUsers", {
      user: target._id,
      directMessage: directMessageChannelId
    })
  }
})

export const dmFake = internalMutation({
  handler: async (ctx) => {
    faker.seed(123) // Use consistent seed for reproducible results
    
    // Find the quentmadeit user
    const quentUser = await ctx.db
      .query("users")
      .filter(q => q.eq(q.field("name"), "quentmadeit"))
      .first()
    
    if (!quentUser) {
      throw new Error("User 'quentmadeit' not found. Please create this user first.")
    }
    
    // Get all other users (excluding quentmadeit)
    const allUsers = await ctx.db
      .query("users")
      .collect()
    
    const otherUsers = allUsers.filter(u => u._id !== quentUser._id)
    
    if (otherUsers.length === 0) {
      throw new Error("No other users found to create DMs with")
    }
    
    // Select random users to create DMs with (up to 10 or available users)
    const numDMs = Math.min(10, otherUsers.length)
    const selectedUsers = faker.helpers.shuffle(otherUsers).slice(0, numDMs)
    
    // Create DM channels and populate with messages
    for (const otherUser of selectedUsers) {
      // Check if DM already exists between these users
      const existingDMs = await ctx.db
        .query("directMessageUsers")
        .withIndex("by_user", q => q.eq("user", quentUser._id))
        .collect()
      
      let dmExists = false
      for (const dm of existingDMs) {
        const otherUserInDM = await ctx.db
          .query("directMessageUsers")
          .withIndex("by_directMessage", q => q.eq("directMessage", dm.directMessage))
          .filter(q => q.eq(q.field("user"), otherUser._id))
          .first()
        
        if (otherUserInDM) {
          dmExists = true
          break
        }
      }
      
      if (dmExists) {
        console.log(`DM already exists between quentmadeit and ${otherUser.name}`)
        continue
      }
      
      // Create the DM channel
      const dmChannelId = await ctx.db.insert("directMessages", {
        slug: `dm-${quentUser.name}-${otherUser.name}`
      })
      
      // Add both users to the DM channel
      await ctx.db.insert("directMessageUsers", {
        user: quentUser._id,
        directMessage: dmChannelId
      })
      
      await ctx.db.insert("directMessageUsers", {
        user: otherUser._id,
        directMessage: dmChannelId
      })
      
      // Generate random messages between the users
      const numMessages = faker.number.int({ min: 5, max: 20 })
      
      for (let i = 0; i < numMessages; i++) {
        const isFromQuent = faker.datatype.boolean()
        const author = isFromQuent ? quentUser : otherUser
        
        await ctx.db.insert("messages", {
          body: faker.lorem.sentence(),
          author: author._id,
          directMessage: dmChannelId
        })
      }
      
      console.log(`Created DM between quentmadeit and ${otherUser.name} with ${numMessages} messages`)
    }
    
    return `Created ${selectedUsers.length} DM conversations for quentmadeit`
  }
})

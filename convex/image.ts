import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const images = await ctx.db.query("images").collect()

    return Promise.all(images.map(async (image) => ({
      ...image,
      url: await ctx.storage.getUrl(image.path)
    }
    )))
  }
})

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  }
})

export const sendImage = mutation({
  args: {
    storageId: v.id("_storage")
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("images", {
      path: args.storageId
    })
    console.log(`Image uploaded: ${args.storageId}`)
  }
})

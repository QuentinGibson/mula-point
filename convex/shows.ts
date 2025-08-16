import { paginationOptsValidator } from "convex/server";
import { internalMutation, query } from "./_generated/server";
import { faker } from "@faker-js/faker";


//TODO: List all shows for a infinite scroll effect
export const list = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("shows").order("desc").take(50)
  }
})

export const listPage = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    const { paginationOpts } = args
    const shows = await ctx.db.query("shows").order("desc").paginate(paginationOpts)
    return shows
  }
})

export const fakeShows = internalMutation({
  handler: async (ctx) => {
    faker.seed(123) // Use a seed for consistent data

    const shows = []

    for (let i = 0; i < 500; i++) {
      const show = {
        title: faker.helpers.arrayElement([
          faker.book.title(),
          faker.music.songName(),
          faker.commerce.productName(),
          faker.company.catchPhrase()
        ]),
        releaseDate: faker.date.between({
          from: '2015-01-01',
          to: '2024-12-31'
        }).toISOString().split('T')[0],
        snippet: faker.lorem.sentence({ min: 10, max: 20 }),
        description: faker.lorem.paragraphs({ min: 2, max: 4 }),
        isNew: faker.datatype.boolean({ probability: 0.2 }), // 20% chance of being new
      }

      shows.push(show)
    }

    // Insert all shows in batches to avoid timeout
    const batchSize = 50
    for (let i = 0; i < shows.length; i += batchSize) {
      const batch = shows.slice(i, i + batchSize)
      await Promise.all(batch.map(show => ctx.db.insert("shows", show)))
    }

    return { created: shows.length }
  }
})

import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByLibraryAndBunnyId = query({
  args: {
    library: v.string(),
    bunnyId: v.string()
  },
  handler: async (ctx, args) => {
    const video = await ctx.db
      .query("videos")
      .withIndex("by_library_bunnyId", (q) =>
        q.eq("library", args.library).eq("bunnyId", args.bunnyId)
      )
      .first();

    if (!video) {
      return null;
    }

    // Get the season info
    const season = await ctx.db.get(video.season);

    // Get the show info if season exists
    let show = null;
    if (season) {
      show = await ctx.db.get(season.show);
    }

    return {
      ...video,
      season,
      show
    };
  }
});

export const getVideoById = query({
  args: {
    id: v.id("videos")
  },
  handler: async (ctx, args) => {
    const video = await ctx.db.get(args.id);

    if (!video) {
      return null;
    }

    // Get the season info
    const season = await ctx.db.get(video.season);

    // Get the show info if season exists
    let show = null;
    if (season) {
      show = await ctx.db.get(season.show);
    }

    return {
      ...video,
      season,
      show
    };
  }
});

// Get all videos for a season
export const getBySeasonId = query({
  args: {
    seasonId: v.id("seasons")
  },
  handler: async (ctx, args) => {
    const videos = await ctx.db
      .query("videos")
      .withIndex("by_season", (q) => q.eq("season", args.seasonId))
      .collect();

    return videos;
  }
});

import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { Id } from './_generated/dataModel';

type DateSeparator = {
  id: string;
  messageType: "date_separator";
  body: string;
  _creationTime: number;
};

type MessageWithTimestamp = {
  _id: Id<"messages">;
  _creationTime: number;
  body: string;
  author: Id<"users">;
  channel?: Id<"channels">;
  directMessage?: Id<"directMessages">;
  formattedTime: string;
  messageType?: undefined;
  userName: string;
};

type ChatItem = DateSeparator | MessageWithTimestamp;

export const getForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (identity === null) {
      throw new Error('Not authenticated')
    }

    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()

    if (!user) {
      throw new Error("Unauthenticated call to getForCurrentUser")
    }

    const messages = await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('author'), user._id))
      .collect()

    return Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.author)
        return {
          userName: user?.name ?? "Anonymous",
          ...message,
        };
      }),
    );
  },
});

export const getForChannel = query({
  args: {
    id: v.id("channels")
  },
  handler: async (ctx, args) => {

    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called storeUser without authentication!")
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()
    if (!user) {
      throw new Error("Unauthicated call to mutation")
    }

    const channel = await ctx.db.query("channels").withIndex("by_id", q => q.eq("_id", args.id)).unique()

    if (!channel) {
      throw new Error("Channel not found!")
    }

    const formatMessageTime = (timestamp: number) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }).toLowerCase();

      if (diffDays === 0) return `Today at ${timeStr}`;
      if (diffDays === 1) return `Yesterday at ${timeStr}`;
      return `${date.toLocaleDateString()} at ${timeStr}`;
    }

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_channel", (q) => q.eq("channel", args.id))
      .order("asc") // chronological order by _creationTime
      .collect();

    const messagesWithUsers = await Promise.all(messages.map(async (message) => {
      const user = await ctx.db.get(message.author)
      return {
        ...message,
        userName: user?.name || "Unknown User"
      }
    }))

    // Group messages and dynamically add date separators
    const messagesWithDates: ChatItem[] = [];
    let lastDate = "";

    for (const message of messagesWithUsers) {
      const messageDate = new Date(message._creationTime).toDateString();

      // If this is a new date, add a date separator
      if (messageDate !== lastDate) {
        messagesWithDates.push({
          id: `date-separator-${message._creationTime}`,
          messageType: "date_separator",
          body: new Date(message._creationTime).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          }).toUpperCase(),
          _creationTime: message._creationTime
        });
        lastDate = messageDate;
      }

      // Add the actual message with formatted timestamp
      messagesWithDates.push({
        ...message,
        formattedTime: formatMessageTime(message._creationTime)
      });
    }

    return messagesWithDates

  }
})

export const getForRoom = query({
  args: {
    roomId: v.union(v.id("channels"), v.id("directMessages")),
    roomType: v.union(v.literal("channel"), v.literal("directMessage"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called getForRoom without authentication!")
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()
    if (!user) {
      throw new Error("Unauthenticated call to query")
    }

    const formatMessageTime = (timestamp: number) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }).toLowerCase();

      if (diffDays === 0) return `today at ${timeStr}`;
      if (diffDays === 1) return `yesterday at ${timeStr}`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` at ${timeStr}`;
    };

    const formatDateSeparator = (timestamp: number) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    };

    // Get messages based on room type
    let messages;
    if (args.roomType === "channel") {
      messages = await ctx.db
        .query('messages')
        .withIndex("by_channel", (q) => q.eq("channel", args.roomId as Id<"channels">))
        .order("asc")
        .collect()
    } else {
      messages = await ctx.db
        .query('messages')
        .filter((q) => q.eq(q.field("directMessage"), args.roomId as Id<"directMessages">))
        .order("asc")
        .collect()
    }

    // Process messages with user names and timestamps
    const messagesWithTimestamps = await Promise.all(
      messages.map(async (message) => {
        const author = await ctx.db.get(message.author)
        return {
          ...message,
          userName: author?.name ?? "Anonymous",
          formattedTime: formatMessageTime(message._creationTime),
        } as MessageWithTimestamp
      })
    )

    // Add date separators
    const messagesWithDates: ChatItem[] = []
    let lastDate = ""

    for (const message of messagesWithTimestamps) {
      const messageDate = new Date(message._creationTime).toDateString()

      if (messageDate !== lastDate) {
        messagesWithDates.push({
          id: `separator-${message._creationTime}`,
          messageType: "date_separator",
          body: formatDateSeparator(message._creationTime),
          _creationTime: message._creationTime,
        } as DateSeparator)
        lastDate = messageDate
      }

      messagesWithDates.push(message)
    }

    return messagesWithDates
  }
})

export const sendToRoom = mutation({
  args: {
    body: v.string(),
    roomId: v.union(v.id("channels"), v.id("directMessages")),
    roomType: v.union(v.literal("channel"), v.literal("directMessage"))
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called sendToRoom without authentication!")
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()
    if (!user) {
      throw new Error("Unauthenticated call to mutation")
    }
    
    // Create message with appropriate room field
    const messageData: any = {
      body: args.body,
      author: user._id
    }
    
    if (args.roomType === "channel") {
      messageData.channel = args.roomId as Id<"channels">
    } else {
      messageData.directMessage = args.roomId as Id<"directMessages">
    }
    
    const newMessageId = await ctx.db.insert("messages", messageData)
    return newMessageId
  }
})

export const send = mutation({
  args: {
    body: v.string(),
    channel: v.id("channels")
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error("Called storeUser without authentication!")
    }
    const user = await ctx.db.query("users").withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier)).unique()
    if (!user) {
      throw new Error("Unauthicated call to mutation")
    }
    const newMessageId = await ctx.db.insert("messages", { body: args.body, author: user._id, channel: args.channel })
    return newMessageId
  }
})

export const list = query({
  args: {},
  handler: async (ctx, _args) => {
    const messages = await ctx.db.query('messages').take(50)
    return messages
  },
})

export const remove = mutation({
  args: { id: v.id('messages') },
  handler: async (ctx, args) => await ctx.db.delete(args.id)
})

"use client"

import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { api } from "../../../convex/_generated/api"
import { useChatroomStore } from "@/stores/chatroom.store"
import { z } from "zod"
import { Id, TableNames } from "../../../convex/_generated/dataModel"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Custom Zod type for Convex IDs
const convexId = <T extends TableNames>(tableName: T) =>
  z.custom<Id<T>>(
    (val) => typeof val === "string" && val.includes(tableName),
    { message: `Invalid ${tableName} ID` }
  )

// Your message schema with Convex ID validation
const messageSchema = z.object({
  body: z.string(),
})



function ChatBoard() {
  const currentRoom = useChatroomStore((state) => state.currentRoom)
  const { mutate } = useMutation({ mutationFn: useConvexMutation(api.messages.send) })
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      body: "",
    }
  })
  const { data: messages } = useQuery({
    ...convexQuery(api.messages.getForChannel, { id: currentRoom! }),
    enabled: !!currentRoom
  })

  if (!currentRoom) return <NoChannel />

  const onSubmit = (values: z.infer<typeof messageSchema>) => {
    const { body } = values
    mutate({ body, channel: currentRoom })
    console.log("Mutate Ran! Message Sent!")
  }

  return (
    <div className="w-full h-full grid grid-rows-[1fr_60px] border-r border-r-border">
      <div className="flex flex-col space-y-4 p-4">
        {messages?.map((item, index) => {
          if (item.messageType === "date_separator") {
            return (
              <div key={item.id} className="flex items-center justify-center my-6">
                <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full uppercase tracking-wide">
                  {item.body}
                </div>
              </div>
            );
          }

          return (
            <div key={index} className="flex items-start space-x-3 group hover:bg-gray-50 -mx-4 px-4 py-2 rounded-lg transition-colors">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {item.userName.slice(0, 1).toUpperCase() || "U"}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                {/* Header with name and timestamp */}
                <div className="flex items-baseline space-x-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">
                    {item.userName || 'Unknown User'}
                  </span>
                  <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.formattedTime}
                  </span>
                </div>

                {/* Message body */}
                <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {item.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="border-t border-t-border">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full h-full">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem className="h-full">
                  <FormControl>
                    <Input className="h-full rounded-none border-0" placeholder="Message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  )
}

export default ChatBoard

function NoChannel() {
  return (
    <div>Select a Channel to start!</div>
  )
}

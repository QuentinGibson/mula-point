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
      <div className="h-full">
        {messages && messages.map((message) => {
          return (
            <li key={message._id}>
              {message.body}
            </li>
          )
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
                    <Input className="h-full" placeholder="Message" {...field} />
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

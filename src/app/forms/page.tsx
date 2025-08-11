'use client'

import { convexQuery, useConvexMutation } from "@convex-dev/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { api } from "../../../convex/_generated/api"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { Authenticated, Unauthenticated } from "convex/react"
import Link from "next/link"

const formSchema = z.object({
  body: z.string(),
  author: z.string()
})

export default function FormPage() {
  return (
    <>
      <Authenticated>
        <div className="flex flex-col gap-12 justify-center items-center">
          <MessageForm />
        </div>
      </Authenticated>
      <Unauthenticated>
        <div>
          <Link href="/">Go back to home and signIn</Link>
        </div>
      </Unauthenticated>
    </>
  )
}

function MessageForm() {
  const { mutate } = useMutation({ mutationFn: useConvexMutation(api.messages.send) })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      body: "",
      author: "",
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { body } = values
    mutate({ body })
    console.log("Mutate Ran!")
  }

  return (
    <div className="max-w-3xl flex items-center justify-center mx-auto w-[400px]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Input placeholder="Enter message here..." {...field} />
                </FormControl>
                <FormDescription>
                  Enter the message to send
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type={"submit"}>Submit</Button>
        </form>
      </Form>
    </div>
  )
}



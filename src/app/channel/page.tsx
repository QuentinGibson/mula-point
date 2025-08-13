"use client"
import { useConvexMutation } from "@convex-dev/react-query"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import z from "zod"
import { api } from "../../../convex/_generated/api"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string(),
  slug: z.string()
})

function Channel() {
  const { mutate } = useMutation({ mutationFn: useConvexMutation(api.channels.create) })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: ""
    }
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { name, slug } = values
    mutate({ name, slug })
    console.log("Mutate Ran! Channel Create!")
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name here..." {...field} />
                </FormControl>
                <FormDescription>
                  Enter the name of the channel
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="Enter slug here..." {...field} />
                </FormControl>
                <FormDescription>
                  Enter the slug for the channel
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

export default Channel

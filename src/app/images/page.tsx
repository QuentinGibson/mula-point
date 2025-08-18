"use client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { convexQuery, useConvexMutation, useConvexQuery } from "@convex-dev/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { api } from "../../../convex/_generated/api"
import Image from "next/image"

function ImagePage() {
  const [picture, setPicture] = useState<File | null>(null)
  const generateUploadUrlConvex = useConvexMutation(api.image.generateUploadUrl)
  const { mutate: sendImage } = useMutation({ mutationFn: useConvexMutation(api.image.sendImage) })
  const { data: images } = useQuery(convexQuery(api.image.list, {}))

  const form = useForm()
  const onSubmit = async (data: any) => {
    console.log(data)
    const convexUploadUrl = await generateUploadUrlConvex({})
    const result = await fetch(convexUploadUrl, {
      method: "POST",
      headers: { "Content-Type": picture!.type },
      body: picture
    })
    const json = await result.json()
    if (!result.ok) {
      throw new Error(`Upload failed: ${JSON.stringify(json)}`);
    }
    const { storageId } = json;
    sendImage({ storageId });
  }
  return (
    <section className="mt-20">
      <div className="grid gap-12 grid-flow-row">
        <div className="w-[380px] mx-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="picture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Picture</FormLabel>
                    <FormControl>
                      <Input type="file" {...field} onChange={(e) => setPicture(e.target.files![0])} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </div>
        <div className="flex gap-4">
          {images?.map((image, index) => (
            <Image key={index} src={image.url!} height={300} width={300} alt="Working" />
          ))}
        </div>
      </div>
    </section>
  )
}

export default ImagePage

'use client'
import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useMutation, useQuery } from "@tanstack/react-query"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function Home() {
  return (
    <>
      <Authenticated>
        <UserButton />
        <Content />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  )
}

function Content() {
  const [message, setMessage] = useState("")
  const { data: messages, isPending, error } = useQuery(convexQuery(api.messages.getForCurrentUser, {}))
  const { user } = useUser()

  const { mutate, isPending: mutateIsPending } = useMutation({ mutationFn: useConvexMutation(api.messages.send) })

  return <div className="flex flex-col items-center justify-center gap-9">
    <p>Authenticated content: {messages?.length}</p>
    {
      user && (
        <form action="" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col justify-center gap-4">
            <Input type="text" onChange={(e) => setMessage(e.target.value)} defaultValue={message} />
            <Button type="submit" onClick={() => mutate({ body: message, author: user.primaryEmailAddress?.emailAddress })}>Sumbit</Button>
          </div>
        </form>
      )
    }
    <Button asChild>
      <Link href="/sample">Go to Sample Page</Link>
    </Button>
  </div>
}

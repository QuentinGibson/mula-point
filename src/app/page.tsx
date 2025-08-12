'use client'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useStoreUserEffect } from '@/hooks/useStoreUserEffect'

export default function Home() {
  const { isLoading, isAuthenticated } = useStoreUserEffect();
  return (
    <main>
      {isLoading ? (
        <>Loading...</>
      ) : !isAuthenticated ? (
        <SignInButton />
      ) : (
        <>
          <UserButton />
          <Content />
        </>
      )}
    </main>
  );
}

function Content() {
  const [message, setMessage] = useState("")
  const { data: homeChannel } = useSuspenseQuery(convexQuery(api.channels.getBySlug, { slug: "home" }))
  const { data: messages, isPending } = useSuspenseQuery(convexQuery(api.messages.getForChannel, { id: homeChannel._id }))

  const { mutate } = useMutation({ mutationFn: useConvexMutation(api.messages.send) })

  return <div className="flex flex-col items-center justify-center gap-12">
    <div className="flex flex-col gap-4">
      <p>Authenticated content: {messages.length}</p>
      <ul className='space-y-3'>
        {
          !isPending && (
            messages.map((message, index) => (
              <li key={index}>
                <div className='flex flex-col gap-1'>
                  <p>{message.body}</p>
                  <p>{message.userName}</p>
                </div>
              </li>
            ))
          )
        }
      </ul>
      <form action="" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col justify-center gap-4">
          <Input type="text" onChange={(e) => setMessage(e.target.value)} defaultValue={message} />
          <Button type="submit" onClick={() => mutate({ body: message, channel: homeChannel._id })}>Sumbit</Button>
        </div>
      </form>
    </div>
    <div className='grid grid-cols-3 gap-4'>
      <Button asChild>
        <Link href="/sample">Go to Sample Page</Link>
      </Button>
      <Button asChild>
        <Link href="/forms">Go to Forms Page</Link>
      </Button>
      <Button asChild>
        <Link href="/tables">Go to Tables Page</Link>
      </Button>
    </div>
  </div>
}

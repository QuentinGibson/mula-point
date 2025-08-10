'use client'
import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useQuery } from "@tanstack/react-query"
import Link from 'next/link'
import { Button } from '@/components/ui/button'

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
  const { data: messages, isPending, error } = useQuery(convexQuery(api.messages.getForCurrentUser, {}))
  return <div className="flex flex-col items-center justify-center">
    <p>Authenticated content: {messages?.length}</p>
    <Button asChild>
      <Link href="/sample">Go to Sample Page</Link>
    </Button>
  </div>
}

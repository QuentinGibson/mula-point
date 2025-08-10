'use client'
import { Authenticated, Unauthenticated } from 'convex/react'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'
import { useQuery } from "@tanstack/react-query"
import Link from 'next/link'

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
  return <div>
    <p>Authenticated content: {messages?.length}</p>
    <Link href="/sample">Go to Sample Page</Link>
  </div>
}

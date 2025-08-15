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
  return <div className="flex flex-col items-center justify-center gap-12">
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
      <Button asChild>
        <Link href="/chat">Go to Chat Page</Link>
      </Button>
      <Button asChild>
        <Link href="/videos">Go to Videos Page</Link>
      </Button>
    </div>
  </div>
}

'use client'
import { Authenticated } from "convex/react"
import { ReactNode } from "react"

function layout({ children }: { children: ReactNode }) {
  return (
    <Authenticated>
      <div>
        {children}
      </div>
    </Authenticated >
  )
}

export default layout

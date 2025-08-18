"use client"

import { ColumnDef } from "@tanstack/react-table"
import { api } from "../../../convex/_generated/api"
import { PaginatedQueryItem } from "convex/react"
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export type Payments = Awaited<PaginatedQueryItem<typeof api.payment.pageList>>

export const columns: ColumnDef<Payments>[] = [
  {
    accessorKey: "statusName",
    header: "Status"
  },
  {
    accessorKey: "userName",
    header: ({ column }) =>
      <Button
        variant="ghost"
        className="flex justify-center"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        UserName
        <ArrowUpDown />
      </Button>
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount)

      return <div className="text-right font-medium">{formatted}</div>
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open Menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment._id)}>
              Copy payment ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem >
              View Customer
            </DropdownMenuItem>
            <DropdownMenuItem>
              View payment details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]

"use client"
import { Table, TableBody, TableCell, TableHead, TableFooter, TableRow, TableHeader, TableCaption } from "@/components/ui/table";
import { useConvexPaginatedQuery, useConvexQuery } from "@convex-dev/react-query";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../../../convex/_generated/api";
import { usePaginatedQuery } from "convex/react";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function TablesPage() {
  const { results } = usePaginatedQuery(api.payment.pageList, {}, { initialNumItems: 50 })
  return (
    <section>
      <div className="max-w-3xl mx-auto py-10">
        <DataTable columns={columns} data={results} />
      </div>
    </section>
  )
}

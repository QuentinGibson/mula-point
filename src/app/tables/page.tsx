"use client"
import { convexQuery } from "@convex-dev/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default function TablesPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  
  const { data: results } = useSuspenseQuery({
    ...convexQuery(api.payment.pageList, { numItems: pageSize, offset: pageIndex * pageSize }),
  })
  
  return (
    <section>
      <div className="max-w-3xl mx-auto py-10">
        <DataTable 
          columns={columns} 
          data={results} 
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={setPageIndex}
          onPageSizeChange={setPageSize}
        />
      </div>
    </section>
  )
}

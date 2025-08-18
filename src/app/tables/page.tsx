import { Table, TableBody, TableCell, TableHead, TableFooter, TableRow, TableHeader, TableCaption } from "@/components/ui/table";

export default function TablesPage() {

  return (
    <Table>
      <TableCaption>
        A test table for future projects
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Time</TableHead>
        </TableRow>
      </TableHeader>
    </Table>
  )
}

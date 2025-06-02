"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationOptions,
  type PaginationState,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  ChevronDownIcon,
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  Columns3Icon,
  ChevronsUpDownIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PaginateQueryDto } from "@/types/pagination";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  renderToolbar?: (table: ReturnType<typeof useReactTable<TData>>) => React.ReactNode;
  filters?: Partial<PaginateQueryDto>;
  onFilterChange?: (dataFilters: Partial<PaginateQueryDto>) => void;
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean);
  enableColumnVisibility?: boolean;
  pagination?: PaginationState;
  paginationOptions?: PaginationOptions;
  sorting?: SortingState;
  onSortingChange?: (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => void;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  renderToolbar,
  enableRowSelection = false,
  enableColumnVisibility = true,
  pagination,
  sorting,
  paginationOptions,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Add selection column if enabled
  const tableColumns = useMemo(() => {
    const selectionColumn: ColumnDef<TData, TValue>[] = enableRowSelection
      ? [
          {
            id: "select",
            header: ({ table }) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
              />
            ),
            cell: ({ row }) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                disabled={typeof enableRowSelection === "function" && !enableRowSelection(row)}
              />
            ),
            size: 28,
            enableSorting: false,
            enableHiding: false,
          },
        ]
      : [];
    return [...selectionColumn, ...columns];
  }, [columns, enableRowSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection,
    defaultColumn: {
      enableSorting: false,
    },
    ...paginationOptions,
    manualPagination: true,
    manualSorting: true,
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    enableSortingRemoval: false,
  });

  return (
    <div className="space-y-4">
      {/* Toolbar Area */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">{renderToolbar?.(table)}</div>
        <div className="flex items-center gap-3">
          {/* Toggle columns visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Columns3Icon className="-ms-1 opacity-60" size={16} aria-hidden="true" />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    // Try to get a readable name, fallback to id
                    const header = column.columnDef.header;
                    const columnName = typeof header === "string" ? header : column.id;
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        onSelect={(event) => event.preventDefault()} // Keep menu open
                      >
                        {columnName}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-background overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  console.log("header column name is", header.column.columnDef.header);
                  console.log("header column can get sort is", header.column.getCanSort());
                  return (
                    <TableHead
                      key={header.id}
                      style={header.column.columnDef.size ? { width: `${header.getSize()}px` } : {}}
                      className="h-11"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="flex h-full select-none items-center justify-start gap-2 px-2 text-start font-bold -mx-2"
                              title={`Sort by ${header.id}`}
                              aria-label={`Sort by ${header.id}`}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getIsSorted() === "desc" ? (
                                <ChevronDownIcon className="ms-auto shrink-0 opacity-60" size={16} aria-hidden="true" />
                              ) : header.column.getIsSorted() === "asc" ? (
                                <ChevronUpIcon className="ms-auto shrink-0 opacity-60" size={16} aria-hidden="true" />
                              ) : (
                                <ChevronsUpDownIcon
                                  className="ms-auto shrink-0 opacity-30"
                                  size={16}
                                  aria-hidden="true"
                                />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onSelect={() => header.column.toggleSorting(false)}>
                              <div className="flex items-center gap-2">
                                <ChevronUpIcon className="ms-auto shrink-0 opacity-60" size={16} aria-hidden="true" />
                                Asc
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => header.column.toggleSorting(true)}>
                              <div className="flex items-center gap-2">
                                <ChevronDownIcon className="ms-auto shrink-0 opacity-60" size={16} aria-hidden="true" />
                                Desc
                              </div>
                            </DropdownMenuItem>
                            {header.column.getIsSorted() && (
                              <DropdownMenuItem onSelect={() => header.column.clearSorting()}>
                                Clear sort
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-8">
        {/* Row selection info */}
        {enableRowSelection && (
          <div className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
            selected.
          </div>
        )}

        {/* Results per page */}
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center gap-3", !enableRowSelection && "grow")}>
            <Label htmlFor="rows-per-page" className="max-sm:sr-only">
              Rows per page
            </Label>
            <Select
              value={table.getState().pagination.pageSize.toString()}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger id="rows-per-page" className="w-fit whitespace-nowrap">
                <SelectValue placeholder="Select number of results" />
              </SelectTrigger>
              <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                {[5, 10, 25, 50, 100].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page number information */}
          <div className="text-muted-foreground flex grow justify-center text-sm whitespace-nowrap">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>

          {/* Pagination buttons */}
          <div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to first page"
                  >
                    <ChevronFirstIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    aria-label="Go to previous page"
                  >
                    <ChevronLeftIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to next page"
                  >
                    <ChevronRightIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                    aria-label="Go to last page"
                  >
                    <ChevronLastIcon size={16} aria-hidden="true" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}

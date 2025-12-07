// src/components/DataTable.tsx
import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  SortingState,
  ColumnDef,
  ColumnFiltersState,
  CellContext,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
  stickyHeader?: boolean;
  headerClassName?: string;
  rowClassName?: (row: T) => string;
}

export function DataTable<T>({
  data,
  columns,
  enableSorting = true,
  enableFiltering = false,
  stickyHeader = true,
  headerClassName = 'bg-gray-200 dark:bg-gray-700',
  rowClassName,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
  });

  const SortIcon = ({ isSorted }: { isSorted: false | 'asc' | 'desc' }) => {
    if (isSorted === 'asc') {
      return <ChevronUp className="w-4 h-4 inline-block ml-1" />;
    }
    if (isSorted === 'desc') {
      return <ChevronDown className="w-4 h-4 inline-block ml-1" />;
    }
    return <ChevronsUpDown className="w-3 h-3 inline-block ml-1 opacity-40" />;
  };

  return (
    <table className="w-full text-xs border-collapse">
      <thead className={stickyHeader ? 'sticky top-0 z-10' : ''}>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={headerClassName}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const isSorted = header.column.getIsSorted();
              const meta = header.column.columnDef.meta as { className?: string; headerClassName?: string } | undefined;

              return (
                <th
                  key={header.id}
                  className={`px-2 py-2 border border-gray-400 dark:border-gray-600 font-semibold dark:text-gray-200 ${meta?.headerClassName || ''} ${headerClassName}`}
                  onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                  style={{ cursor: canSort ? 'pointer' : 'default' }}
                >
                  <div className="flex items-center justify-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {enableSorting && canSort && <SortIcon isSorted={isSorted} />}
                  </div>
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => {
          const customRowClass = rowClassName ? rowClassName(row.original) : '';

          return (
            <tr
              key={row.id}
              className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${customRowClass}`}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as { className?: string; cellClassName?: (props: CellContext<T, unknown>) => string } | undefined;
                const cellClassName = meta?.cellClassName
                  ? meta.cellClassName(cell.getContext())
                  : meta?.className || '';

                return (
                  <td
                    key={cell.id}
                    className={`px-2 py-1 border border-gray-300 dark:border-gray-600 dark:text-gray-200 ${cellClassName}`}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default DataTable;

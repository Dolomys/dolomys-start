import { useGetCreatorsAdmin } from "../../api/get-creators-admin";
import { DataTable } from "@/components/data-table/data-table";
import { useMemo } from "react";
import { CREATOR_COLUMNS } from "./columns";
import { useTableFilters } from "@/hooks/use-filters";
import { type PaginationState } from "@tanstack/react-table";
import CreatorsTableToolbar from "./creators-table-toolbar";

export function CreatorsTable() {
  const { filters, setFilters } = useTableFilters();

  const paginationState: PaginationState = {
    pageIndex: filters.pageIndex ?? 1,
    pageSize: filters.pageSize ?? 10,
  };

  const columns = useMemo(() => CREATOR_COLUMNS, []);
  const { data } = useGetCreatorsAdmin(filters);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        renderToolbar={() => <CreatorsTableToolbar />}
        enableRowSelection
        pagination={paginationState}
        paginationOptions={{
          onPaginationChange: (pagination) => {
            setFilters(typeof pagination === "function" ? pagination(paginationState) : pagination);
          },
          rowCount: data?.metadata.total,
        }}
        filters={filters}
        onFilterChange={(filters) => setFilters(filters)}
        data={data?.data ?? []}
      />
    </div>
  );
}

import { DataTableFacetedFilter } from "@/components/data-table/data-table-filter";
import { WebsiteType, CreatorStatusAdmin } from "../../types/creator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloseCircle } from "iconsax-reactjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ArrowUpNarrowWide, Check } from "lucide-react";
import { useTableFilters } from "@/hooks/use-filters";

const CreatorsTableToolbar = () => {
  const { filters, resetFilters, setFilters } = useTableFilters();

  const handleSort = (sortBy: string, direction?: "asc" | "desc") => {
    const currentSortBy = filters.sortBy;
    const currentSortDirection = filters.sortDirection;

    let newSortDirection: "asc" | "desc";

    if (direction) {
      newSortDirection = direction;
    } else {
      newSortDirection = currentSortBy === sortBy && currentSortDirection === "asc" ? "desc" : "asc";
    }

    setFilters({ ...filters, sortBy, sortDirection: newSortDirection });
  };

  const isSortingBy = (sortBy: string) => filters.sortBy === sortBy;
  const sortDirection = filters.sortDirection;

  return (
    <div className="flex flex-row items-center gap-2">
      <Input
        placeholder="Search"
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        value={filters.search || ""}
      />
      <DataTableFacetedFilter
        title="Status"
        options={[
          { label: "Visible", value: CreatorStatusAdmin.VISIBLE },
          { label: "Invisible", value: CreatorStatusAdmin.INVISIBLE },
          { label: "Blocked", value: CreatorStatusAdmin.BLOCKED },
          { label: "Discover Only", value: CreatorStatusAdmin.DISCOVER_ONLY },
        ]}
        selectedValues={filters.creatorStatus ? new Set(filters.creatorStatus) : new Set()}
        onFilterChange={(filter) => setFilters({ ...filters, creatorStatus: filter })}
      />
      <DataTableFacetedFilter
        title="Content Type"
        selectedValues={filters.creatorContentType ? new Set(filters.creatorContentType) : new Set()}
        options={[
          { label: "Porn", value: WebsiteType.PORN },
          { label: "Erotic", value: WebsiteType.EROTIC },
        ]}
        onFilterChange={(filter) => setFilters({ ...filters, creatorContentType: filter })}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto hidden h-8 lg:flex">
            <ArrowUpNarrowWide className="mr-2 h-4 w-4" />
            Sort by
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>Score</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => handleSort("crea_scoring", "asc")}>
                  Ascending
                  {isSortingBy("crea_scoring") && sortDirection === "asc" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("crea_scoring", "desc")}>
                  Descending
                  {isSortingBy("crea_scoring") && sortDirection === "desc" && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          {/* Add other sort options here later as DropdownMenuSub or DropdownMenuItem */}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="ghost" size="sm" onClick={resetFilters}>
        <CloseCircle className="h-4 w-4" />
        Reset
      </Button>
    </div>
  );
};

export default CreatorsTableToolbar;

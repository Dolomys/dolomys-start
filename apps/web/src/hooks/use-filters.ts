import { useSearch, useNavigate } from "@tanstack/react-router";
import { cleanEmptyParams } from "@/utils/cleanEmptyParams";

export function useTableFilters<TSearch extends Record<string, any>>() {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();

  const setFilters = (patch: Partial<TSearch>) => {
    navigate({
      search: cleanEmptyParams({ ...search, ...patch }) as any,
    });
  };

  const resetFilters = () => {
    navigate({ search: {} as any });
  };

  return {
    filters: search,
    setFilters,
    resetFilters,
  };
}

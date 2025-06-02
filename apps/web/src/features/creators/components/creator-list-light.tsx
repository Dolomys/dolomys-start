import { useGetCreatorsAdmin } from "../api/get-creators-admin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { CreatorStatusAdmin } from "../types/creator";

export function CreatorListLight({ search, onSelect }: { search?: string; onSelect: (id: string) => void }) {
  const { data, isLoading } = useGetCreatorsAdmin({
    pageIndex: 0,
    pageSize: 100,
    sortDirection: "desc",
    search,
    creatorStatus: [CreatorStatusAdmin.VISIBLE],
  });

  if (isLoading) {
    return <div>Loading creators...</div>;
  }

  return (
    <div className="flex flex-col gap-2">
      {data?.data?.map((creator) => (
        <Card key={creator.id} className="overflow-hidden py-2 w-full" onClick={() => onSelect(creator.id)}>
          <CardContent className="flex flex-row items-center gap-2 px-1">
            <Avatar>
              <AvatarImage src={creator.profilePicture || undefined} alt={creator.username ?? "Creator"} />
              <AvatarFallback>{(creator.username ?? "??").substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold text-sm">{creator.username ?? "Unknown Creator"}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

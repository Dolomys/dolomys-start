import { ContentTable } from "@/features/content-moderation/components/table/content-table";
import type { GetCreatorAdminDto } from "@/features/creators/types/creator";

interface CreatorContentTabProps {
  creator: GetCreatorAdminDto;
}

export function CreatorContentTab({ creator }: CreatorContentTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Content</h2>
      <ContentTable creatorId={creator.id} />
    </div>
  );
}

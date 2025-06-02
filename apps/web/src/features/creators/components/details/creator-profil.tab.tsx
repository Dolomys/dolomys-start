import { Card } from "@/components/ui/card";
import type { GetCreatorAdminDto } from "@/features/creators/types/creator";

export function CreatorProfileTab({ creator }: { creator: GetCreatorAdminDto }) {
  return (
    <Card className="flex gap-6 p-6">
      <img
        src={creator.profilePicture ?? "/placeholder.png"}
        alt={creator.username ?? "No username"}
        className="w-32 h-32 rounded-full object-cover border"
      />
      <div>
        <h2 className="text-2xl font-bold">{creator.username}</h2>
        <p className="text-muted-foreground">{creator.email}</p>
        <p>{creator.caption}</p>
        <div className="mt-2 flex gap-4">
          <span>Status: {creator.status}</span>
          <span>Type: {creator.contentType}</span>
        </div>
        <div className="mt-2">
          <span>Followers: {creator.followersCount}</span>
          <span className="ml-4">Posts: {creator.postsCount}</span>
        </div>
      </div>
    </Card>
  );
}

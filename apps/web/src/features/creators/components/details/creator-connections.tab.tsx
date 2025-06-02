import { Card } from "@/components/ui/card";
import type { GetCreatorAdminDto } from "@/features/creators/types/creator";

export function CreatorConnectionsTab({ creator }: { creator: GetCreatorAdminDto }) {
  const { socials } = creator;
  return (
    <Card className="p-6">
      <div>Instagram: {socials.instagram ?? "N/A"}</div>
      <div>Twitter: {socials.twitter ?? "N/A"}</div>
      <div>Website: {socials.website ?? "N/A"}</div>
      <div>Other: {socials.other ?? "N/A"}</div>
    </Card>
  );
}

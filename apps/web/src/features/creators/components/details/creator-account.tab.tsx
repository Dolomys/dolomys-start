import { Card } from "@/components/ui/card";
import type { GetCreatorAdminDto } from "@/features/creators/types/creator";

export function CreatorAccountTab({ creator }: { creator: GetCreatorAdminDto }) {
  return (
    <Card className="p-6">
      <div>First Name: {creator.firstName}</div>
      <div>Last Name: {creator.lastName}</div>
      <div>Gender: {creator.gender}</div>
      <div>Company: {creator.companyInfo?.companyName ?? "N/A"}</div>
      <div>Phone: {creator.phoneNumber}</div>
      <div>Country: {creator.country}</div>
    </Card>
  );
}

import type { GetCreatorAdminDto } from "@/features/creators/types/creator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CreatorStatusTabProps {
  creator: GetCreatorAdminDto;
}

function formatStatus(status: string | null) {
  if (!status) return <Badge variant="outline">N/A</Badge>;

  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  switch (status) {
    case "ACTIVE":
      variant = "default";
      break;
    case "BLOCKED":
      variant = "destructive";
      break;
    default:
      variant = "secondary";
  }
  return <Badge variant={variant}>{status}</Badge>;
}

export function CreatorStatusTab({ creator }: CreatorStatusTabProps) {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold tracking-tight mb-4">Status</h2>
      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="mt-1">{formatStatus(creator.status)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Onboarding</div>
            <div className="mt-1">{formatStatus(creator.onboardingStatus)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">KYC</div>
            <div className="mt-1">{formatStatus(creator.kycStatus)}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">KYC Result Date</div>
            <div className="mt-1">
              {creator.kycResultDate ? new Date(creator.kycResultDate).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Acceptation Date</div>
            <div className="mt-1">
              {creator.acceptationDate ? new Date(creator.acceptationDate).toLocaleDateString() : "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Scoring</div>
            <div className="mt-1">{creator.scoring}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Account Balance</div>
            <div className="mt-1">{creator.accountBalance ? `${creator.accountBalance} €` : "0 €"}</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

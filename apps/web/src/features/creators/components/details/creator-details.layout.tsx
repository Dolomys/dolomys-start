import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreatorAccountTab } from "@/features/creators/components/details/creator-account.tab";
import { CreatorBankingTab } from "@/features/creators/components/details/creator-banking.tab";
import { CreatorConnectionsTab } from "@/features/creators/components/details/creator-connections.tab";
import { CreatorContentTab } from "@/features/creators/components/details/creator-content.tab";
import { CreatorProfileTab } from "@/features/creators/components/details/creator-profil.tab";
import { CreatorStatusTab } from "@/features/creators/components/details/creator-status.tab";
import { CreatorTransactionsTab } from "@/features/creators/components/details/creator-transactions.tab";
import type { GetCreatorAdminDto } from "@/features/creators/types/creator";

interface CreatorDetailsLayoutProps {
  creator: GetCreatorAdminDto; // We'll pass the fetched creator data here
}

export function CreatorDetailsLayout({ creator }: CreatorDetailsLayoutProps) {
  if (!creator) {
    return <div>Loading creator details...</div>; // Or a spinner
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="status">Status</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="account">Account & Verification</TabsTrigger>
        <TabsTrigger value="connections">Connections</TabsTrigger>
        <TabsTrigger value="banking">Banking</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <CreatorProfileTab creator={creator} />
      </TabsContent>
      <TabsContent value="status">
        <CreatorStatusTab creator={creator} />
      </TabsContent>
      <TabsContent value="content">
        <CreatorContentTab creator={creator} />
      </TabsContent>
      <TabsContent value="account">
        <CreatorAccountTab creator={creator} />
      </TabsContent>
      <TabsContent value="connections">
        <CreatorConnectionsTab creator={creator} />
      </TabsContent>
      <TabsContent value="banking">
        <CreatorBankingTab creator={creator} />
      </TabsContent>
      <TabsContent value="transactions">
        <CreatorTransactionsTab creatorId={creator.id} />
      </TabsContent>
    </Tabs>
  );
}

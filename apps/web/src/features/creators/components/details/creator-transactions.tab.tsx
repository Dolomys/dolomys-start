import { TransactionsTable } from "@/features/transactions/components/table/transactions-table";

export function CreatorTransactionsTab({ creatorId }: { creatorId: string }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
      <TransactionsTable creatorId={creatorId} />
    </div>
  );
}

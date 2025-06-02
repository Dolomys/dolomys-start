import { Card } from "@/components/ui/card";
import type { GetCreatorAdminDto } from "@/features/creators/types/creator";

export function CreatorBankingTab({ creator }: { creator: GetCreatorAdminDto }) {
  const { bankingInfo } = creator;
  return (
    <Card className="p-6">
      <div>IBAN: {bankingInfo.iban ?? "N/A"}</div>
      <div>Bank Name: {bankingInfo.bankName ?? "N/A"}</div>
      <div>Bank Address: {bankingInfo.bankAddress ?? "N/A"}</div>
      <div>Account Number: {bankingInfo.bankAccountNumber ?? "N/A"}</div>
      <div>Account Holder: {bankingInfo.bankAccountHolderName ?? "N/A"}</div>
    </Card>
  );
}

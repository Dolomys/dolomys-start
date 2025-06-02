import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCreatorAdmin } from "../../api/update-creator-admin";
import type { GetCreatorsLightAdminDto } from "../../types/creator";
import { Loader2 } from "lucide-react";

interface UpdateCreatorScoreModalProps {
  creator: GetCreatorsLightAdminDto;
  trigger: React.ReactNode;
}

export function UpdateCreatorScoreModal({ creator, trigger }: UpdateCreatorScoreModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newScore, setNewScore] = useState<number | string>(creator.scoring);
  const updateMutation = useUpdateCreatorAdmin();

  const handleSave = () => {
    if (!creator.username) return;

    const scoreValue = typeof newScore === "string" ? parseFloat(newScore) : newScore;

    if (isNaN(scoreValue)) {
      // Handle invalid number input (e.g., show error message)
      console.error("Invalid score value");
      return;
    }

    updateMutation.mutate(
      { creatorUsername: creator.username, data: { score: scoreValue } },
      {
        onSuccess: () => {
          setIsOpen(false);
          // Optionally add success toast
        },
        onError: (error: Error) => {
          console.error("Failed to update creator score:", error);
          // Optionally add error toast
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Score for {creator.username}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="score" className="text-right">
              Score
            </Label>
            <Input
              id="score"
              type="number"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)} // Store as string temporarily
              className="col-span-3"
              step="0.1" // Allow decimals if needed
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={updateMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Score
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

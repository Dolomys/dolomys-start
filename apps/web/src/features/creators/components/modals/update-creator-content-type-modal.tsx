import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { GetCreatorsLightAdminDto } from "../../types/creator";
import { WebsiteType } from "../../types/creator";
import { useUpdateCreatorAdmin } from "../../api/update-creator-admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface UpdateCreatorContentTypeModalProps {
  trigger: React.ReactNode;
  creator: GetCreatorsLightAdminDto;
}

const contentTypeOptions = [
  { label: "Porn", value: WebsiteType.PORN },
  { label: "Erotic", value: WebsiteType.EROTIC },
];

export function UpdateCreatorContentTypeModal({ trigger, creator }: UpdateCreatorContentTypeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<WebsiteType>(creator.contentType);
  const updateMutation = useUpdateCreatorAdmin();

  const handleSave = () => {
    if (!creator.username || selectedType === creator.contentType) {
      setIsOpen(false); // Close if no change or no username
      return;
    }

    updateMutation.mutate(
      { creatorUsername: creator.username, data: { contentType: selectedType } },
      {
        onSuccess: () => {
          setIsOpen(false);
          // Optionally show success toast
        },
        onError: (error: Error) => {
          console.error("Failed to update creator content type:", error);
          // Optionally show error toast
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Content Type for {creator.username || "Creator"}</DialogTitle>
        </DialogHeader>

        <Select value={selectedType} onValueChange={(value) => setSelectedType(value as WebsiteType)}>
          <SelectTrigger>
            <SelectValue placeholder="Select content type" />
          </SelectTrigger>
          <SelectContent>
            {contentTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={updateMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={updateMutation.isPending || selectedType === creator.contentType}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

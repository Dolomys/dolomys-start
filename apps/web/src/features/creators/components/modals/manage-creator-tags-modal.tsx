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
import { useState, useMemo, useEffect } from "react";
import { useUpdateCreatorAdmin } from "../../api/update-creator-admin";
import { useGetAdminTagsAdmin } from "@/features/admin-tags/api/get-admin-tags";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SortDirection } from "@/types/api-response";
import { useGetCreatorAdmin } from "../../api/get-creator-by-username-admin";
import type { GetAdminTagDto } from "@/features/admin-tags/types/types";

interface ManageCreatorTagsModalProps {
  trigger: React.ReactNode;
  creatorUsername: string;
}

export function ManageCreatorTagsModal({ trigger, creatorUsername }: ManageCreatorTagsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: creator } = useGetCreatorAdmin({ creatorUsername });

  const [selectedTags, setSelectedTags] = useState<GetAdminTagDto[]>([]);

  useEffect(() => {
    if (creator?.tags) {
      const currentIds = new Set(selectedTags.map((t) => t.id));
      const initialIds = new Set(creator.tags.map((t) => t.id));
      if (currentIds.size !== initialIds.size || ![...currentIds].every((id) => initialIds.has(id))) {
        setSelectedTags(creator.tags);
      }
    }
  }, [creator?.tags]);

  const { data: tagsData, isLoading: isLoadingTags } = useGetAdminTagsAdmin({
    pageSize: 100,
    pageIndex: 0,
    sortDirection: SortDirection.DESC,
  });

  const updateMutation = useUpdateCreatorAdmin();

  const availableCreatorTags = useMemo(() => {
    return (tagsData?.data ?? []).filter((tag) => tag.type === "CREATOR_PRIMARY" || tag.type === "CREATOR_SECONDARY");
  }, [tagsData]);

  const handleSelectTag = (tagId: string) => {
    const tagToAddOrRemove = availableCreatorTags.find((tag) => tag.id === tagId);
    if (!tagToAddOrRemove) return;

    setSelectedTags((prevSelectedTags) => {
      const isAlreadySelected = prevSelectedTags.some((tag) => tag.id === tagId);
      if (isAlreadySelected) {
        return prevSelectedTags.filter((tag) => tag.id !== tagId);
      } else {
        return [...prevSelectedTags, tagToAddOrRemove];
      }
    });
  };

  const handleSave = () => {
    if (!creator?.username) return;

    updateMutation.mutate(
      { creatorUsername: creator.username, data: { tags: selectedTags.map((tag) => tag.id) } },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
        onError: (error: Error) => {
          console.error("Failed to update creator tags:", error);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Tags for {creator?.username || "Creator"}</DialogTitle>
        </DialogHeader>

        <Command className="relative">
          <CommandInput placeholder="Search tags..." />
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                {tag.name}
                <button
                  onClick={() => handleSelectTag(tag.id)}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                  aria-label={`Remove ${tag.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <ScrollArea className="h-48">
              <CommandGroup heading="Available Tags">
                {isLoadingTags && <CommandItem disabled>Loading tags...</CommandItem>}
                {availableCreatorTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelectTag(tag.id)}
                    className={`cursor-pointer ${selectedTags.some((selected) => selected.id === tag.id) ? "bg-accent" : ""}`}
                  >
                    {tag.name} ({tag.type})
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          </CommandList>
        </Command>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={updateMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

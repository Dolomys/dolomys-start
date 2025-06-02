import { type ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Tags, Edit, Eye, TrendingUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import { Link } from "@tanstack/react-router";
import type { CreatorStatusAdmin, GetCreatorsLightAdminDto } from "../../types/creator";
import type { WebsiteType } from "@/features/users/types/types";
import { UpdateCreatorContentTypeModal } from "../modals/update-creator-content-type-modal";
import { UpdateCreatorScoreModal } from "../modals/update-creator-score-modal";
import { ManageCreatorTagsModal } from "../modals/manage-creator-tags-modal";
function formatStatusBadge(status: CreatorStatusAdmin) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
  switch (status) {
    case "VISIBLE":
      variant = "default";
      break;
    case "BLOCKED":
      variant = "destructive";
      break;
    case "INVISIBLE":
    case "DISCOVER_ONLY":
      variant = "outline";
      break;
  }
  return <Badge variant={variant}>{status.replace("_", " ")}</Badge>;
}

function formatContentTypeBadge(type: WebsiteType) {
  let variant: "porn" | "erotic" = "erotic";
  switch (type) {
    case "PORN":
      variant = "porn";
      break;
    case "EROTIC":
      variant = "erotic";
  }
  return <Badge variant={variant}>{type}</Badge>;
}

export const CREATOR_COLUMNS: ColumnDef<GetCreatorsLightAdminDto>[] = [
  {
    accessorKey: "username",
    size: 250,
    header: () => <p className="font-medium">Creator</p>,
    cell: ({ row }) => {
      const creator = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={creator.profilePicture ?? undefined} alt={creator.username ?? "Creator"} />
            <AvatarFallback>{creator.username?.charAt(0).toUpperCase() ?? "C"}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{creator.username ?? "N/A"}</span>
            <span className="text-xs text-muted-foreground">
              {creator.firstName} {creator.lastName}
            </span>
            <span className="text-xs text-muted-foreground">{creator.email}</span>
          </div>
        </div>
      );
    },
  },
  // Status
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => formatStatusBadge(row.original.status),
    filterFn: (row, id, value) => value.includes(row.getValue(id)), // Example filter
  },
  // Content Type
  {
    accessorKey: "contentType",
    header: "Content Type",
    cell: ({ row }) => formatContentTypeBadge(row.original.contentType),
    filterFn: (row, id, value) => value.includes(row.getValue(id)), // Example filter
  },
  // Scoring
  {
    accessorKey: "scoring",
    header: "Score",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  // Country
  {
    accessorKey: "country",
    header: "Country",
  },
  // Creation Date
  {
    accessorKey: "acceptationDate",
    header: () => <p>Date d'acceptation</p>,
    cell: ({ row }) => {
      const date = row.original.acceptationDate ? new Date(row.original.acceptationDate) : null;
      return date ? date.toLocaleDateString() : "-";
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const creator = row.original;

      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {creator.username && (
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link
                    to={`/creators/$creatorUsername`}
                    params={{ creatorUsername: creator.username }}
                    className="flex items-center gap-2 w-full"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    See Profile
                  </Link>
                </DropdownMenuItem>
                <ManageCreatorTagsModal
                  creatorUsername={creator.username}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Tags className="mr-2 h-4 w-4" />
                      Manage Tags
                    </DropdownMenuItem>
                  }
                />
                <UpdateCreatorContentTypeModal
                  creator={creator}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="mr-2 h-4 w-4" />
                      Update Content Type
                    </DropdownMenuItem>
                  }
                />
                <UpdateCreatorScoreModal
                  creator={creator}
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Update Score
                    </DropdownMenuItem>
                  }
                />
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      );
    },
  },
];

export const CREATOR_LIGHT_COLUMNS: ColumnDef<GetCreatorsLightAdminDto>[] = [
  {
    accessorKey: "username",
    size: 250,
  },
  {
    accessorKey: "contentType",
    header: "Content Type",
    cell: ({ row }) => formatContentTypeBadge(row.original.contentType),
  },
  {
    accessorKey: "scoring",
    header: "Score",
  },
];

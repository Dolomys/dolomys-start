import { Archive, Gauge, Medal, NotebookPen, Pen, Settings, Star, Users } from "lucide-react";

// Define the types based on the example and our needs
export interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  items?: NavItem[]; // For nested items
  badge?: string;
}

export interface NavGroupData {
  title?: string; // Optional title for the group
  items: NavItem[];
}

export interface SidebarData {
  navGroups: NavGroupData[];
}

export const sidebarData: SidebarData = {
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/", // Root path for dashboard
          icon: Gauge,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Posts",
          url: "/posts", // Example path
          icon: NotebookPen,
        },
        {
          title: "Favoris",
          url: "/favorites", // Example path
          icon: Medal,
        },
        {
          title: "Content",
          url: "/content", // Example path
          icon: Pen,
        },
        {
          title: "Archives",
          url: "/archives", // Example path
          icon: Archive,
        },
      ],
    },
    {
      title: "Autres",
      items: [
        {
          title: "Concurrents",
          url: "/concurrents",
          icon: Users,
        },
        {
          title: "Posts Favoris",
          url: "/favorites-posts",
          icon: Star,
        },
      ],
    },
    {
      title: "System", // Renamed from Other
      items: [
        {
          title: "Settings",
          url: "/settings", // Example path
          icon: Settings,
        },
      ],
    },
  ],
};

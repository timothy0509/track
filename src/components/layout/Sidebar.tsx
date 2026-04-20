import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Clock,
  ListTodo,
  FolderKanban,
  Users,
  BarChart3,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
  Tag,
  CheckSquare,
  Star,
  Share2,
  Calendar,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { icon: Clock, label: "Timer", href: "/timer" },
  { icon: ListTodo, label: "Entries", href: "/entries" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: Star, label: "Favorites", href: "/favorites" },
  { icon: Share2, label: "Shared", href: "/shared" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { icon: Users, label: "Teams", href: "/teams" },
  { icon: UserCog, label: "Members", href: "/members" },
  { icon: Tag, label: "Tags", href: "/tags" },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle, className }: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link to="/timer" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
            <Clock className="h-5 w-5" />
            <span>TimoTrack</span>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      <div className="border-t p-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/timer"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">Settings</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}

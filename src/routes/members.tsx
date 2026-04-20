import * as React from "react";
import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./__root";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MemberInvite } from "@/components/members/MemberInvite";
import { MemberRoleSelect } from "@/components/members/MemberRoleSelect";
import { useWorkspacePermissions } from "@/hooks/useWorkspacePermissions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Trash2, Users } from "lucide-react";

type Role = "admin" | "projectManager" | "user";
type Status = "active" | "invited" | "suspended";

interface Member {
  _id: string;
  workspaceId: string;
  userId: string;
  role: Role;
  status: Status;
  inviteEmail?: string;
  invitedAt: number;
  invitedBy: string;
  joinedAt?: number;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

const mockMembers: Member[] = [
  {
    _id: "1",
    workspaceId: "ws1",
    userId: "u1",
    role: "admin",
    status: "active",
    invitedAt: Date.now() - 86400000 * 30,
    invitedBy: "u1",
    joinedAt: Date.now() - 86400000 * 30,
    user: {
      id: "u1",
      name: "Timo",
      email: "timo@example.com",
    },
  },
  {
    _id: "2",
    workspaceId: "ws1",
    userId: "u2",
    role: "projectManager",
    status: "active",
    invitedAt: Date.now() - 86400000 * 10,
    invitedBy: "u1",
    joinedAt: Date.now() - 86400000 * 10,
    user: {
      id: "u2",
      name: "Jane Doe",
      email: "jane@example.com",
    },
  },
  {
    _id: "3",
    workspaceId: "ws1",
    userId: "u3",
    role: "user",
    status: "invited",
    inviteEmail: "new@example.com",
    invitedAt: Date.now() - 86400000,
    invitedBy: "u1",
    user: {
      id: "u1",
      name: "Timo",
      email: "timo@example.com",
    },
  },
];

export const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/members",
  component: MembersComponent,
});

function MembersComponent() {
  const [members, setMembers] = React.useState<Member[]>(mockMembers);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [inviteLoading, setInviteLoading] = React.useState(false);
  const { isAdmin, canManageMembers } = useWorkspacePermissions("admin");

  const handleInvite = async (
    email: string,
    role: "admin" | "projectManager" | "user"
  ) => {
    setInviteLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const newMember: Member = {
      _id: String(Date.now()),
      workspaceId: "ws1",
      userId: "u1",
      role,
      status: "invited",
      inviteEmail: email,
      invitedAt: Date.now(),
      invitedBy: "u1",
      user: {
        id: "u1",
        name: "Timo",
        email: "timo@example.com",
      },
    };
    setMembers([...members, newMember]);
    setInviteLoading(false);
    setInviteOpen(false);
  };

  const handleRoleChange = async (memberId: string, newRole: Role) => {
    setMembers(
      members.map((m) => (m._id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleRemove = async (memberId: string) => {
    setMembers(members.filter((m) => m._id !== memberId));
  };

  const statusColor: Record<Status, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    invited: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const roleLabel: Record<Role, string> = {
    admin: "Admin",
    projectManager: "Project Manager",
    user: "User",
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Members</h1>
        </div>
        {canManageMembers && (
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        )}
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              {isAdmin && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image} />
                      <AvatarFallback>
                        {member.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.inviteEmail || member.user.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {isAdmin && member.status === "active" ? (
                    <MemberRoleSelect
                      value={member.role}
                      onValueChange={(role) => handleRoleChange(member._id, role)}
                    />
                  ) : (
                    <span className="text-sm">{roleLabel[member.role]}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={statusColor[member.status]}
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {member.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString()
                    : "Pending"}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    {member.status === "active" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(member._id)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MemberInvite
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onInvite={handleInvite}
        isLoading={inviteLoading}
      />
    </div>
  );
}

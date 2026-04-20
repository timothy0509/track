import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "admin" | "projectManager" | "user";

interface MemberRoleSelectProps {
  value: Role;
  onValueChange: (role: Role) => void;
  disabled?: boolean;
}

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  projectManager: "Project Manager",
  user: "User",
};

export function MemberRoleSelect({
  value,
  onValueChange,
  disabled,
}: MemberRoleSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(v: Role) => onValueChange(v)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">{roleLabels.user}</SelectItem>
        <SelectItem value="projectManager">{roleLabels.projectManager}</SelectItem>
        <SelectItem value="admin">{roleLabels.admin}</SelectItem>
      </SelectContent>
    </Select>
  );
}

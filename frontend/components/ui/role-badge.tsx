type Role = "HUMAN" | "AI" | "SYSTEM";

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    HUMAN: "bg-blue-100 text-blue-700",
    AI: "bg-green-100 text-green-700",
    SYSTEM: "bg-gray-200 text-gray-700",
  };
  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${styles[role]}`}>
      {role}
    </span>
  );
}

export default RoleBadge;

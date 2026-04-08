import type { AssistantConversation } from "@/types/database";
import Link from "next/link";

interface SessionsTableProps {
  conversations: AssistantConversation[];
}

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  active: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E", label: "Active" },
  paused: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308", label: "Paused" },
  completed: {
    bg: "rgba(59, 130, 246, 0.1)",
    text: "#3B82F6",
    label: "Completed",
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === 0) return "—";
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

function formatSectionsCovered(sections: number[]): string {
  if (!sections || sections.length === 0) return "—";
  return sections.join(", ");
}

export function SessionsTable({ conversations }: SessionsTableProps) {
  if (conversations.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχουν συνομιλίες ακόμα
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        backgroundColor: "var(--gray-900)",
        borderColor: "var(--gray-700)",
      }}
    >
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b" style={{ borderColor: "var(--gray-700)" }}>
            {[
              "Status",
              "Τελευταίο Section",
              "Sections",
              "Διάρκεια",
              "Ημ/νία",
            ].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--gray-500)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {conversations.map((conversation) => {
            const status =
              STATUS_STYLES[conversation.status] ?? STATUS_STYLES.active;
            return (
              <tr
                key={conversation.id}
                className="border-b last:border-b-0 transition-colors"
                style={{ borderColor: "var(--gray-700)" }}
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/conversations/${conversation.id}`}
                    className="hover:underline"
                  >
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: status.bg,
                        color: status.text,
                      }}
                    >
                      {status.label}
                    </span>
                  </Link>
                </td>
                <td className="px-5 py-3" style={{ color: "var(--gray-300)" }}>
                  {conversation.last_section}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--gray-300)" }}>
                  {formatSectionsCovered(conversation.sections_covered)}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--gray-300)" }}>
                  {formatDuration(conversation.duration_seconds)}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--gray-500)" }}>
                  {formatDate(conversation.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

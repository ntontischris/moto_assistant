import type { AssistantSession } from "@/types/database";
import Link from "next/link";

interface SessionsTableProps {
  sessions: AssistantSession[];
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

const MODE_LABELS: Record<string, string> = {
  discovery: "Discovery",
  support: "Support",
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatProgress(session: AssistantSession): string {
  if (session.mode === "support") return "—";
  return `${session.progress_section}/${session.progress_total}`;
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  if (sessions.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχουν sessions ακόμα
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
            {["Πελάτης", "Mode", "Status", "Πρόοδος", "Ημ/νία"].map((h) => (
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
          {sessions.map((session) => {
            const status =
              STATUS_STYLES[session.status] ?? STATUS_STYLES.active;
            return (
              <tr
                key={session.id}
                className="border-b last:border-b-0 transition-colors"
                style={{ borderColor: "var(--gray-700)" }}
              >
                <td className="px-5 py-3">
                  <Link
                    href={`/dashboard/sessions/${session.id}`}
                    className="font-medium hover:underline"
                    style={{ color: "var(--gray-100)" }}
                  >
                    {session.client_name ?? "Ανώνυμος"}
                  </Link>
                </td>
                <td className="px-5 py-3" style={{ color: "var(--gray-300)" }}>
                  {MODE_LABELS[session.mode] ?? session.mode}
                </td>
                <td className="px-5 py-3">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: status.bg,
                      color: status.text,
                    }}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="px-5 py-3" style={{ color: "var(--gray-300)" }}>
                  {formatProgress(session)}
                </td>
                <td className="px-5 py-3" style={{ color: "var(--gray-500)" }}>
                  {formatDate(session.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

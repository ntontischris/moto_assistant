import type { SectionProgress } from "@/types/database";

interface MissingSectionsProps {
  sections: SectionProgress[];
}

const STATUS_DOT_COLOR: Record<string, string> = {
  not_started: "var(--red)",
  partial: "var(--yellow, #eab308)",
};

export function MissingSections({ sections }: MissingSectionsProps) {
  const incomplete = sections.filter((s) => s.status !== "complete");

  if (incomplete.length === 0) {
    return (
      <p className="text-sm font-medium" style={{ color: "#22c55e" }}>
        Όλες οι ενότητες ολοκληρώθηκαν!
      </p>
    );
  }

  return (
    <div>
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--gray-300)" }}
      >
        Τι λείπει
      </h3>

      <ul className="space-y-2">
        {incomplete.map((section) => (
          <li key={section.number} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{
                backgroundColor:
                  STATUS_DOT_COLOR[section.status] ?? "var(--gray-500)",
              }}
            />
            <span style={{ color: "var(--gray-300)" }}>
              {section.name}
              {section.status === "partial" && (
                <span style={{ color: "var(--gray-500)" }}>
                  {" "}
                  ({section.answeredCount}/{section.totalQuestions})
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { AssistantTranscript, AssistantAnswer } from "@/types/database";
import { QUESTIONNAIRE_SECTIONS } from "@/lib/constants/questionnaire";

interface TabSummaryProps {
  transcript: AssistantTranscript | null;
  answers: AssistantAnswer[];
  totalSections: number;
}

function computeGapAnalysis(answers: AssistantAnswer[], totalSections: number) {
  const answeredKeys = new Set(answers.map((a) => a.question_key));
  const totalQuestions = QUESTIONNAIRE_SECTIONS.reduce(
    (sum, s) => sum + s.questions.length,
    0,
  );
  const answeredCount = answeredKeys.size;
  const percentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const missingSections = QUESTIONNAIRE_SECTIONS.filter((section) =>
    section.questions.some((q) => !answeredKeys.has(q.key)),
  ).map((section) => ({
    number: section.number,
    name: section.name,
    missingQuestions: section.questions
      .filter((q) => !answeredKeys.has(q.key))
      .map((q) => q.label),
  }));

  return { percentage, totalQuestions, answeredCount, missingSections };
}

export function TabSummary({
  transcript,
  answers,
  totalSections,
}: TabSummaryProps) {
  if (!transcript?.summary) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Η ανάλυση δεν έχει ολοκληρωθεί ακόμα
      </div>
    );
  }

  const gap = computeGapAnalysis(answers, totalSections);

  return (
    <div className="flex flex-col gap-6">
      {/* AI Summary */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
        }}
      >
        <h3
          className="mb-3 text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--gray-500)" }}
        >
          AI Σύνοψη
        </h3>
        <p
          className="whitespace-pre-wrap text-sm leading-relaxed"
          style={{ color: "var(--gray-300)" }}
        >
          {transcript.summary}
        </p>
      </div>

      {/* Gap Analysis */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
        }}
      >
        <h3
          className="mb-4 text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--gray-500)" }}
        >
          Gap Analysis
        </h3>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between text-sm">
            <span style={{ color: "var(--gray-300)" }}>
              Ολοκλήρωση ερωτηματολογίου
            </span>
            <span style={{ color: "var(--gray-100)" }} className="font-medium">
              {gap.percentage}% ({gap.answeredCount}/{gap.totalQuestions})
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--gray-700)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${gap.percentage}%`,
                backgroundColor:
                  gap.percentage === 100 ? "#22C55E" : "var(--red)",
              }}
            />
          </div>
        </div>

        {/* Missing sections */}
        {gap.missingSections.length > 0 && (
          <div className="flex flex-col gap-3">
            <span
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: "var(--gray-500)" }}
            >
              Ελλιπείς ενότητες
            </span>
            {gap.missingSections.map((section) => (
              <div
                key={section.number}
                className="rounded-lg border-l-2 py-2 pl-4"
                style={{ borderColor: "var(--red)" }}
              >
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--gray-100)" }}
                >
                  {section.number}. {section.name}
                </span>
                <ul className="mt-1 flex flex-col gap-0.5">
                  {section.missingQuestions.map((q) => (
                    <li
                      key={q}
                      className="text-xs"
                      style={{ color: "var(--red)" }}
                    >
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

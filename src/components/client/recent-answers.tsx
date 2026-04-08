import { Check } from "lucide-react";
import type { AssistantAnswer } from "@/types/database";

interface RecentAnswersProps {
  answers: AssistantAnswer[];
}

export function RecentAnswers({ answers }: RecentAnswersProps) {
  if (answers.length === 0) return null;

  return (
    <div>
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: "var(--gray-300)" }}
      >
        Τελευταίες απαντήσεις
      </h3>

      <ul className="space-y-2">
        {answers.map((answer) => (
          <li key={answer.id} className="flex items-start gap-2 text-sm">
            <Check
              className="mt-0.5 h-4 w-4 shrink-0"
              style={{ color: "#4ade80" }}
            />
            <div>
              <span
                className="font-medium"
                style={{ color: "var(--gray-300)" }}
              >
                {answer.question_key}
              </span>
              <p style={{ color: "var(--gray-500)" }}>{answer.answer_text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

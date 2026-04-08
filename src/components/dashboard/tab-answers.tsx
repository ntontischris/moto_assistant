"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { AssistantAnswer } from "@/types/database";
import { QUESTIONNAIRE_SECTIONS } from "@/lib/constants/questionnaire";

interface TabAnswersProps {
  answers: AssistantAnswer[];
}

function SectionBlock({
  sectionNumber,
  sectionName,
  questions,
  answersByKey,
}: {
  sectionNumber: number;
  sectionName: string;
  questions: { key: string; label: string }[];
  answersByKey: Map<string, AssistantAnswer>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const answeredCount = questions.filter((q) => answersByKey.has(q.key)).length;
  const isComplete = answeredCount === questions.length;

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        backgroundColor: "var(--gray-900)",
        borderColor: "var(--gray-700)",
      }}
    >
      {/* Collapsible header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:brightness-110"
        style={{ backgroundColor: "var(--gray-900)" }}
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown size={16} style={{ color: "var(--gray-500)" }} />
          ) : (
            <ChevronRight size={16} style={{ color: "var(--gray-500)" }} />
          )}
          <span
            className="text-sm font-medium"
            style={{ color: "var(--gray-100)" }}
          >
            {sectionNumber}. {sectionName}
          </span>
        </div>
        <span
          className="text-xs font-medium"
          style={{ color: isComplete ? "#22C55E" : "var(--gray-500)" }}
        >
          {answeredCount}/{questions.length}
        </span>
      </button>

      {/* Questions list */}
      {isOpen && (
        <div className="border-t" style={{ borderColor: "var(--gray-700)" }}>
          {questions.map((q) => {
            const answer = answersByKey.get(q.key);
            const isAnswered = !!answer;

            return (
              <div
                key={q.key}
                className="border-b px-5 py-3 last:border-b-0"
                style={{
                  borderColor: "var(--gray-700)",
                  borderLeftWidth: isAnswered ? "0" : "3px",
                  borderLeftColor: isAnswered ? "transparent" : "var(--red)",
                }}
              >
                <p
                  className="text-xs font-medium"
                  style={{ color: "var(--gray-500)" }}
                >
                  {q.label}
                </p>
                {isAnswered ? (
                  <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--gray-300)" }}
                  >
                    {answer.answer_text}
                  </p>
                ) : (
                  <p
                    className="mt-1 text-xs italic"
                    style={{ color: "var(--red)" }}
                  >
                    Δεν απαντήθηκε
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function TabAnswers({ answers }: TabAnswersProps) {
  const answersByKey = new Map(answers.map((a) => [a.question_key, a]));

  if (answers.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχουν απαντήσεις ακόμα
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {QUESTIONNAIRE_SECTIONS.map((section) => (
        <SectionBlock
          key={section.number}
          sectionNumber={section.number}
          sectionName={section.name}
          questions={section.questions}
          answersByKey={answersByKey}
        />
      ))}
    </div>
  );
}

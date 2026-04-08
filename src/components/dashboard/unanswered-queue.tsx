"use client";

import { createClient } from "@/lib/supabase/client";
import type { AssistantUnanswered, UnansweredStatus } from "@/types/database";
import { CheckCircle, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// -- Types --------------------------------------------------------------------

interface UnansweredWithSession extends AssistantUnanswered {
  session?: { client_name: string } | null;
}

interface UnansweredQueueProps {
  questions: UnansweredWithSession[];
}

// -- Constants ----------------------------------------------------------------

const FILTER_TABS: { value: UnansweredStatus | "all"; label: string }[] = [
  { value: "unanswered", label: "Αναπάντητες" },
  { value: "answered", label: "Απαντημένες" },
  { value: "all", label: "Όλες" },
];

// -- Helpers ------------------------------------------------------------------

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// -- Component ----------------------------------------------------------------

export function UnansweredQueue({ questions }: UnansweredQueueProps) {
  const router = useRouter();
  const supabase = createClient();

  const [filter, setFilter] = useState<UnansweredStatus | "all">("unanswered");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(
    () => questions.filter((q) => filter === "all" || q.status === filter),
    [questions, filter],
  );

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSaveAndCreateKnowledge = async (
    question: UnansweredWithSession,
  ) => {
    const answerText = answers[question.id]?.trim();
    if (!answerText) {
      toast.error("Γράψτε μια απάντηση πρώτα");
      return;
    }

    setLoadingId(question.id);

    try {
      // 1. Update the unanswered question with the answer
      const { error: updateError } = await supabase
        .from("assistant_unanswered")
        .update({ answer: answerText, status: "answered" as const })
        .eq("id", question.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 2. Create a knowledge entry from the Q&A
      const knowledgeContent = `Ερώτηση: ${question.question}\n\nΑπάντηση: ${answerText}`;
      const { data: knowledgeData, error: knowledgeError } = await supabase
        .from("assistant_knowledge")
        .insert({
          title: question.question.slice(0, 100),
          content: knowledgeContent,
          category: "faq" as const,
          source: "answered_question" as const,
          source_session_id: question.session_id,
          status: "active" as const,
          elevenlabs_doc_id: null,
        })
        .select("id")
        .single();

      if (knowledgeError) {
        throw new Error(knowledgeError.message);
      }

      // 3. Link the knowledge entry back to the unanswered question
      if (knowledgeData) {
        await supabase
          .from("assistant_unanswered")
          .update({ knowledge_entry_id: knowledgeData.id })
          .eq("id", question.id);
      }

      // 4. Sync to ElevenLabs
      if (knowledgeData) {
        try {
          await fetch("/api/knowledge/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ knowledge_id: knowledgeData.id }),
          });
        } catch {
          // Non-critical: knowledge is saved, sync can be retried
          console.error("ElevenLabs sync failed, can be retried later");
        }
      }

      toast.success("Απάντηση αποθηκεύτηκε & knowledge entry δημιουργήθηκε");
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[question.id];
        return next;
      });
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Save failed";
      toast.error(message);
    } finally {
      setLoadingId(null);
    }
  };

  if (questions.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχουν αναπάντητες ερωτήσεις
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5">
        {FILTER_TABS.map(({ value, label }) => {
          const isActive = filter === value;
          return (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: isActive
                  ? "rgba(227, 25, 55, 0.1)"
                  : "var(--gray-900)",
                color: isActive ? "var(--red)" : "var(--gray-300)",
                border: `1px solid ${isActive ? "var(--red)" : "var(--gray-700)"}`,
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-sm" style={{ color: "var(--gray-500)" }}>
        {filtered.length} {filtered.length === 1 ? "ερώτηση" : "ερωτήσεις"}
      </p>

      {/* Question cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((question) => {
          const isLoading = loadingId === question.id;
          const isAnswered = question.status === "answered";

          return (
            <div
              key={question.id}
              className="rounded-xl border p-5"
              style={{
                backgroundColor: "var(--gray-900)",
                borderColor: "var(--gray-700)",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {/* Question header */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="text-sm font-semibold"
                  style={{ color: "var(--gray-100)" }}
                >
                  {question.question}
                </span>
                {isAnswered && (
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      color: "#22C55E",
                    }}
                  >
                    <CheckCircle size={12} />
                    Answered
                  </span>
                )}
              </div>

              {/* Meta info */}
              <div
                className="mb-3 flex flex-wrap gap-3 text-xs"
                style={{ color: "var(--gray-500)" }}
              >
                {question.session?.client_name && (
                  <span>Πελάτης: {question.session.client_name}</span>
                )}
                <span>{formatDate(question.created_at)}</span>
              </div>

              {/* Context */}
              {question.context && (
                <p
                  className="mb-3 rounded-lg border p-3 text-sm"
                  style={{
                    backgroundColor: "var(--dark)",
                    borderColor: "var(--gray-700)",
                    color: "var(--gray-300)",
                  }}
                >
                  {question.context}
                </p>
              )}

              {/* Existing answer */}
              {isAnswered && question.answer && (
                <div
                  className="mb-3 rounded-lg border p-3"
                  style={{
                    backgroundColor: "rgba(34, 197, 94, 0.05)",
                    borderColor: "rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <p
                    className="text-xs font-medium"
                    style={{ color: "#22C55E", marginBottom: 4 }}
                  >
                    Απάντηση
                  </p>
                  <p className="text-sm" style={{ color: "var(--gray-300)" }}>
                    {question.answer}
                  </p>
                </div>
              )}

              {/* Answer form (only for unanswered) */}
              {!isAnswered && (
                <div className="flex flex-col gap-2">
                  <textarea
                    rows={3}
                    placeholder="Γράψτε απάντηση..."
                    value={answers[question.id] ?? ""}
                    onChange={(e) =>
                      handleAnswerChange(question.id, e.target.value)
                    }
                    className="resize-y rounded-lg border px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--red)]"
                    style={{
                      backgroundColor: "var(--dark)",
                      borderColor: "var(--gray-700)",
                      color: "var(--gray-100)",
                    }}
                  />
                  <button
                    onClick={() => handleSaveAndCreateKnowledge(question)}
                    disabled={isLoading || !answers[question.id]?.trim()}
                    className="flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium text-white transition-opacity disabled:opacity-50"
                    style={{ backgroundColor: "var(--red)" }}
                  >
                    <Send size={14} />
                    {isLoading
                      ? "Αποθήκευση..."
                      : "Αποθήκευση & Δημιουργία Knowledge"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

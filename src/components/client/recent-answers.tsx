"use client";

import { Check, Pencil, Save, X } from "lucide-react";
import { useState } from "react";
import type { AssistantAnswer } from "@/types/database";

interface RecentAnswersProps {
  answers: AssistantAnswer[];
}

export function RecentAnswers({ answers: initialAnswers }: RecentAnswersProps) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);

  if (answers.length === 0) return null;

  function startEdit(answer: AssistantAnswer) {
    setEditingId(answer.id);
    setEditText(answer.answer_text);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEdit(answerId: string) {
    setSaving(true);

    const res = await fetch("/api/mission", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer_id: answerId, answer_text: editText }),
    });

    if (res.ok) {
      setAnswers((prev) =>
        prev.map((a) =>
          a.id === answerId ? { ...a, answer_text: editText } : a,
        ),
      );
    }

    setEditingId(null);
    setEditText("");
    setSaving(false);
  }

  return (
    <div>
      <h3
        className="mb-3 text-sm font-semibold"
        style={{ color: "var(--gray-300)" }}
      >
        Τελευταίες απαντήσεις
      </h3>

      <ul className="space-y-2">
        {answers.map((answer) => (
          <li key={answer.id} className="text-sm">
            {editingId === answer.id ? (
              <div
                className="flex flex-col gap-2 rounded-lg border p-3"
                style={{
                  borderColor: "var(--red)",
                  backgroundColor: "var(--gray-900)",
                }}
              >
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--gray-400)" }}
                >
                  {answer.question_key}
                </span>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full resize-none rounded-md border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: "var(--gray-700)",
                    backgroundColor: "var(--dark)",
                    color: "var(--gray-100)",
                  }}
                  rows={2}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(answer.id)}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium text-white"
                    style={{ backgroundColor: "var(--red)" }}
                  >
                    <Save className="h-3 w-3" />
                    {saving ? "..." : "Αποθήκευση"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded-md px-3 py-1 text-xs"
                    style={{ color: "var(--gray-400)" }}
                  >
                    <X className="h-3 w-3" />
                    Ακύρωση
                  </button>
                </div>
              </div>
            ) : (
              <div className="group flex items-start gap-2">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0"
                  style={{ color: "#4ade80" }}
                />
                <div className="flex-1">
                  <span
                    className="font-medium"
                    style={{ color: "var(--gray-300)" }}
                  >
                    {answer.question_key}
                  </span>
                  <p style={{ color: "var(--gray-500)" }}>
                    {answer.answer_text}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(answer)}
                  className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: "var(--gray-500)" }}
                  title="Επεξεργασία"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

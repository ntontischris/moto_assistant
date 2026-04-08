"use client";

import { useState } from "react";
import { ChevronDown, MessageSquare } from "lucide-react";
import type { AssistantConversation } from "@/types/database";

interface ConversationHistoryProps {
  conversations: AssistantConversation[];
}

function formatGreekDate(iso: string): string {
  return new Date(iso).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return `${minutes} λεπτά`;
}

export function ConversationHistory({
  conversations,
}: ConversationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (conversations.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-sm font-semibold"
        style={{ color: "var(--gray-300)" }}
      >
        <span>Ιστορικό ({conversations.length} συνομιλίες)</span>
        <ChevronDown
          className="h-4 w-4 transition-transform duration-200"
          style={{
            color: "var(--gray-500)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-3">
          {conversations.map((convo) => (
            <li
              key={convo.id}
              className="flex items-start gap-2 text-sm"
              style={{ color: "var(--gray-300)" }}
            >
              <MessageSquare
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--gray-500)" }}
              />
              <div className="min-w-0">
                <span>{formatGreekDate(convo.created_at)}</span>

                {convo.duration_seconds != null && (
                  <span style={{ color: "var(--gray-500)" }}>
                    {" "}
                    &middot; {formatDuration(convo.duration_seconds)}
                  </span>
                )}

                {convo.sections_covered.length > 0 && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--gray-500)" }}
                  >
                    Ενότητες: {convo.sections_covered.join(", ")}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

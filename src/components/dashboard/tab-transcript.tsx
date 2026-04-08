"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { AssistantTranscript } from "@/types/database";

interface TabTranscriptProps {
  transcript: AssistantTranscript | null;
}

function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="rounded px-0.5"
        style={{
          backgroundColor: "rgba(227, 25, 55, 0.3)",
          color: "var(--gray-100)",
        }}
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export function TabTranscript({ transcript }: TabTranscriptProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!transcript?.full_transcript) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχει μεταγραφή ακόμα
      </div>
    );
  }

  const lines = transcript.full_transcript.split("\n").filter(Boolean);
  const filteredLines = searchQuery.trim()
    ? lines.filter((line) =>
        line.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : lines;

  return (
    <div className="flex flex-col gap-4">
      {/* Search input */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--gray-500)" }}
        />
        <input
          type="text"
          placeholder="Αναζήτηση στη μεταγραφή..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border py-2 pl-9 pr-4 text-sm outline-none transition-colors focus:border-[var(--red)]"
          style={{
            backgroundColor: "var(--gray-900)",
            borderColor: "var(--gray-700)",
            color: "var(--gray-100)",
          }}
        />
      </div>

      {/* Transcript content */}
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
        }}
      >
        {filteredLines.length === 0 ? (
          <p
            className="text-center text-sm"
            style={{ color: "var(--gray-500)" }}
          >
            Δεν βρέθηκαν αποτελέσματα
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredLines.map((line, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed"
                style={{ color: "var(--gray-300)" }}
              >
                {highlightMatches(line, searchQuery)}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

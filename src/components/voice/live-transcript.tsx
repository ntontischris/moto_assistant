"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare, X } from "lucide-react";
import { useEffect, useRef } from "react";

export interface TranscriptEntry {
  speaker: "agent" | "user";
  text: string;
  timestamp: string;
}

interface LiveTranscriptProps {
  entries: TranscriptEntry[];
  isOpen: boolean;
  onToggle: () => void;
}

export function LiveTranscript({
  entries,
  isOpen,
  onToggle,
}: LiveTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <>
      {/* Toggle button — visible on mobile only */}
      <button
        type="button"
        onClick={onToggle}
        className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border md:hidden"
        style={{
          borderColor: "var(--gray-700)",
          backgroundColor: "var(--gray-900)",
        }}
        aria-label={isOpen ? "Close transcript" : "Open transcript"}
      >
        {isOpen ? (
          <X size={18} color="var(--gray-300)" />
        ) : (
          <MessageSquare size={18} color="var(--gray-300)" />
        )}
      </button>

      {/* Sliding panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-40 flex h-full w-full flex-col border-l md:w-96"
            style={{
              backgroundColor: "var(--gray-900)",
              borderColor: "var(--gray-700)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--gray-700)" }}
            >
              <h2 className="text-sm font-semibold text-[var(--gray-100)]">
                Transcript
              </h2>
              <button
                type="button"
                onClick={onToggle}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[var(--gray-800)]"
                aria-label="Close transcript"
              >
                <X size={16} color="var(--gray-400)" />
              </button>
            </div>

            {/* Entries */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
              {entries.length === 0 ? (
                <p className="text-sm text-[var(--gray-500)]">
                  Transcript will appear here...
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {entries.map((entry, idx) => {
                    const isAgent = entry.speaker === "agent";
                    return (
                      <div key={idx} className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium"
                            style={{
                              color: isAgent ? "var(--red)" : "var(--gray-400)",
                            }}
                          >
                            {isAgent ? "Assistant" : "You"}
                          </span>
                          <span className="text-xs text-[var(--gray-600)]">
                            {entry.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--gray-200)]">
                          {entry.text}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

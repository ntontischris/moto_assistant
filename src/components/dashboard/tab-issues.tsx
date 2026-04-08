"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import type {
  AssistantIssue,
  IssueSeverity,
  IssueStatus,
} from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface TabIssuesProps {
  issues: AssistantIssue[];
}

const STATUS_OPTIONS: { value: IssueStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "investigating", label: "Investigating" },
  { value: "resolved", label: "Resolved" },
  { value: "wont_fix", label: "Won't Fix" },
];

const SEVERITY_OPTIONS: { value: IssueSeverity; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  new: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" },
  investigating: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308" },
  resolved: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" },
  wont_fix: { bg: "rgba(122, 122, 122, 0.1)", text: "#7A7A7A" },
};

const SEVERITY_STYLES: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(122, 122, 122, 0.1)", text: "#7A7A7A" },
  medium: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308" },
  high: { bg: "rgba(227, 25, 55, 0.1)", text: "var(--red)" },
  critical: { bg: "rgba(227, 25, 55, 0.25)", text: "#FF4D6A" },
};

interface IssueItemState {
  status: IssueStatus;
  severity: IssueSeverity;
  notes: string;
  isSaving: boolean;
}

function IssueItem({ item }: { item: AssistantIssue }) {
  const [state, setState] = useState<IssueItemState>({
    status: item.status,
    severity: item.severity,
    notes: item.admin_notes ?? "",
    isSaving: false,
  });

  const handleSave = async () => {
    setState((prev) => ({ ...prev, isSaving: true }));

    const supabase = createClient();
    const { error } = await supabase
      .from("assistant_issues")
      .update({
        status: state.status,
        severity: state.severity,
        admin_notes: state.notes || null,
      })
      .eq("id", item.id);

    if (error) {
      console.error("Failed to update issue:", error);
    }

    setState((prev) => ({ ...prev, isSaving: false }));
  };

  const statusStyle = STATUS_STYLES[state.status] ?? STATUS_STYLES.new;
  const severityStyle = SEVERITY_STYLES[state.severity] ?? SEVERITY_STYLES.low;

  return (
    <div
      className="rounded-xl border p-5"
      style={{
        backgroundColor: "var(--gray-900)",
        borderColor: "var(--gray-700)",
      }}
    >
      {/* Description */}
      <p className="text-sm font-medium" style={{ color: "var(--gray-100)" }}>
        {item.description}
      </p>

      {/* Context quote */}
      {item.context && (
        <p
          className="mt-2 border-l-2 pl-3 text-xs italic"
          style={{
            borderColor: "var(--gray-700)",
            color: "var(--gray-500)",
          }}
        >
          &ldquo;{item.context}&rdquo;
        </p>
      )}

      {/* Badges */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
        >
          {state.status.replace("_", " ")}
        </span>
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: severityStyle.bg,
            color: severityStyle.text,
          }}
        >
          {state.severity}
        </span>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <select
            value={state.status}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                status: e.target.value as IssueStatus,
              }))
            }
            className="rounded-lg border px-3 py-1.5 text-xs outline-none"
            style={{
              backgroundColor: "var(--dark)",
              borderColor: "var(--gray-700)",
              color: "var(--gray-300)",
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={state.severity}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                severity: e.target.value as IssueSeverity,
              }))
            }
            className="rounded-lg border px-3 py-1.5 text-xs outline-none"
            style={{
              backgroundColor: "var(--dark)",
              borderColor: "var(--gray-700)",
              color: "var(--gray-300)",
            }}
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={state.notes}
          onChange={(e) =>
            setState((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Admin notes..."
          rows={2}
          className="w-full resize-none rounded-lg border px-3 py-2 text-xs outline-none transition-colors focus:border-[var(--red)]"
          style={{
            backgroundColor: "var(--dark)",
            borderColor: "var(--gray-700)",
            color: "var(--gray-300)",
          }}
        />

        <button
          onClick={handleSave}
          disabled={state.isSaving}
          className="flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: "var(--red)", color: "var(--gray-100)" }}
        >
          <Save size={12} />
          {state.isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

export function TabIssues({ issues }: TabIssuesProps) {
  if (issues.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχουν issues
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {issues.map((issue) => (
        <IssueItem key={issue.id} item={issue} />
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import type {
  AssistantFeatureRequest,
  FeatureRequestPriority,
  FeatureRequestStatus,
} from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface TabFeatureRequestsProps {
  featureRequests: AssistantFeatureRequest[];
}

const STATUS_OPTIONS: { value: FeatureRequestStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "planned", label: "Planned" },
  { value: "done", label: "Done" },
  { value: "rejected", label: "Rejected" },
];

const PRIORITY_OPTIONS: { value: FeatureRequestPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  new: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" },
  reviewed: { bg: "rgba(168, 85, 247, 0.1)", text: "#A855F7" },
  planned: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308" },
  done: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" },
  rejected: { bg: "rgba(122, 122, 122, 0.1)", text: "#7A7A7A" },
};

const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  low: { bg: "rgba(122, 122, 122, 0.1)", text: "#7A7A7A" },
  medium: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308" },
  high: { bg: "rgba(227, 25, 55, 0.1)", text: "var(--red)" },
};

interface FeatureRequestItemState {
  status: FeatureRequestStatus;
  priority: FeatureRequestPriority;
  notes: string;
  isSaving: boolean;
}

function FeatureRequestItem({ item }: { item: AssistantFeatureRequest }) {
  const [state, setState] = useState<FeatureRequestItemState>({
    status: item.status,
    priority: item.priority,
    notes: item.admin_notes ?? "",
    isSaving: false,
  });

  const handleSave = async () => {
    setState((prev) => ({ ...prev, isSaving: true }));

    const supabase = createClient();
    const { error } = await supabase
      .from("assistant_feature_requests")
      .update({
        status: state.status,
        priority: state.priority,
        admin_notes: state.notes || null,
      })
      .eq("id", item.id);

    if (error) {
      console.error("Failed to update feature request:", error);
    }

    setState((prev) => ({ ...prev, isSaving: false }));
  };

  const statusStyle = STATUS_STYLES[state.status] ?? STATUS_STYLES.new;
  const priorityStyle = PRIORITY_STYLES[state.priority] ?? PRIORITY_STYLES.low;

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
          {state.status}
        </span>
        <span
          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
          style={{
            backgroundColor: priorityStyle.bg,
            color: priorityStyle.text,
          }}
        >
          {state.priority}
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
                status: e.target.value as FeatureRequestStatus,
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
            value={state.priority}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                priority: e.target.value as FeatureRequestPriority,
              }))
            }
            className="rounded-lg border px-3 py-1.5 text-xs outline-none"
            style={{
              backgroundColor: "var(--dark)",
              borderColor: "var(--gray-700)",
              color: "var(--gray-300)",
            }}
          >
            {PRIORITY_OPTIONS.map((opt) => (
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

export function TabFeatureRequests({
  featureRequests,
}: TabFeatureRequestsProps) {
  if (featureRequests.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχουν feature requests
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {featureRequests.map((fr) => (
        <FeatureRequestItem key={fr.id} item={fr} />
      ))}
    </div>
  );
}

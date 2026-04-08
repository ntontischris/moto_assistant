"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  AssistantKnowledge,
  KnowledgeCategory,
  KnowledgeStatus,
} from "@/types/database";
import { Archive, CheckCircle, Search, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

// -- Constants ----------------------------------------------------------------

const CATEGORY_TABS: { value: KnowledgeCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "project_spec", label: "Project Spec" },
  { value: "how_to", label: "How To" },
  { value: "faq", label: "FAQ" },
  { value: "release_notes", label: "Release Notes" },
  { value: "client_profile", label: "Client Profile" },
];

const CATEGORY_COLORS: Record<KnowledgeCategory, { bg: string; text: string }> =
  {
    project_spec: { bg: "rgba(59, 130, 246, 0.1)", text: "#3B82F6" },
    how_to: { bg: "rgba(168, 85, 247, 0.1)", text: "#A855F7" },
    faq: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" },
    release_notes: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308" },
    client_profile: { bg: "rgba(236, 72, 153, 0.1)", text: "#EC4899" },
  };

const SOURCE_LABELS: Record<string, string> = {
  manual: "Manual",
  auto_extracted: "Auto",
  answered_question: "Answered Q",
};

const STATUS_STYLES: Record<
  KnowledgeStatus,
  { bg: string; text: string; label: string }
> = {
  pending: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308", label: "Pending" },
  active: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E", label: "Active" },
  archived: {
    bg: "rgba(122, 122, 122, 0.1)",
    text: "#7A7A7A",
    label: "Archived",
  },
};

// -- Props --------------------------------------------------------------------

interface KnowledgeManagerProps {
  entries: AssistantKnowledge[];
}

// -- Component ----------------------------------------------------------------

export function KnowledgeManager({ entries }: KnowledgeManagerProps) {
  const router = useRouter();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<KnowledgeCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return entries.filter((entry) => {
      const matchesCategory =
        activeTab === "all" || entry.category === activeTab;
      const matchesSearch =
        !lowerSearch ||
        entry.title.toLowerCase().includes(lowerSearch) ||
        entry.content.toLowerCase().includes(lowerSearch);
      return matchesCategory && matchesSearch;
    });
  }, [entries, activeTab, search]);

  const updateStatus = async (id: string, status: KnowledgeStatus) => {
    setLoadingId(id);
    const { error } = await supabase
      .from("assistant_knowledge")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error(`Update failed: ${error.message}`);
    } else {
      toast.success(`Entry ${status === "active" ? "approved" : status}`);
      router.refresh();
    }
    setLoadingId(null);
  };

  const deleteEntry = async (id: string) => {
    setLoadingId(id);
    const { error } = await supabase
      .from("assistant_knowledge")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error(`Delete failed: ${error.message}`);
    } else {
      toast.success("Entry deleted");
      router.refresh();
    }
    setLoadingId(null);
  };

  const truncate = (text: string, maxLength = 200): string =>
    text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;

  if (entries.length === 0) {
    return (
      <div
        className="rounded-xl border px-6 py-12 text-center"
        style={{
          backgroundColor: "var(--gray-900)",
          borderColor: "var(--gray-700)",
          color: "var(--gray-500)",
        }}
      >
        Δεν υπάρχουν knowledge entries ακόμα
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map(({ value, label }) => {
            const isActive = activeTab === value;
            return (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
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

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--gray-500)" }}
          />
          <input
            type="text"
            placeholder="Αναζήτηση..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--red)]"
            style={{
              backgroundColor: "var(--gray-900)",
              borderColor: "var(--gray-700)",
              color: "var(--gray-100)",
              minWidth: 220,
            }}
          />
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm" style={{ color: "var(--gray-500)" }}>
        {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
      </p>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((entry) => {
          const catStyle = CATEGORY_COLORS[entry.category];
          const statusStyle = STATUS_STYLES[entry.status];
          const isLoading = loadingId === entry.id;

          return (
            <div
              key={entry.id}
              className="rounded-xl border p-5"
              style={{
                backgroundColor: "var(--gray-900)",
                borderColor: "var(--gray-700)",
                opacity: isLoading ? 0.5 : 1,
              }}
            >
              {/* Header */}
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--gray-100)" }}
                >
                  {entry.title}
                </h3>

                {/* Category badge */}
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: catStyle.bg,
                    color: catStyle.text,
                  }}
                >
                  {entry.category.replace("_", " ")}
                </span>

                {/* Source badge */}
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: "rgba(122, 122, 122, 0.1)",
                    color: "var(--gray-500)",
                  }}
                >
                  {SOURCE_LABELS[entry.source] ?? entry.source}
                </span>

                {/* Status badge */}
                <span
                  className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.text,
                  }}
                >
                  {statusStyle.label}
                </span>
              </div>

              {/* Content preview */}
              <p
                className="mb-3 text-sm leading-relaxed"
                style={{ color: "var(--gray-300)" }}
              >
                {truncate(entry.content)}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {entry.status === "pending" && (
                  <>
                    <button
                      onClick={() => updateStatus(entry.id, "active")}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                      style={{
                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                        color: "#22C55E",
                      }}
                    >
                      <CheckCircle size={14} />
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(entry.id, "archived")}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                      style={{
                        backgroundColor: "rgba(234, 179, 8, 0.1)",
                        color: "#EAB308",
                      }}
                    >
                      <XCircle size={14} />
                      Reject
                    </button>
                  </>
                )}

                {entry.status === "active" && (
                  <>
                    <button
                      onClick={() => updateStatus(entry.id, "archived")}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                      style={{
                        backgroundColor: "rgba(122, 122, 122, 0.1)",
                        color: "var(--gray-500)",
                      }}
                    >
                      <Archive size={14} />
                      Archive
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                      style={{
                        backgroundColor: "rgba(227, 25, 55, 0.1)",
                        color: "var(--red)",
                      }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </>
                )}

                {entry.status === "archived" && (
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                    style={{
                      backgroundColor: "rgba(227, 25, 55, 0.1)",
                      color: "var(--red)",
                    }}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

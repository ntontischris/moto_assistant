import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SessionDetailTabs } from "@/components/dashboard/session-detail-tabs";
import type {
  AssistantSession,
  AssistantAnswer,
  AssistantTranscript,
  AssistantFeatureRequest,
  AssistantIssue,
} from "@/types/database";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  active: { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E", label: "Active" },
  paused: { bg: "rgba(234, 179, 8, 0.1)", text: "#EAB308", label: "Paused" },
  completed: {
    bg: "rgba(59, 130, 246, 0.1)",
    text: "#3B82F6",
    label: "Completed",
  },
};

const MODE_STYLES: Record<string, { bg: string; text: string; label: string }> =
  {
    discovery: {
      bg: "rgba(168, 85, 247, 0.1)",
      text: "#A855F7",
      label: "Discovery",
    },
    support: {
      bg: "rgba(59, 130, 246, 0.1)",
      text: "#3B82F6",
      label: "Support",
    },
  };

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("el-GR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    sessionResult,
    answersResult,
    transcriptResult,
    featuresResult,
    issuesResult,
  ] = await Promise.all([
    supabase
      .from("assistant_sessions")
      .select(
        "id, client_name, client_email, client_company, mode, status, progress_section, progress_total, elevenlabs_conversation_id, resume_token, context_snapshot, created_at, updated_at",
      )
      .eq("id", id)
      .single(),
    supabase
      .from("assistant_answers")
      .select(
        "id, session_id, section_number, section_name, question_key, answer_text, answer_structured, confidence, created_at",
      )
      .eq("session_id", id)
      .order("section_number", { ascending: true }),
    supabase
      .from("assistant_transcripts")
      .select(
        "id, session_id, full_transcript, summary, gap_analysis, created_at",
      )
      .eq("session_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("assistant_feature_requests")
      .select(
        "id, session_id, description, context, priority, status, admin_notes, created_at",
      )
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assistant_issues")
      .select(
        "id, session_id, description, context, severity, status, admin_notes, created_at",
      )
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!sessionResult.data) {
    redirect("/dashboard");
  }

  const session = sessionResult.data as AssistantSession;
  const answers = (answersResult.data ?? []) as AssistantAnswer[];
  const transcript = (transcriptResult.data ??
    null) as AssistantTranscript | null;
  const featureRequests = (featuresResult.data ??
    []) as AssistantFeatureRequest[];
  const issues = (issuesResult.data ?? []) as AssistantIssue[];

  const statusStyle = STATUS_STYLES[session.status] ?? STATUS_STYLES.active;
  const modeStyle = MODE_STYLES[session.mode] ?? MODE_STYLES.discovery;

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1.5 text-sm transition-colors hover:opacity-80"
        style={{ color: "var(--gray-500)" }}
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      {/* Session header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--gray-100)" }}
          >
            {session.client_name ?? "Ανώνυμος"}
          </h1>
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: modeStyle.bg, color: modeStyle.text }}
          >
            {modeStyle.label}
          </span>
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: statusStyle.bg,
              color: statusStyle.text,
            }}
          >
            {statusStyle.label}
          </span>
        </div>
        <div
          className="flex items-center gap-4 text-sm"
          style={{ color: "var(--gray-500)" }}
        >
          {session.client_company && <span>{session.client_company}</span>}
          {session.client_email && <span>{session.client_email}</span>}
          <span>{formatDate(session.created_at)}</span>
        </div>
      </div>

      {/* Tabs */}
      <SessionDetailTabs
        session={session}
        answers={answers}
        transcript={transcript}
        featureRequests={featureRequests}
        issues={issues}
      />
    </div>
  );
}

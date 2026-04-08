import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SessionDetailTabs } from "@/components/dashboard/session-detail-tabs";
import type {
  AssistantConversation,
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

export default async function ConversationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    convResult,
    answersResult,
    transcriptResult,
    featuresResult,
    issuesResult,
  ] = await Promise.all([
    supabase.from("assistant_conversations").select("*").eq("id", id).single(),
    supabase
      .from("assistant_answers")
      .select("*")
      .eq("session_id", id)
      .order("section_number"),
    supabase
      .from("assistant_transcripts")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("assistant_feature_requests")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("assistant_issues")
      .select("*")
      .eq("session_id", id)
      .order("created_at", { ascending: false }),
  ]);

  if (!convResult.data) redirect("/dashboard");

  const conversation = convResult.data as AssistantConversation;
  const answers = (answersResult.data ?? []) as AssistantAnswer[];
  const transcript = (transcriptResult.data ??
    null) as AssistantTranscript | null;
  const featureRequests = (featuresResult.data ??
    []) as AssistantFeatureRequest[];
  const issues = (issuesResult.data ?? []) as AssistantIssue[];

  const statusStyle =
    STATUS_STYLES[conversation.status] ?? STATUS_STYLES.active;

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1.5 text-sm transition-colors hover:opacity-80"
        style={{ color: "var(--gray-500)" }}
      >
        <ArrowLeft size={14} />
        Dashboard
      </Link>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--gray-100)" }}
          >
            Συνομιλία
          </h1>
          <span
            className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
          >
            {statusStyle.label}
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--gray-500)" }}>
          {new Date(conversation.created_at).toLocaleDateString("el-GR")}
          {conversation.duration_seconds &&
            ` — ${Math.round(conversation.duration_seconds / 60)} λεπτά`}
        </p>
      </div>

      <SessionDetailTabs
        conversation={conversation}
        answers={answers}
        transcript={transcript}
        featureRequests={featureRequests}
        issues={issues}
      />
    </div>
  );
}

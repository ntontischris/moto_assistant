import { SessionsTable } from "@/components/dashboard/sessions-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { createClient } from "@/lib/supabase/server";
import type { AssistantConversation, AssistantMission } from "@/types/database";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    conversationsResult,
    featureRequestsResult,
    unansweredResult,
    activeResult,
    missionResult,
  ] = await Promise.all([
    supabase
      .from("assistant_conversations")
      .select(
        "id, mission_id, status, last_section, elevenlabs_conversation_id, context_snapshot, duration_seconds, sections_covered, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("assistant_feature_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("assistant_unanswered")
      .select("id", { count: "exact", head: true })
      .eq("status", "unanswered"),
    supabase
      .from("assistant_conversations")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("assistant_mission")
      .select(
        "id, status, progress_percentage, total_answers, total_conversations, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const conversations = (conversationsResult.data ??
    []) as AssistantConversation[];
  const featureRequestCount = featureRequestsResult.count ?? 0;
  const unansweredCount = unansweredResult.count ?? 0;
  const activeCount = activeResult.count ?? 0;
  const mission = (missionResult.data ?? null) as AssistantMission | null;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--gray-100)" }}>
        Dashboard
      </h1>

      <StatsCards
        totalSessions={conversations.length}
        openFeatureRequests={featureRequestCount}
        unansweredQuestions={unansweredCount}
        activeSessions={activeCount}
        missionProgress={mission?.progress_percentage ?? null}
        missionStatus={mission?.status ?? null}
      />

      <SessionsTable conversations={conversations} />
    </div>
  );
}

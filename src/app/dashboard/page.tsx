import { SessionsTable } from "@/components/dashboard/sessions-table";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    sessionsResult,
    featureRequestsResult,
    unansweredResult,
    activeResult,
  ] = await Promise.all([
    supabase
      .from("assistant_sessions")
      .select(
        "id, client_name, client_email, client_company, mode, status, progress_section, progress_total, elevenlabs_conversation_id, resume_token, context_snapshot, created_at, updated_at",
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
      .from("assistant_sessions")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const sessions = sessionsResult.data ?? [];
  const featureRequestCount = featureRequestsResult.count ?? 0;
  const unansweredCount = unansweredResult.count ?? 0;
  const activeCount = activeResult.count ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--gray-100)" }}>
        Dashboard
      </h1>

      <StatsCards
        totalSessions={sessions.length}
        openFeatureRequests={featureRequestCount}
        unansweredQuestions={unansweredCount}
        activeSessions={activeCount}
      />

      <SessionsTable sessions={sessions} />
    </div>
  );
}

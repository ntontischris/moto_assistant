import { NextResponse } from "next/server";

import { sendEmail } from "@/lib/email/send";
import { AdminSummaryEmail } from "@/lib/email/templates/admin-summary";
import { ClientSummaryEmail } from "@/lib/email/templates/client-summary";
import { processTranscript } from "@/lib/openai/post-processing";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyElevenLabsWebhook } from "@/lib/webhooks/verify";
import type {
  AssistantFeatureRequestInsert,
  AssistantIssueInsert,
  AssistantTranscriptInsert,
  SessionMode,
} from "@/types/database";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@motomarket.gr";
const DASHBOARD_BASE_URL =
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://admin.motomarket.gr";
const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://assistant.motomarket.gr";

// ---------------------------------------------------------------------------
// POST handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  // 1. Verify webhook signature
  const rawBody = await request.text();
  const signature = request.headers.get("elevenlabs-signature") ?? "";

  let event: { type: string; data: Record<string, unknown> };
  try {
    event = (await verifyElevenLabsWebhook(rawBody, signature)) as typeof event;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 2. Only handle post_call_transcription events
  if (event.type !== "post_call_transcription") {
    return NextResponse.json({ ignored: true });
  }

  const conversationId = event.data.conversation_id as string | undefined;
  const transcript = event.data.transcript as string | undefined;

  if (!conversationId || !transcript) {
    return NextResponse.json(
      { error: "Missing conversation_id or transcript" },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  try {
    // 3. Find session by elevenlabs_conversation_id
    const { data: session, error: sessionError } = await supabase
      .from("assistant_sessions")
      .select("id, client_name, client_email, mode, status, resume_token")
      .eq("elevenlabs_conversation_id", conversationId)
      .single();

    if (sessionError || !session) {
      console.error("Session not found for conversation:", conversationId);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // 4. Get existing answer keys for gap analysis
    const { data: answers } = await supabase
      .from("assistant_answers")
      .select("question_key")
      .eq("session_id", session.id);

    const existingAnswerKeys = (answers ?? []).map(
      (a: { question_key: string }) => a.question_key,
    );

    // 5. Run post-processing
    const result = await processTranscript(
      transcript,
      session.mode as SessionMode,
      existingAnswerKeys,
    );

    // 6. Save transcript
    const transcriptRow: AssistantTranscriptInsert = {
      session_id: session.id,
      full_transcript: transcript,
      summary: result.summary,
      gap_analysis: result.gapAnalysis as unknown as Record<string, unknown>,
    };

    const { error: transcriptError } = await supabase
      .from("assistant_transcripts")
      .insert(transcriptRow);

    if (transcriptError) {
      console.error("Failed to save transcript:", transcriptError);
    }

    // 7. Insert extracted feature requests and issues
    if (result.extractedFeatureRequests.length > 0) {
      const featureRows: AssistantFeatureRequestInsert[] =
        result.extractedFeatureRequests.map((fr) => ({
          session_id: session.id,
          description: fr.description,
          context: fr.context,
          priority: "medium" as const,
          status: "new" as const,
          admin_notes: null,
        }));

      const { error: frError } = await supabase
        .from("assistant_feature_requests")
        .insert(featureRows);

      if (frError) {
        console.error("Failed to insert feature requests:", frError);
      }
    }

    if (result.extractedIssues.length > 0) {
      const issueRows: AssistantIssueInsert[] = result.extractedIssues.map(
        (issue) => ({
          session_id: session.id,
          description: issue.description,
          context: issue.context,
          severity: "medium" as const,
          status: "new" as const,
          admin_notes: null,
        }),
      );

      const { error: issueError } = await supabase
        .from("assistant_issues")
        .insert(issueRows);

      if (issueError) {
        console.error("Failed to insert issues:", issueError);
      }
    }

    // 8. Update session status
    const isComplete = result.gapAnalysis.completionPercentage === 100;
    if (isComplete) {
      const { error: updateError } = await supabase
        .from("assistant_sessions")
        .update({ status: "completed" })
        .eq("id", session.id);

      if (updateError) {
        console.error("Failed to update session status:", updateError);
      }
    }

    // 9. Send admin email
    const dashboardUrl = `${DASHBOARD_BASE_URL}/sessions/${session.id}`;

    const totalQuestions =
      existingAnswerKeys.length + result.gapAnalysis.missingQuestions.length;
    const unansweredCount = result.gapAnalysis.missingQuestions.length;

    try {
      await sendEmail({
        to: ADMIN_EMAIL,
        subject: `[Moto Assistant] ${session.mode === "discovery" ? "Discovery" : "Support"} call - ${session.client_name ?? "Unknown"}`,
        react: AdminSummaryEmail({
          clientName: session.client_name ?? "Unknown",
          mode: session.mode as SessionMode,
          progress: result.gapAnalysis.completionPercentage,
          summary: result.summary,
          featureRequestCount: result.extractedFeatureRequests.length,
          unansweredCount,
          dashboardUrl,
        }),
      });
    } catch (emailErr) {
      console.error("Failed to send admin email:", emailErr);
    }

    // 10. Send client email
    if (session.client_email) {
      const resumeUrl = isComplete
        ? undefined
        : `${APP_BASE_URL}/resume/${session.resume_token}`;

      try {
        await sendEmail({
          to: session.client_email,
          subject: isComplete
            ? "MotoMarket - Session Complete"
            : "MotoMarket - Your Session Progress",
          react: ClientSummaryEmail({
            clientName: session.client_name ?? "",
            progress: result.gapAnalysis.completionPercentage,
            isComplete,
            resumeUrl,
          }),
        });
      } catch (emailErr) {
        console.error("Failed to send client email:", emailErr);
      }
    }

    // 11. Return 200
    return NextResponse.json({
      success: true,
      sessionId: session.id,
      completionPercentage: result.gapAnalysis.completionPercentage,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Post-call webhook error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

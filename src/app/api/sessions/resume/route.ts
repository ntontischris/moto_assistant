import { NextResponse } from "next/server";

import { QUESTIONNAIRE_SECTIONS } from "@/lib/constants/questionnaire";
import { createAdminClient } from "@/lib/supabase/admin";

function getSectionName(sectionNumber: number): string {
  const section = QUESTIONNAIRE_SECTIONS.find(
    (s) => s.number === sectionNumber,
  );
  return section?.name ?? `Section ${sectionNumber}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing resume token" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    // Find the paused session by resume token
    const { data: session, error: sessionError } = await supabase
      .from("assistant_sessions")
      .select(
        "id, mode, client_name, context_snapshot, progress_section, progress_total",
      )
      .eq("resume_token", token)
      .eq("status", "paused")
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: "Session not found or not paused" },
        { status: 404 },
      );
    }

    // Get existing answers for context
    const { data: answers, error: answersError } = await supabase
      .from("assistant_answers")
      .select(
        "section_number, section_name, question_key, answer_text, confidence",
      )
      .eq("session_id", session.id)
      .order("section_number", { ascending: true });

    if (answersError) {
      return NextResponse.json(
        { error: answersError.message },
        { status: 500 },
      );
    }

    const completedSections = [
      ...new Set((answers ?? []).map((a) => a.section_number)),
    ];
    const nextSection =
      completedSections.length > 0 ? Math.max(...completedSections) + 1 : 1;

    const resumeContext = {
      previous_answers: answers ?? [],
      completed_sections: completedSections,
      next_section: nextSection,
      next_section_name: getSectionName(nextSection),
      client_name: session.client_name,
      context_snapshot: session.context_snapshot,
    };

    // Reactivate the session
    const { error: updateError } = await supabase
      .from("assistant_sessions")
      .update({ status: "active" })
      .eq("id", session.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      session_id: session.id,
      mode: session.mode,
      resume_context: resumeContext,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

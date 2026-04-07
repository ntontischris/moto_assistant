import { redirect } from "next/navigation";

import { VoiceSession } from "@/components/voice/voice-session";
import { QUESTIONNAIRE_SECTIONS } from "@/lib/constants/questionnaire";
import { createAdminClient } from "@/lib/supabase/admin";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ResumePage({ params }: PageProps) {
  const { token } = await params;
  const supabase = createAdminClient();

  // Find session by resume token
  const { data: session } = await supabase
    .from("assistant_sessions")
    .select("*")
    .eq("resume_token", token)
    .in("status", ["paused", "active"])
    .single();

  if (!session) redirect("/");

  // Fetch previous answers for context
  const { data: answers } = await supabase
    .from("assistant_answers")
    .select("section_number, section_name, question_key, answer_text")
    .eq("session_id", session.id)
    .order("section_number", { ascending: true });

  const nextSection = (session.progress_section || 1) + 1;
  const nextSectionName =
    QUESTIONNAIRE_SECTIONS.find((s) => s.number === nextSection)?.name ?? "";
  const completedSections = String(session.progress_section || 0);

  const dynamicVariables: Record<string, string> = {
    previous_context: JSON.stringify(answers ?? []),
    completed_sections: completedSections,
    next_section: String(nextSection),
    next_section_name: nextSectionName,
    is_resumed: "true",
  };

  // Mark session as active
  await supabase
    .from("assistant_sessions")
    .update({ status: "active" })
    .eq("id", session.id);

  return <VoiceSession session={session} dynamicVariables={dynamicVariables} />;
}

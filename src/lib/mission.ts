import { QUESTIONNAIRE_SECTIONS } from "@/lib/constants/questionnaire";
import type {
  AssistantAnswer,
  MissionState,
  SectionProgress,
  SectionStatus,
} from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMissionState(
  supabase: SupabaseClient,
): Promise<MissionState | null> {
  // Parallel queries for speed
  const [missionRes, answersRes, conversationsRes] = await Promise.all([
    supabase.from("assistant_mission").select("*").single(),
    supabase
      .from("assistant_answers")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("assistant_conversations")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const mission = missionRes.data;
  if (!mission) return null;

  const answers = answersRes.data;
  const conversations = (conversationsRes.data ?? []).filter(
    (c: { mission_id: string | null }) => c.mission_id === mission.id,
  );

  const allAnswers = answers ?? [];
  const answersBySection = new Map<number, AssistantAnswer[]>();
  for (const a of allAnswers) {
    const list = answersBySection.get(a.section_number) ?? [];
    list.push(a);
    answersBySection.set(a.section_number, list);
  }

  const sections: SectionProgress[] = QUESTIONNAIRE_SECTIONS.map((s) => {
    const sectionAnswers = answersBySection.get(s.number) ?? [];
    const totalQuestions = s.questions.length;
    const answeredCount = sectionAnswers.length;

    let status: SectionStatus = "not_started";
    if (answeredCount > 0 && answeredCount < totalQuestions) status = "partial";
    if (answeredCount >= totalQuestions) status = "complete";

    return {
      number: s.number,
      name: s.name,
      status,
      answeredCount,
      totalQuestions,
    };
  });

  const nextSection = sections.find((s) => s.status !== "complete") ?? null;
  const missingSectionNumbers = sections
    .filter((s) => s.status !== "complete")
    .map((s) => s.number);
  const allAnswersSummary = allAnswers
    .map((a) => `[${a.section_name}] ${a.question_key}: ${a.answer_text}`)
    .join("\n");

  return {
    mission,
    sections,
    nextSection: nextSection
      ? { number: nextSection.number, name: nextSection.name }
      : null,
    recentAnswers: allAnswers.slice(0, 10),
    conversations: conversations ?? [],
    allAnswersSummary,
    missingSectionNumbers,
  };
}

export function calculateProgress(sections: SectionProgress[]): number {
  const complete = sections.filter((s) => s.status === "complete").length;
  return Math.round((complete / sections.length) * 100);
}

// =============================================================================
// Database types — mirrors the Supabase schema exactly.
// =============================================================================

// -- Enums as union types -------------------------------------------------- //

export type MissionStatus = "in_progress" | "completed";
export type ConversationStatus = "active" | "paused" | "completed";
export type Confidence = "high" | "medium" | "low";
export type FeatureRequestPriority = "low" | "medium" | "high";
export type FeatureRequestStatus =
  | "new"
  | "reviewed"
  | "planned"
  | "done"
  | "rejected";
export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "new" | "investigating" | "resolved" | "wont_fix";
export type KnowledgeCategory =
  | "project_spec"
  | "how_to"
  | "faq"
  | "release_notes"
  | "client_profile";
export type KnowledgeSource = "manual" | "auto_extracted" | "answered_question";
export type KnowledgeStatus = "pending" | "active" | "archived";
export type UnansweredStatus = "unanswered" | "answered";

// -- Row interfaces -------------------------------------------------------- //

export interface AssistantMission {
  id: string;
  status: MissionStatus;
  progress_percentage: number;
  total_answers: number;
  total_conversations: number;
  created_at: string;
  updated_at: string;
}

export interface AssistantConversation {
  id: string;
  mission_id: string | null;
  status: ConversationStatus;
  last_section: number;
  elevenlabs_conversation_id: string | null;
  context_snapshot: Record<string, unknown> | null;
  duration_seconds: number | null;
  sections_covered: number[];
  created_at: string;
  updated_at: string;
}

export interface AssistantAnswer {
  id: string;
  session_id: string; // still called session_id in DB FK
  section_number: number;
  section_name: string;
  question_key: string;
  answer_text: string;
  answer_structured: Record<string, unknown> | null;
  confidence: Confidence;
  created_at: string;
}

export interface AssistantTranscript {
  id: string;
  session_id: string;
  full_transcript: string | null;
  summary: string | null;
  gap_analysis: Record<string, unknown> | null;
  created_at: string;
}

export interface AssistantFeatureRequest {
  id: string;
  session_id: string;
  description: string;
  context: string | null;
  priority: FeatureRequestPriority;
  status: FeatureRequestStatus;
  admin_notes: string | null;
  created_at: string;
}

export interface AssistantIssue {
  id: string;
  session_id: string;
  description: string;
  context: string | null;
  severity: IssueSeverity;
  status: IssueStatus;
  admin_notes: string | null;
  created_at: string;
}

export interface AssistantKnowledge {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  source: KnowledgeSource;
  source_session_id: string | null;
  elevenlabs_doc_id: string | null;
  status: KnowledgeStatus;
  created_at: string;
  updated_at: string;
}

export interface AssistantUnanswered {
  id: string;
  session_id: string;
  question: string;
  context: string | null;
  answer: string | null;
  status: UnansweredStatus;
  knowledge_entry_id: string | null;
  created_at: string;
}

// -- Computed types -------------------------------------------------------- //

export type SectionStatus = "not_started" | "partial" | "complete";

export interface SectionProgress {
  number: number;
  name: string;
  status: SectionStatus;
  answeredCount: number;
  totalQuestions: number;
}

export interface MissionState {
  mission: AssistantMission;
  sections: SectionProgress[];
  nextSection: { number: number; name: string } | null;
  recentAnswers: AssistantAnswer[];
  conversations: AssistantConversation[];
  allAnswersSummary: string;
  missingSectionNumbers: number[];
}

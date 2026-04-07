// =============================================================================
// Database types — mirrors the Supabase schema exactly.
// =============================================================================

// -- Enums as union types -------------------------------------------------- //

export type SessionMode = "discovery" | "support";
export type SessionStatus = "active" | "paused" | "completed";
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

export interface AssistantSession {
  id: string;
  client_name: string | null;
  client_email: string | null;
  client_company: string | null;
  mode: SessionMode;
  status: SessionStatus;
  progress_section: number;
  progress_total: number;
  elevenlabs_conversation_id: string | null;
  resume_token: string;
  context_snapshot: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface AssistantAnswer {
  id: string;
  session_id: string;
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

// -- Insert helpers (omit server-generated fields) ------------------------- //

export type AssistantSessionInsert = Omit<
  AssistantSession,
  "id" | "resume_token" | "created_at" | "updated_at"
> & {
  id?: string;
  resume_token?: string;
  created_at?: string;
  updated_at?: string;
};

export type AssistantAnswerInsert = Omit<
  AssistantAnswer,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

export type AssistantTranscriptInsert = Omit<
  AssistantTranscript,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

export type AssistantFeatureRequestInsert = Omit<
  AssistantFeatureRequest,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

export type AssistantIssueInsert = Omit<AssistantIssue, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

export type AssistantKnowledgeInsert = Omit<
  AssistantKnowledge,
  "id" | "created_at" | "updated_at"
> & {
  id?: string;
  created_at?: string;
  updated_at?: string;
};

export type AssistantUnansweredInsert = Omit<
  AssistantUnanswered,
  "id" | "created_at"
> & {
  id?: string;
  created_at?: string;
};

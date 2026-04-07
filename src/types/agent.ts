// =============================================================================
// Agent payload types — shapes sent by ElevenLabs server tools.
// =============================================================================

export interface SaveAnswerPayload {
  session_id: string;
  section_number: number;
  section_name: string;
  question_key: string;
  answer_text: string;
  answer_structured?: Record<string, unknown>;
}

export interface UpdateProgressPayload {
  session_id: string;
  section_number: number;
  section_name: string;
}

export interface LogFeatureRequestPayload {
  session_id: string;
  description: string;
  context?: string;
}

export interface LogIssuePayload {
  session_id: string;
  description: string;
  context?: string;
}

export interface LogUnansweredPayload {
  session_id: string;
  question: string;
  context?: string;
}

export interface ContextSnapshot {
  last_section: number;
  key_facts: string[];
  completed_sections: number[];
  transcript_summary: string;
}

export interface PauseSessionPayload {
  session_id: string;
  context_snapshot: ContextSnapshot;
}

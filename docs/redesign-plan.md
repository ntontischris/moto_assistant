# Moto Assistant Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the multi-page, multi-session app into a single-page unified discovery experience with persistent agent memory.

**Architecture:** One page (`/`) with two states (idle/voice). One mission record in DB. Multiple conversations per mission. Agent receives full context (all previous answers + missing sections) before each conversation via dynamic variables.

**Tech Stack:** Next.js 16, Supabase, Eleven Labs Conversational AI, Tailwind CSS, Framer Motion

---

## File Structure (after redesign)

```
src/
├── app/
│   ├── page.tsx                          # Client page (idle + voice states)
│   ├── layout.tsx                        # Root layout (unchanged)
│   ├── login/page.tsx                    # Admin login (unchanged)
│   ├── dashboard/
│   │   ├── layout.tsx                    # Auth guard + sidebar (unchanged)
│   │   ├── page.tsx                      # Overview (updated queries)
│   │   ├── conversations/[id]/page.tsx   # Conversation detail (renamed)
│   │   ├── knowledge/page.tsx            # Knowledge (unchanged)
│   │   └── unanswered/page.tsx           # Unanswered (unchanged)
│   └── api/
│       ├── mission/route.ts              # NEW: GET mission state
│       ├── conversations/
│       │   └── route.ts                  # NEW: POST create, PATCH update
│       ├── agent/                        # Server tools (update session_id→conversation_id)
│       │   ├── save-answer/route.ts
│       │   ├── update-progress/route.ts
│       │   ├── log-feature-request/route.ts
│       │   ├── log-issue/route.ts
│       │   ├── log-unanswered/route.ts
│       │   └── pause-session/route.ts
│       ├── signed-url/route.ts           # (unchanged)
│       ├── knowledge/                    # (unchanged)
│       └── webhooks/                     # (update to conversations)
├── components/
│   ├── client/
│   │   ├── mission-progress.tsx          # NEW: progress bar + stats
│   │   ├── missing-sections.tsx          # NEW: sections needing answers
│   │   ├── recent-answers.tsx            # NEW: last answers list
│   │   ├── conversation-history.tsx      # NEW: past conversations
│   │   └── voice-inline.tsx              # NEW: inline voice (wraps voice components)
│   ├── voice/                            # (keep orb, controls, transcript, progress-bar)
│   │   ├── voice-orb.tsx
│   │   ├── voice-controls.tsx
│   │   ├── progress-bar.tsx
│   │   └── live-transcript.tsx
│   └── dashboard/                        # (minimal changes)
├── lib/                                  # (mostly unchanged)
│   ├── mission.ts                        # NEW: mission helper functions
│   └── ...
└── types/
    ├── database.ts                       # Updated types
    └── agent.ts                          # (unchanged)
```

### Files to DELETE
- `src/app/session/new/page.tsx`
- `src/app/session/[id]/page.tsx`
- `src/app/session/[id]/complete/page.tsx`
- `src/app/resume/[token]/page.tsx`
- `src/app/api/sessions/create/route.ts`
- `src/app/api/sessions/resume/route.ts`
- `src/components/session/pre-session-form.tsx`
- `src/components/landing/hero.tsx`
- `src/components/landing/mode-selector.tsx`
- `src/components/landing/resume-banner.tsx`
- `src/components/voice/voice-session.tsx` (replaced by voice-inline.tsx)

---

## Task 1: Database Migration — Mission Model

**Files:**
- Create: `supabase/migrations/20260408000000_mission_redesign.sql`
- Modify: `src/types/database.ts`

- [ ] **Step 1: Create migration SQL**

```sql
-- supabase/migrations/20260408000000_mission_redesign.sql

-- 1. Create mission table
create table if not exists public.assistant_mission (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  progress_percentage int not null default 0,
  total_answers int not null default 0,
  total_conversations int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assistant_mission enable row level security;
create policy "Admin select mission" on public.assistant_mission for select to authenticated using (true);
create policy "Admin update mission" on public.assistant_mission for update to authenticated using (true);

create trigger set_mission_updated_at
  before update on public.assistant_mission
  for each row execute function public.handle_updated_at();

-- 2. Insert the single mission record
insert into public.assistant_mission (id) values (gen_random_uuid());

-- 3. Rename sessions → conversations & update columns
alter table public.assistant_sessions rename to assistant_conversations;

alter table public.assistant_conversations
  add column mission_id uuid references public.assistant_mission(id),
  add column duration_seconds int,
  add column sections_covered int[] default '{}';

-- Set mission_id for existing rows
update public.assistant_conversations
  set mission_id = (select id from public.assistant_mission limit 1);

-- Drop columns no longer needed
alter table public.assistant_conversations
  drop column if exists client_name,
  drop column if exists client_email,
  drop column if exists client_company,
  drop column if exists mode,
  drop column if exists resume_token,
  drop column if exists progress_total;

-- Rename progress_section to last_section
alter table public.assistant_conversations
  rename column progress_section to last_section;

-- 4. Update foreign key column name in answers (logical rename via comment)
-- The column is still session_id in the DB but we'll alias it in TypeScript
-- No actual rename needed — Supabase FK still works

-- 5. Update RLS policies for renamed table
drop policy if exists "Admin select sessions" on public.assistant_conversations;
drop policy if exists "Admin insert sessions" on public.assistant_conversations;
drop policy if exists "Admin update sessions" on public.assistant_conversations;

create policy "Admin select conversations" on public.assistant_conversations for select to authenticated using (true);
create policy "Admin insert conversations" on public.assistant_conversations for insert to authenticated with check (true);
create policy "Admin update conversations" on public.assistant_conversations for update to authenticated using (true);

-- 6. Rename indexes
drop index if exists idx_sessions_status;
drop index if exists idx_sessions_resume_token;
drop index if exists idx_sessions_client_email;

create index idx_conversations_status on public.assistant_conversations (status);
create index idx_conversations_mission on public.assistant_conversations (mission_id);
```

- [ ] **Step 2: Run migration in Supabase SQL Editor**

Copy the SQL above and run it in the Supabase Dashboard → SQL Editor.

- [ ] **Step 3: Update TypeScript types**

Replace the content of `src/types/database.ts`:

```typescript
// =============================================================================
// Database types — mirrors the Supabase schema exactly.
// =============================================================================

export type MissionStatus = "in_progress" | "completed";
export type ConversationStatus = "active" | "paused" | "completed";
export type Confidence = "high" | "medium" | "low";
export type FeatureRequestPriority = "low" | "medium" | "high";
export type FeatureRequestStatus = "new" | "reviewed" | "planned" | "done" | "rejected";
export type IssueSeverity = "low" | "medium" | "high" | "critical";
export type IssueStatus = "new" | "investigating" | "resolved" | "wont_fix";
export type KnowledgeCategory = "project_spec" | "how_to" | "faq" | "release_notes" | "client_profile";
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
  session_id: string; // still called session_id in DB
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
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260408000000_mission_redesign.sql src/types/database.ts
git commit -m "feat: add mission model, rename sessions to conversations"
```

---

## Task 2: Mission API & Helper

**Files:**
- Create: `src/lib/mission.ts`
- Create: `src/app/api/mission/route.ts`
- Create: `src/app/api/conversations/route.ts`

- [ ] **Step 1: Create mission helper**

```typescript
// src/lib/mission.ts
import { QUESTIONNAIRE_SECTIONS } from "@/lib/constants/questionnaire";
import type { AssistantAnswer, MissionState, SectionProgress, SectionStatus } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getMissionState(supabase: SupabaseClient): Promise<MissionState | null> {
  const { data: mission } = await supabase
    .from("assistant_mission")
    .select("*")
    .single();

  if (!mission) return null;

  const { data: answers } = await supabase
    .from("assistant_answers")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: conversations } = await supabase
    .from("assistant_conversations")
    .select("*")
    .eq("mission_id", mission.id)
    .order("created_at", { ascending: false });

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
    nextSection: nextSection ? { number: nextSection.number, name: nextSection.name } : null,
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
```

- [ ] **Step 2: Create mission API route**

```typescript
// src/app/api/mission/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMissionState } from "@/lib/mission";

export async function GET() {
  const supabase = createAdminClient();
  const state = await getMissionState(supabase);

  if (!state) {
    return NextResponse.json({ error: "No mission found" }, { status: 404 });
  }

  return NextResponse.json(state);
}
```

- [ ] **Step 3: Create conversations API route**

```typescript
// src/app/api/conversations/route.ts
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  const supabase = createAdminClient();

  // Get mission ID
  const { data: mission } = await supabase
    .from("assistant_mission")
    .select("id")
    .single();

  if (!mission) {
    return NextResponse.json({ error: "No mission" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("assistant_conversations")
    .insert({
      mission_id: mission.id,
      status: "active",
      last_section: 0,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Increment conversation count
  await supabase.rpc("increment_mission_conversations", { mission_row_id: mission.id });

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("assistant_conversations")
    .update({
      elevenlabs_conversation_id: body.elevenlabs_conversation_id,
      status: body.status,
      last_section: body.last_section,
      sections_covered: body.sections_covered,
      duration_seconds: body.duration_seconds,
    })
    .eq("id", body.conversation_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
```

Note: Add a Supabase RPC function in the migration for incrementing:
```sql
create or replace function increment_mission_conversations(mission_row_id uuid)
returns void language sql as $$
  update assistant_mission
  set total_conversations = total_conversations + 1
  where id = mission_row_id;
$$;
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/mission.ts src/app/api/mission/ src/app/api/conversations/
git commit -m "feat: add mission state helper and API routes"
```

---

## Task 3: Delete Old Pages & Components

**Files to delete:**
- `src/app/session/` (entire directory)
- `src/app/resume/` (entire directory)
- `src/app/api/sessions/` (entire directory)
- `src/components/session/` (entire directory)
- `src/components/landing/` (entire directory)
- `src/components/voice/voice-session.tsx`

- [ ] **Step 1: Delete old files**

```bash
rm -rf src/app/session src/app/resume src/app/api/sessions
rm -rf src/components/session src/components/landing
rm src/components/voice/voice-session.tsx
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "chore: remove old multi-session pages and components"
```

---

## Task 4: Client Components — Progress & History

**Files:**
- Create: `src/components/client/mission-progress.tsx`
- Create: `src/components/client/missing-sections.tsx`
- Create: `src/components/client/recent-answers.tsx`
- Create: `src/components/client/conversation-history.tsx`

- [ ] **Step 1: Create mission-progress.tsx**

```typescript
// src/components/client/mission-progress.tsx
"use client";

import { motion } from "framer-motion";

interface MissionProgressProps {
  percentage: number;
  completeSections: number;
  totalSections: number;
}

export function MissionProgress({ percentage, completeSections, totalSections }: MissionProgressProps) {
  return (
    <div className="w-full rounded-2xl border p-6" style={{ borderColor: "var(--gray-700)", backgroundColor: "var(--gray-900)" }}>
      <div className="mb-2 flex items-end justify-between">
        <span className="text-3xl font-bold">{percentage}%</span>
        <span className="text-sm" style={{ color: "var(--gray-500)" }}>
          {completeSections}/{totalSections} ενότητες
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full" style={{ backgroundColor: "var(--gray-700)" }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--red)" }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create missing-sections.tsx**

```typescript
// src/components/client/missing-sections.tsx
import type { SectionProgress } from "@/types/database";

interface MissingSectionsProps {
  sections: SectionProgress[];
}

const statusDot: Record<string, string> = {
  not_started: "bg-red-500",
  partial: "bg-yellow-500",
  complete: "bg-green-500",
};

export function MissingSections({ sections }: MissingSectionsProps) {
  const incomplete = sections.filter((s) => s.status !== "complete");

  if (incomplete.length === 0) {
    return (
      <div className="rounded-xl border p-4" style={{ borderColor: "var(--gray-700)" }}>
        <p className="text-sm text-green-400">Όλες οι ενότητες ολοκληρώθηκαν!</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--gray-300)" }}>
        Τι λείπει
      </h3>
      <div className="space-y-2">
        {incomplete.map((s) => (
          <div key={s.number} className="flex items-center gap-3 text-sm">
            <div className={`h-2 w-2 rounded-full ${statusDot[s.status]}`} />
            <span style={{ color: "var(--gray-300)" }}>{s.name}</span>
            {s.status === "partial" && (
              <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                ({s.answeredCount}/{s.totalQuestions})
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create recent-answers.tsx**

```typescript
// src/components/client/recent-answers.tsx
import { Check } from "lucide-react";
import type { AssistantAnswer } from "@/types/database";

interface RecentAnswersProps {
  answers: AssistantAnswer[];
}

export function RecentAnswers({ answers }: RecentAnswersProps) {
  if (answers.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--gray-300)" }}>
        Τελευταίες απαντήσεις
      </h3>
      <div className="space-y-2">
        {answers.map((a) => (
          <div key={a.id} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-400" />
            <div>
              <span style={{ color: "var(--gray-500)" }}>{a.question_key}: </span>
              <span style={{ color: "var(--gray-300)" }}>{a.answer_text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create conversation-history.tsx**

```typescript
// src/components/client/conversation-history.tsx
"use client";

import { ChevronDown, Clock, MessageSquare } from "lucide-react";
import { useState } from "react";
import type { AssistantConversation } from "@/types/database";

interface ConversationHistoryProps {
  conversations: AssistantConversation[];
}

export function ConversationHistory({ conversations }: ConversationHistoryProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (conversations.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-semibold"
        style={{ color: "var(--gray-300)" }}
      >
        <span>Ιστορικό ({conversations.length} συνομιλίες)</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {conversations.map((c, i) => (
            <div
              key={c.id}
              className="flex items-center gap-3 rounded-lg border px-3 py-2 text-sm"
              style={{ borderColor: "var(--gray-700)" }}
            >
              <MessageSquare className="h-3.5 w-3.5" style={{ color: "var(--gray-500)" }} />
              <span style={{ color: "var(--gray-300)" }}>
                {new Date(c.created_at).toLocaleDateString("el-GR")}
              </span>
              {c.duration_seconds && (
                <span className="flex items-center gap-1" style={{ color: "var(--gray-500)" }}>
                  <Clock className="h-3 w-3" />
                  {Math.round(c.duration_seconds / 60)}'
                </span>
              )}
              {c.sections_covered.length > 0 && (
                <span style={{ color: "var(--gray-500)" }}>
                  Ενότητες {c.sections_covered.join(", ")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/client/
git commit -m "feat: add client dashboard components (progress, sections, answers, history)"
```

---

## Task 5: Voice Inline Component

**Files:**
- Create: `src/components/client/voice-inline.tsx`

- [ ] **Step 1: Create voice-inline.tsx**

This replaces the old `voice-session.tsx`. Key differences:
- No page navigation on disconnect — returns to idle state via callback
- Creates conversation via API before starting
- Passes full mission context as dynamic variables

```typescript
// src/components/client/voice-inline.tsx
"use client";

import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { useCallback, useRef, useState } from "react";
import { VoiceOrb } from "@/components/voice/voice-orb";
import { VoiceControls } from "@/components/voice/voice-controls";
import { ProgressBar } from "@/components/voice/progress-bar";
import { LiveTranscript, type TranscriptEntry } from "@/components/voice/live-transcript";
import { TOTAL_SECTIONS } from "@/lib/constants/questionnaire";
import type { MissionState } from "@/types/database";

interface VoiceInlineProps {
  missionState: MissionState;
  onSessionEnd: () => void;
}

function VoiceInlineInner({ missionState, onSessionEnd }: VoiceInlineProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([]);
  const [currentSection, setCurrentSection] = useState(
    missionState.nextSection?.number ?? 1
  );
  const isEndingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const conversation = useConversation({
    onMessage: (message) => {
      if (message && typeof message === "object" && "message" in message) {
        const msg = message as { message: string; source: string };
        if (msg.message) {
          setTranscriptEntries((prev) => [
            ...prev,
            {
              speaker: msg.source === "user" ? "user" : "agent",
              text: msg.message,
              timestamp: new Date().toLocaleTimeString("el-GR", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ]);
        }
      }
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
    },
    onDisconnect: () => {
      if (isEndingRef.current && conversationIdRef.current) {
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        fetch("/api/conversations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversation_id: conversationIdRef.current,
            status: "completed",
            duration_seconds: duration,
          }),
        }).finally(() => {
          onSessionEnd();
        });
      }
    },
    clientTools: {
      update_progress: async (params: { section_number?: number }) => {
        const section = params.section_number ?? currentSection + 1;
        setCurrentSection(section);
        return `Progress updated to section ${section}`;
      },
    },
  });

  const startConversation = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create conversation record
      const convRes = await fetch("/api/conversations", { method: "POST" });
      if (!convRes.ok) return;
      const { id: convId } = await convRes.json();
      conversationIdRef.current = convId;
      startTimeRef.current = Date.now();

      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      if (!agentId) return;

      await conversation.startSession({
        agentId,
        connectionType: "websocket",
        dynamicVariables: {
          conversation_id: convId,
          mission_progress: String(missionState.mission.progress_percentage),
          previous_answers: missionState.allAnswersSummary.slice(0, 3000),
          missing_sections: missionState.missingSectionNumbers.join(","),
          next_section: String(missionState.nextSection?.number ?? 1),
          next_section_name: missionState.nextSection?.name ?? "",
          conversation_number: String(missionState.conversations.length + 1),
          is_resumed: missionState.conversations.length > 0 ? "true" : "false",
        },
      });
    } catch (err) {
      console.error("Failed to start:", err);
    }
  }, [conversation, missionState]);

  const handlePause = useCallback(async () => {
    isEndingRef.current = true;
    await conversation.endSession();
  }, [conversation]);

  const handleEnd = useCallback(async () => {
    isEndingRef.current = true;
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-between py-8">
      <div className="w-full max-w-md">
        <ProgressBar currentSection={currentSection} totalSections={TOTAL_SECTIONS} />
      </div>

      <div className="flex flex-col items-center gap-6">
        <VoiceOrb status={conversation.status} isSpeaking={conversation.isSpeaking} />

        {conversation.status === "disconnected" && (
          <button
            onClick={startConversation}
            className="rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--red)" }}
          >
            Ξεκινήστε
          </button>
        )}

        {conversation.status === "connecting" && (
          <p className="text-sm" style={{ color: "var(--gray-400)" }}>Σύνδεση...</p>
        )}

        {conversation.status === "connected" && (
          <p className="text-sm" style={{ color: "var(--gray-400)" }}>
            {conversation.isSpeaking ? "Ο βοηθός μιλάει..." : "Ακούω..."}
          </p>
        )}
      </div>

      <VoiceControls
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        onPause={handlePause}
        onEnd={handleEnd}
        isActive={conversation.status === "connected"}
      />

      {transcriptEntries.length > 0 && (
        <div className="mt-4 w-full max-w-md space-y-2 rounded-xl border p-4" style={{ borderColor: "var(--gray-700)" }}>
          <h4 className="text-xs font-semibold" style={{ color: "var(--gray-500)" }}>Μεταγραφή</h4>
          {transcriptEntries.slice(-5).map((e, i) => (
            <div key={i} className="text-sm" style={{ color: e.speaker === "agent" ? "var(--gray-400)" : "var(--gray-200)" }}>
              <span className="text-xs" style={{ color: "var(--gray-500)" }}>
                {e.speaker === "agent" ? "Βοηθός" : "Εσείς"}:
              </span>{" "}
              {e.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function VoiceInline(props: VoiceInlineProps) {
  return (
    <ConversationProvider>
      <VoiceInlineInner {...props} />
    </ConversationProvider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/client/voice-inline.tsx
git commit -m "feat: add inline voice component with mission context"
```

---

## Task 6: Unified Client Page

**Files:**
- Rewrite: `src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

```typescript
// src/app/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Mic } from "lucide-react";
import { MissionProgress } from "@/components/client/mission-progress";
import { MissingSections } from "@/components/client/missing-sections";
import { RecentAnswers } from "@/components/client/recent-answers";
import { ConversationHistory } from "@/components/client/conversation-history";
import { VoiceInline } from "@/components/client/voice-inline";
import type { MissionState } from "@/types/database";
import { calculateProgress } from "@/lib/mission";

export default function ClientPage() {
  const [missionState, setMissionState] = useState<MissionState | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMission = useCallback(async () => {
    const res = await fetch("/api/mission");
    if (res.ok) {
      const data = await res.json();
      setMissionState(data);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchMission();
  }, [fetchMission]);

  const handleSessionEnd = useCallback(() => {
    setIsVoiceActive(false);
    fetchMission(); // refresh data
  }, [fetchMission]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--gray-700)] border-t-[var(--red)]" />
      </div>
    );
  }

  if (!missionState) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p style={{ color: "var(--gray-500)" }}>Δεν βρέθηκε mission. Επικοινωνήστε με τον διαχειριστή.</p>
      </div>
    );
  }

  const progress = calculateProgress(missionState.sections);
  const completeSections = missionState.sections.filter((s) => s.status === "complete").length;

  // Voice active state
  if (isVoiceActive) {
    return (
      <div className="min-h-screen px-4">
        <VoiceInline missionState={missionState} onSessionEnd={handleSessionEnd} />
      </div>
    );
  }

  // Idle state — dashboard
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "var(--red)" }}>
          <span className="text-lg font-bold text-white">M</span>
        </div>
        <div>
          <h1 className="text-lg font-bold">MotoMarket Discovery</h1>
          <p className="text-xs" style={{ color: "var(--gray-500)" }}>Ανάλυση Απαιτήσεων ERP & WMS</p>
        </div>
      </div>

      {/* Progress */}
      <MissionProgress
        percentage={progress}
        completeSections={completeSections}
        totalSections={missionState.sections.length}
      />

      {/* CTA */}
      <button
        onClick={() => setIsVoiceActive(true)}
        className="flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: "var(--red)" }}
      >
        <Mic className="h-5 w-5" />
        {missionState.conversations.length === 0
          ? "Ξεκινήστε τη συνομιλία"
          : "Συνεχίστε τη συνομιλία"}
      </button>
      {missionState.nextSection && (
        <p className="-mt-4 text-center text-xs" style={{ color: "var(--gray-500)" }}>
          Επόμενη ενότητα: {missionState.nextSection.name}
        </p>
      )}

      {/* Missing sections */}
      <MissingSections sections={missionState.sections} />

      {/* Recent answers */}
      <RecentAnswers answers={missionState.recentAnswers} />

      {/* History */}
      <ConversationHistory conversations={missionState.conversations} />

      {/* Footer */}
      <p className="mt-4 text-center text-xs" style={{ color: "var(--gray-500)" }}>
        ΕΜΠΙΣΤΕΥΤΙΚΟ — MotoMarket © 2026
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: rewrite client page as unified dashboard + inline voice"
```

---

## Task 7: Update Agent Prompt & Server Tools

**Files:**
- Modify: `scripts/setup-agent.ts`
- Modify: `src/app/api/agent/save-answer/route.ts` (update to use conversation_id)

- [ ] **Step 1: Update setup-agent.ts prompt**

Add memory section to the system prompt. The key dynamic variables change from `session_id` to `conversation_id`, and we add `previous_answers`, `missing_sections`, `conversation_number`.

Update the prompt string to include:
```
ΜΝΗΜΗ: Αυτή είναι η {{conversation_number}}η συνομιλία με τον πελάτη.
Έχετε ολοκληρώσει {{mission_progress}}% της ανάλυσης.

ΠΡΟΗΓΟΥΜΕΝΕΣ ΑΠΑΝΤΗΣΕΙΣ:
{{previous_answers}}

ΕΝΟΤΗΤΕΣ ΠΟΥ ΛΕΙΠΟΥΝ: {{missing_sections}}

Ξεκινήστε από την ενότητα {{next_section}}: {{next_section_name}}.
Αν {{is_resumed}} = false, χαιρετήστε και ξεκινήστε κανονικά.
Αν {{is_resumed}} = true, πείτε "Καλώς ήρθατε πίσω!" και συνεχίστε.

Conversation ID: {{conversation_id}}
```

Replace `Session ID: {{session_id}}` with `Conversation ID: {{conversation_id}}`.

- [ ] **Step 2: Update server tool routes — change session_id to conversation_id**

In all 6 routes under `src/app/api/agent/`, the `session_id` field in the request body maps to `assistant_conversations` (renamed from `assistant_sessions`). The DB column is still called `session_id` in child tables (answers, features, etc.), so **no DB changes needed** — just make sure the agent sends `conversation_id` which we map to `session_id` in the insert.

Update `save-answer/route.ts`:
```typescript
// In the body, accept conversation_id and map to session_id
const { error } = await supabase
  .from("assistant_answers")
  .upsert({
    session_id: body.conversation_id ?? body.session_id, // accept both
    ...
  });
```

Apply same pattern to all 6 routes.

- [ ] **Step 3: Run setup-agent.ts to update the ElevenLabs agent**

```bash
pnpm tsx scripts/setup-agent.ts
```

- [ ] **Step 4: Update server tools on ElevenLabs (change session_id → conversation_id in schemas)**

Update `scripts/setup-tools.ts` to use `conversation_id` instead of `session_id` in all request body schemas. Then run:

```bash
pnpm tsx scripts/setup-tools.ts
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: update agent prompt with memory, switch to conversation_id"
```

---

## Task 8: Update Dashboard Queries

**Files:**
- Modify: `src/app/dashboard/page.tsx` — query `assistant_conversations` instead of `assistant_sessions`
- Modify: `src/components/dashboard/sessions-table.tsx` — rename to conversations, update columns
- Modify: `src/components/dashboard/sidebar.tsx` — rename "Sessions" label
- Rename: `src/app/dashboard/sessions/[id]/page.tsx` → `src/app/dashboard/conversations/[id]/page.tsx`

- [ ] **Step 1: Update dashboard overview** — change table names in queries from `assistant_sessions` to `assistant_conversations`. Add mission stats at top.

- [ ] **Step 2: Update sessions table component** — rename to conversations, remove client_name/mode columns, add duration and sections_covered.

- [ ] **Step 3: Move sessions/[id] to conversations/[id]** — rename directory, update queries.

- [ ] **Step 4: Update sidebar** — change "Sessions" to "Conversations".

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: update dashboard to use mission/conversations model"
```

---

## Task 9: Build, Push, Deploy

- [ ] **Step 1: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Verify build**

```bash
pnpm build
```

- [ ] **Step 3: Push and deploy**

```bash
git push
```

Vercel auto-deploys from main.

- [ ] **Step 4: Run migration in Supabase SQL Editor** (if not done yet)

- [ ] **Step 5: Test end-to-end on production**

1. Open https://moto-assistant.vercel.app → see progress dashboard
2. Click "Συνεχίστε" → voice starts with context
3. Answer 2-3 questions → agent saves to DB
4. End session → returns to dashboard with updated progress
5. Check Supabase → answers visible
6. Open /dashboard → login → see conversation data

# Moto Assistant Redesign — Unified Discovery Experience

**Date:** 2026-04-08
**Status:** Approved
**Version:** 2.0

---

## 1. Overview

### What Changed
The Moto Assistant is being redesigned from a multi-session, multi-page app into a **single-page unified experience** for one client (MotoMarket). The voice agent, progress tracking, and conversation history all live on one page.

### Why
- V1 created a new session every visit — no continuity
- Agent didn't remember previous conversations
- Too many pages, no coherent flow
- Built for generic multi-client use, but it's for ONE business owner

### Core Principle
**One mission, one page, persistent memory.** The client opens the URL, sees their progress, continues talking. The agent remembers everything.

---

## 2. Architecture

### Data Model: Mission-Based

```
assistant_mission (1 record — MotoMarket)
├── status: in_progress | completed
├── progress_percentage: 50
├── total_answers: 23
├── total_conversations: 3
│
├── assistant_conversations (many)
│   ├── Conv #1: 8 Apr, 15 min, sections 1-3
│   ├── Conv #2: 8 Apr, 20 min, sections 4-5
│   └── Conv #3: next...
│
├── assistant_answers (cumulative, all conversations)
│   ├── section 1, question 1: "Ανώνυμη εταιρεία"
│   ├── section 1, question 2: "60 εργαζόμενοι"
│   └── ...
│
├── assistant_feature_requests
├── assistant_issues
└── assistant_unanswered
```

### Database Changes

**New table: `assistant_mission`**
```sql
create table assistant_mission (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  progress_percentage int not null default 0,
  total_answers int not null default 0,
  total_conversations int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

**Rename `assistant_sessions` → `assistant_conversations`**
Add columns:
- `mission_id uuid references assistant_mission(id)`
- `duration_seconds int`
- `sections_covered int[] default '{}'`

Remove columns:
- `client_name`, `client_email`, `client_company` (always MotoMarket)
- `mode` (always discovery)
- `resume_token` (not needed — always same URL)
- `progress_total` (lives on mission now)

**`assistant_answers`** — no schema change. `session_id` becomes `conversation_id` (rename FK).

**Section status** — computed, not stored:
- Compare answers in DB against questionnaire constants
- `not_started`: 0 answers for section
- `partial`: some answers but not all questions
- `complete`: all questions answered

### Routes

**Removed:**
- `/session/new`
- `/session/[id]`
- `/session/[id]/complete`
- `/resume/[token]`
- `POST /api/sessions/create`
- `GET /api/sessions/resume`

**New:**
- `GET /api/mission` — returns full mission state (progress, sections, answers, conversations)
- `POST /api/conversations/create` — creates new conversation linked to mission
- `PATCH /api/conversations/[id]` — updates conversation (duration, sections covered)

**Kept:**
- `/` — completely rewritten (client dashboard + inline voice)
- `/login` — admin login
- `/dashboard/*` — admin panel (queries updated to mission-based)
- `/api/agent/*` — all 6 server tools (unchanged)
- `/api/signed-url` — kept
- `/api/knowledge/*` — kept
- `/api/webhooks/*` — updated to use conversations

---

## 3. Client Page (`/`)

Single page with two states:

### State A: Idle (not in voice session)

Shows:
1. **Header** — MotoMarket logo + "Discovery"
2. **Progress card** — big progress bar, "7/14 ενότητες — 50%"
3. **CTA button** — "🎙️ Συνεχίστε τη συνομιλία" with subtitle "Επόμενη: Αποθήκη & WMS"
4. **Missing sections** — list of sections not yet completed, each with status dot (not_started = red, partial = yellow)
5. **Recent answers** — last 5-10 answers with checkmark
6. **Conversation history** — collapsible list of past conversations with date, duration, sections covered

### State B: Voice Active

Same page transforms:
1. **Top** — progress bar + current section name
2. **Center** — animated voice orb
3. **Status text** — "Ο βοηθός μιλάει..." / "Ακούω..."
4. **Controls** — Mute, Pause, End
5. **Live transcript** — bottom section (not side panel, simpler)

When voice ends → transitions back to State A with updated data (no page navigation).

### No Login Required
The client page is public. It's a private URL — anyone with the link can use it. Security through obscurity is fine for a single-client tool.

---

## 4. Agent Memory

### Before Each Conversation

1. Fetch `/api/mission`
2. Build context summary from all previous answers
3. Pass to agent as `dynamicVariables`:

```typescript
{
  conversation_id: "uuid",          // new conversation
  mission_progress: "50",           // percentage
  previous_answers: "JSON summary of all answers so far",
  missing_sections: "5,6,9,12",     // section numbers
  next_section: "5",
  next_section_name: "Αποθήκη & WMS",
  conversation_number: "4",         // this is the 4th conversation
}
```

### Agent System Prompt Update

Add to existing prompt:
```
ΜΝΗΜΗ: Αυτή είναι η {{conversation_number}}η συνομιλία σας με τον πελάτη.
Έχετε ολοκληρώσει {{mission_progress}}% της ανάλυσης.

ΠΡΟΗΓΟΥΜΕΝΕΣ ΑΠΑΝΤΗΣΕΙΣ:
{{previous_answers}}

ΛΕΙΠΟΥΝ ΟΙ ΕΝΟΤΗΤΕΣ: {{missing_sections}}

Ξεκινήστε από την ενότητα {{next_section}}: {{next_section_name}}.
Αν είναι η πρώτη συνομιλία, χαιρετήστε και ξεκινήστε κανονικά.
Αν είναι επιστροφή, πείτε "Καλώς ήρθατε πίσω!" και συνεχίστε.
```

---

## 5. Admin Dashboard Changes

### `/dashboard` Overview

- Shows mission progress (same as client but more detailed)
- Total conversations, total answers, completion %
- Open feature requests count
- Unanswered questions count

### `/dashboard/sessions/[id]` → `/dashboard/conversations/[id]`

- Rename in URL and queries
- Same tab structure (summary, transcript, answers, features, issues)

### Other dashboard pages — minimal changes

- Update queries from `assistant_sessions` to `assistant_conversations`
- Knowledge base and unanswered queue unchanged

---

## 6. File Changes

### Delete
- `src/app/session/new/page.tsx`
- `src/app/session/[id]/page.tsx`
- `src/app/session/[id]/complete/page.tsx`
- `src/app/resume/[token]/page.tsx`
- `src/components/session/pre-session-form.tsx`
- `src/components/landing/hero.tsx`
- `src/components/landing/mode-selector.tsx`
- `src/components/landing/resume-banner.tsx`
- `src/app/api/sessions/create/route.ts`
- `src/app/api/sessions/resume/route.ts`

### Rewrite
- `src/app/page.tsx` — unified client dashboard + inline voice
- `src/components/voice/voice-session.tsx` — no redirect, returns to idle state
- `src/app/dashboard/page.tsx` — mission-based queries
- `src/app/dashboard/sessions/[id]/page.tsx` → rename to conversations

### New
- `src/app/api/mission/route.ts` — GET mission state
- `src/app/api/conversations/create/route.ts` — POST new conversation
- `src/app/api/conversations/[id]/route.ts` — PATCH update conversation
- `src/components/client/mission-progress.tsx` — progress card
- `src/components/client/missing-sections.tsx` — sections list
- `src/components/client/recent-answers.tsx` — recent answers
- `src/components/client/conversation-history.tsx` — past conversations
- `src/components/client/voice-inline.tsx` — inline voice wrapper (State B)
- `supabase/migrations/20260408000000_mission_redesign.sql`

### Update
- `scripts/setup-agent.ts` — updated prompt with memory variables
- Server tool routes — change `session_id` references to `conversation_id`
- Post-call webhook — use conversation + mission

---

## 7. Non-Goals

- Multi-client support (this is for MotoMarket only)
- Support mode (focus on discovery first)
- Client login/auth (public URL is fine)
- Mobile-specific layout (responsive is enough)
- Offline support

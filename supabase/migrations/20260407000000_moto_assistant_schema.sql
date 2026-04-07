-- =============================================================================
-- Moto Assistant Schema
-- Tables, indexes, RLS policies, and triggers for the voice agent app.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Helper: updated_at trigger function
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. assistant_sessions
-- ---------------------------------------------------------------------------
create table public.assistant_sessions (
  id            uuid primary key default gen_random_uuid(),
  client_name   text,
  client_email  text,
  client_company text,
  mode          text not null check (mode in ('discovery', 'support')),
  status        text not null default 'active' check (status in ('active', 'paused', 'completed')),
  progress_section int not null default 0,
  progress_total   int not null default 14,
  elevenlabs_conversation_id text,
  resume_token  uuid default gen_random_uuid(),
  context_snapshot jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_sessions_status on public.assistant_sessions (status);
create index idx_sessions_resume_token on public.assistant_sessions (resume_token);
create index idx_sessions_client_email on public.assistant_sessions (client_email);

alter table public.assistant_sessions enable row level security;

create policy "Admin select sessions"
  on public.assistant_sessions for select
  to authenticated
  using (true);

create policy "Admin insert sessions"
  on public.assistant_sessions for insert
  to authenticated
  with check (true);

create policy "Admin update sessions"
  on public.assistant_sessions for update
  to authenticated
  using (true)
  with check (true);

create trigger set_sessions_updated_at
  before update on public.assistant_sessions
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 3. assistant_answers
-- ---------------------------------------------------------------------------
create table public.assistant_answers (
  id               uuid primary key default gen_random_uuid(),
  session_id       uuid not null references public.assistant_sessions (id) on delete cascade,
  section_number   int not null,
  section_name     text not null,
  question_key     text not null,
  answer_text      text not null,
  answer_structured jsonb,
  confidence       text not null default 'medium' check (confidence in ('high', 'medium', 'low')),
  created_at       timestamptz not null default now(),

  constraint uq_answers_session_question unique (session_id, question_key)
);

create index idx_answers_session_id on public.assistant_answers (session_id);

alter table public.assistant_answers enable row level security;

create policy "Admin select answers"
  on public.assistant_answers for select
  to authenticated
  using (true);

create policy "Admin insert answers"
  on public.assistant_answers for insert
  to authenticated
  with check (true);

create policy "Admin update answers"
  on public.assistant_answers for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 4. assistant_transcripts
-- ---------------------------------------------------------------------------
create table public.assistant_transcripts (
  id              uuid primary key default gen_random_uuid(),
  session_id      uuid not null references public.assistant_sessions (id) on delete cascade,
  full_transcript text,
  summary         text,
  gap_analysis    jsonb,
  created_at      timestamptz not null default now()
);

alter table public.assistant_transcripts enable row level security;

create policy "Admin select transcripts"
  on public.assistant_transcripts for select
  to authenticated
  using (true);

create policy "Admin insert transcripts"
  on public.assistant_transcripts for insert
  to authenticated
  with check (true);

create policy "Admin update transcripts"
  on public.assistant_transcripts for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 5. assistant_feature_requests
-- ---------------------------------------------------------------------------
create table public.assistant_feature_requests (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.assistant_sessions (id) on delete cascade,
  description text not null,
  context     text,
  priority    text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status      text not null default 'new' check (status in ('new', 'reviewed', 'planned', 'done', 'rejected')),
  admin_notes text,
  created_at  timestamptz not null default now()
);

create index idx_feature_requests_status on public.assistant_feature_requests (status);

alter table public.assistant_feature_requests enable row level security;

create policy "Admin select feature_requests"
  on public.assistant_feature_requests for select
  to authenticated
  using (true);

create policy "Admin insert feature_requests"
  on public.assistant_feature_requests for insert
  to authenticated
  with check (true);

create policy "Admin update feature_requests"
  on public.assistant_feature_requests for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 6. assistant_issues
-- ---------------------------------------------------------------------------
create table public.assistant_issues (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references public.assistant_sessions (id) on delete cascade,
  description text not null,
  context     text,
  severity    text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status      text not null default 'new' check (status in ('new', 'investigating', 'resolved', 'wont_fix')),
  admin_notes text,
  created_at  timestamptz not null default now()
);

create index idx_issues_status on public.assistant_issues (status);

alter table public.assistant_issues enable row level security;

create policy "Admin select issues"
  on public.assistant_issues for select
  to authenticated
  using (true);

create policy "Admin insert issues"
  on public.assistant_issues for insert
  to authenticated
  with check (true);

create policy "Admin update issues"
  on public.assistant_issues for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- 7. assistant_knowledge
-- ---------------------------------------------------------------------------
create table public.assistant_knowledge (
  id                uuid primary key default gen_random_uuid(),
  category          text not null check (category in ('project_spec', 'how_to', 'faq', 'release_notes', 'client_profile')),
  title             text not null,
  content           text not null,
  source            text not null default 'manual' check (source in ('manual', 'auto_extracted', 'answered_question')),
  source_session_id uuid references public.assistant_sessions (id),
  elevenlabs_doc_id text,
  status            text not null default 'active' check (status in ('pending', 'active', 'archived')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_knowledge_category on public.assistant_knowledge (category);
create index idx_knowledge_status on public.assistant_knowledge (status);

alter table public.assistant_knowledge enable row level security;

create policy "Admin select knowledge"
  on public.assistant_knowledge for select
  to authenticated
  using (true);

create policy "Admin insert knowledge"
  on public.assistant_knowledge for insert
  to authenticated
  with check (true);

create policy "Admin update knowledge"
  on public.assistant_knowledge for update
  to authenticated
  using (true)
  with check (true);

create trigger set_knowledge_updated_at
  before update on public.assistant_knowledge
  for each row
  execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 8. assistant_unanswered
-- ---------------------------------------------------------------------------
create table public.assistant_unanswered (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references public.assistant_sessions (id) on delete cascade,
  question           text not null,
  context            text,
  answer             text,
  status             text not null default 'unanswered' check (status in ('unanswered', 'answered')),
  knowledge_entry_id uuid references public.assistant_knowledge (id),
  created_at         timestamptz not null default now()
);

create index idx_unanswered_status on public.assistant_unanswered (status);

alter table public.assistant_unanswered enable row level security;

create policy "Admin select unanswered"
  on public.assistant_unanswered for select
  to authenticated
  using (true);

create policy "Admin insert unanswered"
  on public.assistant_unanswered for insert
  to authenticated
  with check (true);

create policy "Admin update unanswered"
  on public.assistant_unanswered for update
  to authenticated
  using (true)
  with check (true);

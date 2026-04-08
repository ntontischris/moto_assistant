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

update public.assistant_conversations
  set mission_id = (select id from public.assistant_mission limit 1);

alter table public.assistant_conversations
  drop column if exists client_name,
  drop column if exists client_email,
  drop column if exists client_company,
  drop column if exists mode,
  drop column if exists resume_token,
  drop column if exists progress_total;

alter table public.assistant_conversations
  rename column progress_section to last_section;

-- 4. Update RLS policies for renamed table
drop policy if exists "Admin select sessions" on public.assistant_conversations;
drop policy if exists "Admin insert sessions" on public.assistant_conversations;
drop policy if exists "Admin update sessions" on public.assistant_conversations;

create policy "Admin select conversations" on public.assistant_conversations for select to authenticated using (true);
create policy "Admin insert conversations" on public.assistant_conversations for insert to authenticated with check (true);
create policy "Admin update conversations" on public.assistant_conversations for update to authenticated using (true);

-- 5. Update indexes
drop index if exists idx_sessions_status;
drop index if exists idx_sessions_resume_token;
drop index if exists idx_sessions_client_email;

create index idx_conversations_status on public.assistant_conversations (status);
create index idx_conversations_mission on public.assistant_conversations (mission_id);

-- 6. RPC for incrementing conversation count
create or replace function increment_mission_conversations(mission_row_id uuid)
returns void language sql as $$
  update assistant_mission
  set total_conversations = total_conversations + 1
  where id = mission_row_id;
$$;

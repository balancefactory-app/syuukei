-- =========================================================================
-- Therapy English Coach — Supabase スキーマ
-- Supabase の SQL Editor に貼り付けて実行してください。
-- 認証は Supabase Auth（メール+パスワード）を利用します。
-- 各テーブルは行レベルセキュリティ(RLS)で「本人の行のみ」に制限します。
-- =========================================================================

-- 練習セッション（1回のロールプレイ＝1行）--------------------------------
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  overall     integer not null,
  scenario_id text,
  scenario_ja text,
  created_at  timestamptz not null default now()
);

create index if not exists sessions_user_created_idx
  on public.sessions (user_id, created_at);

-- 保存フレーズ（お気に入り）----------------------------------------------
create table if not exists public.saved_phrases (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null,
  ja         text not null,
  simple     text not null,
  natural    text not null,
  kana       text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- 間違えた表現（要復習）--------------------------------------------------
-- id はクライアント側で発行した UUID を格納する。
create table if not exists public.mistakes (
  id          uuid primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  scenario_ja text not null,
  label       text not null,
  from_text   text not null,
  to_text     text not null,
  kana        text,
  note        text,
  mastered    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists mistakes_user_created_idx
  on public.mistakes (user_id, created_at desc);

-- =========================================================================
-- 行レベルセキュリティ(RLS)
-- =========================================================================
alter table public.sessions      enable row level security;
alter table public.saved_phrases enable row level security;
alter table public.mistakes      enable row level security;

-- sessions
create policy "sessions are owner-only (select)"
  on public.sessions for select using (auth.uid() = user_id);
create policy "sessions are owner-only (insert)"
  on public.sessions for insert with check (auth.uid() = user_id);
create policy "sessions are owner-only (update)"
  on public.sessions for update using (auth.uid() = user_id);
create policy "sessions are owner-only (delete)"
  on public.sessions for delete using (auth.uid() = user_id);

-- saved_phrases
create policy "saved_phrases are owner-only (select)"
  on public.saved_phrases for select using (auth.uid() = user_id);
create policy "saved_phrases are owner-only (insert)"
  on public.saved_phrases for insert with check (auth.uid() = user_id);
create policy "saved_phrases are owner-only (update)"
  on public.saved_phrases for update using (auth.uid() = user_id);
create policy "saved_phrases are owner-only (delete)"
  on public.saved_phrases for delete using (auth.uid() = user_id);

-- mistakes
create policy "mistakes are owner-only (select)"
  on public.mistakes for select using (auth.uid() = user_id);
create policy "mistakes are owner-only (insert)"
  on public.mistakes for insert with check (auth.uid() = user_id);
create policy "mistakes are owner-only (update)"
  on public.mistakes for update using (auth.uid() = user_id);
create policy "mistakes are owner-only (delete)"
  on public.mistakes for delete using (auth.uid() = user_id);

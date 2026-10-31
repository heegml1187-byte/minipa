-- Existing installations only. Run after checking public.memos exists.
-- Preserves all rows; restricts public reads to non-secret columns.
begin;
revoke all on table public.memos from public, anon, authenticated;
revoke all (id, title, content, password_hash, created_at)
  on public.memos from public, anon, authenticated;
grant usage on schema public to anon, authenticated, service_role;
grant select (id, title, content, created_at) on public.memos to anon, authenticated;
grant insert (title, content, password_hash) on public.memos to anon, authenticated;
grant select, insert, delete on public.memos to service_role;
alter table public.memos enable row level security;
commit;

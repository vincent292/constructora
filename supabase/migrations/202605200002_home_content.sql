alter table public.site_settings
  add column if not exists process_steps jsonb not null default '[]'::jsonb;


alter table public.admin_profiles
  add column if not exists business_unit text not null default 'constructora';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_profiles_business_unit_check'
  ) then
    alter table public.admin_profiles
      add constraint admin_profiles_business_unit_check
      check (business_unit in ('grupo', 'constructora', 'juridico', 'bienes-raices'));
  end if;
end $$;

alter table public.leads
  add column if not exists business_unit text not null default 'grupo';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_business_unit_check'
  ) then
    alter table public.leads
      add constraint leads_business_unit_check
      check (business_unit in ('grupo', 'constructora', 'juridico', 'bienes-raices'));
  end if;
end $$;

create table if not exists public.business_area_pages (
  slug text primary key check (slug in ('juridico', 'bienes-raices')),
  label text not null,
  eyebrow text not null,
  title text not null,
  accent text not null,
  description text not null,
  image text not null,
  tagline text not null,
  coverage text not null,
  coverage_description text not null,
  primary_label text not null,
  secondary_label text not null,
  services jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  process jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  contact_prompt text not null,
  footer_blurb text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_area_pages enable row level security;

drop policy if exists "public can read business area pages" on public.business_area_pages;
create policy "public can read business area pages" on public.business_area_pages
for select using (true);

drop policy if exists "authenticated can manage business area pages" on public.business_area_pages;
create policy "authenticated can manage business area pages" on public.business_area_pages
for all to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

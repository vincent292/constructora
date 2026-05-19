create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  hero_eyebrow text not null,
  hero_title text not null,
  hero_accent text not null,
  hero_description text not null,
  hero_image text not null,
  tagline text not null,
  location text not null,
  contact jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  location text not null,
  year text not null,
  area text not null,
  status text not null check (status in ('planificacion', 'en_progreso', 'finalizado')),
  client_name text not null,
  owner_name text not null,
  summary text not null,
  description text not null,
  hero_image text not null,
  gallery jsonb not null default '[]'::jsonb,
  plan_files jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  map_embed_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.work_updates (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  title text not null,
  date date not null,
  summary text not null,
  performed_by text,
  photos jsonb not null default '[]'::jsonb,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.work_updates
  add column if not exists performed_by text;

alter table public.work_updates
  add column if not exists photos jsonb not null default '[]'::jsonb;

alter table public.work_updates
  add column if not exists is_deleted boolean not null default false;

alter table public.work_updates
  add column if not exists deleted_at timestamptz;

create table if not exists public.buildings (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  location text not null,
  year text not null,
  area text not null,
  status text not null check (status in ('planificacion', 'en_progreso', 'finalizado')),
  client_name text not null,
  owner_name text not null,
  summary text not null,
  description text not null,
  hero_image text not null,
  gallery jsonb not null default '[]'::jsonb,
  plan_files jsonb not null default '[]'::jsonb,
  metrics jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  map_embed_url text,
  created_at timestamptz not null default now()
);

alter table public.buildings
  add column if not exists plan_files jsonb not null default '[]'::jsonb;

create table if not exists public.building_units (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  title text not null,
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  area text not null,
  floor_label text not null,
  price text,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text not null,
  image text not null,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'admin' check (role in ('admin', 'architect', 'site_manager', 'sales')),
  created_at timestamptz not null default now()
);

alter table public.admin_profiles
  add column if not exists email text;

create table if not exists public.work_assignments (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works(id) on delete cascade,
  user_id uuid not null references public.admin_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (work_id, user_id)
);

create table if not exists public.building_assignments (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  user_id uuid not null references public.admin_profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (building_id, user_id)
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text not null,
  message text not null,
  interest_type text not null check (interest_type in ('obra', 'edificio', 'departamento', 'general')),
  reference_slug text,
  unit_label text,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'seguimiento', 'cerrado')),
  admin_notes text,
  created_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
alter table public.services enable row level security;
alter table public.works enable row level security;
alter table public.work_updates enable row level security;
alter table public.buildings enable row level security;
alter table public.building_units enable row level security;
alter table public.team_members enable row level security;
alter table public.leads enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.work_assignments enable row level security;
alter table public.building_assignments enable row level security;

create or replace function public.cms_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.admin_profiles where user_id = auth.uid()),
    'architect'
  );
$$;

create or replace function public.is_cms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.cms_role() = 'admin';
$$;

create or replace function public.can_manage_work_updates(target_work_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_cms_admin()
    or (
      public.cms_role() in ('architect', 'site_manager')
      and exists (
        select 1
        from public.work_assignments
        where work_id = target_work_id
          and user_id = auth.uid()
      )
    );
$$;

create or replace function public.can_manage_leads()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.cms_role() in ('admin', 'sales');
$$;

drop policy if exists "public can read settings" on public.site_settings;
create policy "public can read settings" on public.site_settings for select using (true);

drop policy if exists "public can read services" on public.services;
create policy "public can read services" on public.services for select using (true);

drop policy if exists "public can read works" on public.works;
create policy "public can read works" on public.works for select using (true);

drop policy if exists "public can read work updates" on public.work_updates;
create policy "public can read work updates" on public.work_updates for select using (true);

drop policy if exists "public can read buildings" on public.buildings;
create policy "public can read buildings" on public.buildings for select using (true);

drop policy if exists "public can read units" on public.building_units;
create policy "public can read units" on public.building_units for select using (true);

drop policy if exists "public can read team" on public.team_members;
create policy "public can read team" on public.team_members for select using (true);

drop policy if exists "public can create leads" on public.leads;
create policy "public can create leads" on public.leads for insert with check (true);

drop policy if exists "authenticated can read own admin profile" on public.admin_profiles;
create policy "authenticated can read own admin profile" on public.admin_profiles
for select to authenticated using (auth.uid() = user_id or public.is_cms_admin());

drop policy if exists "authenticated can insert own admin profile" on public.admin_profiles;
create policy "authenticated can insert own admin profile" on public.admin_profiles
for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "authenticated can update own admin profile" on public.admin_profiles;
create policy "authenticated can update own admin profile" on public.admin_profiles
for update to authenticated
using (auth.uid() = user_id or public.is_cms_admin())
with check (auth.uid() = user_id or public.is_cms_admin());

drop policy if exists "authenticated can read profiles" on public.admin_profiles;
create policy "authenticated can read profiles" on public.admin_profiles
for select to authenticated using (auth.uid() = user_id or public.is_cms_admin());

drop policy if exists "authenticated can manage profiles" on public.admin_profiles;
create policy "authenticated can manage profiles" on public.admin_profiles
for all to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

drop policy if exists "authenticated can manage settings" on public.site_settings;
create policy "authenticated can manage settings" on public.site_settings
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage services" on public.services;
create policy "authenticated can manage services" on public.services
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage works" on public.works;
create policy "authenticated can manage works" on public.works
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage work updates" on public.work_updates;
create policy "authenticated can manage work updates" on public.work_updates
for all to authenticated
using (public.can_manage_work_updates(work_id))
with check (public.can_manage_work_updates(work_id));

drop policy if exists "authenticated can manage buildings" on public.buildings;
create policy "authenticated can manage buildings" on public.buildings
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage units" on public.building_units;
create policy "authenticated can manage units" on public.building_units
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage team" on public.team_members;
create policy "authenticated can manage team" on public.team_members
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage leads" on public.leads;
create policy "authenticated can manage leads" on public.leads
for all to authenticated using (public.can_manage_leads()) with check (public.can_manage_leads());

drop policy if exists "authenticated can manage work assignments" on public.work_assignments;
create policy "authenticated can manage work assignments" on public.work_assignments
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage building assignments" on public.building_assignments;
create policy "authenticated can manage building assignments" on public.building_assignments
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "public can view media" on storage.objects;
create policy "public can view media" on storage.objects
for select to public
using (bucket_id = 'media');

drop policy if exists "authenticated can upload media" on storage.objects;
create policy "authenticated can upload media" on storage.objects
for insert to authenticated
with check (bucket_id = 'media');

drop policy if exists "authenticated can update media" on storage.objects;
create policy "authenticated can update media" on storage.objects
for update to authenticated
using (bucket_id = 'media')
with check (bucket_id = 'media');

drop policy if exists "authenticated can delete media" on storage.objects;
create policy "authenticated can delete media" on storage.objects
for delete to authenticated
using (bucket_id = 'media');

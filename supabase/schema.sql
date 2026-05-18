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
  created_at timestamptz not null default now()
);

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
  metrics jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  map_embed_url text,
  created_at timestamptz not null default now()
);

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

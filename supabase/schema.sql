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
  process_steps jsonb not null default '[]'::jsonb,
  testimonials jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.site_settings
  add column if not exists process_steps jsonb not null default '[]'::jsonb;

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  text text not null,
  description text not null default '',
  hero_image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  price_label text,
  is_price_visible boolean not null default false,
  requires_location boolean not null default false,
  lead_prompt text not null default '',
  before_after_items jsonb not null default '[]'::jsonb,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.services
  add column if not exists slug text;

alter table public.services
  add column if not exists description text not null default '';

alter table public.services
  add column if not exists hero_image text not null default '';

alter table public.services
  add column if not exists gallery jsonb not null default '[]'::jsonb;

alter table public.services
  add column if not exists price_label text;

alter table public.services
  add column if not exists is_price_visible boolean not null default false;

alter table public.services
  add column if not exists requires_location boolean not null default false;

alter table public.services
  add column if not exists lead_prompt text not null default '';

alter table public.services
  add column if not exists before_after_items jsonb not null default '[]'::jsonb;

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
  brochure_file text,
  metrics jsonb not null default '[]'::jsonb,
  map_embed_url text,
  created_at timestamptz not null default now()
);

alter table public.works
  add column if not exists brochure_file text;

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
  brochure_file text,
  metrics jsonb not null default '[]'::jsonb,
  amenities jsonb not null default '[]'::jsonb,
  map_embed_url text,
  created_at timestamptz not null default now()
);

alter table public.buildings
  add column if not exists plan_files jsonb not null default '[]'::jsonb;

alter table public.buildings
  add column if not exists brochure_file text;

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
  business_unit text not null default 'constructora' check (business_unit in ('grupo', 'constructora', 'juridico', 'bienes-raices')),
  created_at timestamptz not null default now()
);

alter table public.admin_profiles
  add column if not exists email text;

alter table public.admin_profiles
  add column if not exists business_unit text not null default 'constructora';

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
  national_id text not null,
  phone text not null,
  email text,
  message text not null,
  business_unit text not null default 'grupo' check (business_unit in ('grupo', 'constructora', 'juridico', 'bienes-raices')),
  interest_type text not null check (interest_type in ('obra', 'edificio', 'departamento', 'general', 'servicio')),
  reference_slug text,
  reference_label text,
  unit_label text,
  location_text text,
  location_lat double precision,
  location_lng double precision,
  status text not null default 'nuevo' check (status in ('nuevo', 'contactado', 'seguimiento', 'cerrado')),
  admin_notes text,
  created_at timestamptz not null default now()
);

alter table public.leads
  add column if not exists national_id text;

alter table public.leads
  add column if not exists reference_label text;

alter table public.leads
  add column if not exists location_text text;

alter table public.leads
  add column if not exists location_lat double precision;

alter table public.leads
  add column if not exists location_lng double precision;

alter table public.leads
  add column if not exists business_unit text not null default 'grupo';

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

create table if not exists public.real_estate_properties (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  operation text not null check (operation in ('venta', 'alquiler')),
  status text not null check (status in ('disponible', 'reservado', 'vendido', 'alquilado')),
  location text not null,
  price text not null,
  area text not null,
  bedrooms int not null default 0,
  bathrooms int not null default 0,
  summary text not null,
  description text not null,
  hero_image text not null default '',
  gallery jsonb not null default '[]'::jsonb,
  features jsonb not null default '[]'::jsonb,
  map_embed_url text,
  created_at timestamptz not null default now()
);

do $$
begin
  update public.services
  set slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) || '-' || substring(id::text from 1 for 8)
  where slug is null or btrim(slug) = '';
exception
  when undefined_table then null;
end $$;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'services'
      and column_name = 'slug'
  ) then
    execute 'alter table public.services alter column slug set not null';
  end if;
exception
  when undefined_table then null;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'services_slug_security_check'
  ) then
    alter table public.services
      add constraint services_slug_security_check
      check (
        char_length(slug) between 3 and 120
        and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      );
  end if;
end $$;

create unique index if not exists services_slug_key on public.services (slug);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'works_slug_security_check'
  ) then
    alter table public.works
      add constraint works_slug_security_check
      check (
        char_length(slug) between 3 and 120
        and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'buildings_slug_security_check'
  ) then
    alter table public.buildings
      add constraint buildings_slug_security_check
      check (
        char_length(slug) between 3 and 120
        and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_national_id_security_check'
  ) then
    alter table public.leads
      add constraint leads_national_id_security_check
      check (char_length(btrim(national_id)) between 5 and 40);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_email_security_check'
  ) then
    alter table public.leads
      add constraint leads_email_security_check
      check (
        char_length(email) <= 255
        and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_phone_security_check'
  ) then
    alter table public.leads
      add constraint leads_phone_security_check
      check (phone ~ '^[0-9+() -]{7,24}$');
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_coordinates_security_check'
  ) then
    alter table public.leads
      add constraint leads_coordinates_security_check
      check (
        (location_lat is null and location_lng is null)
        or (
          location_lat between -90 and 90
          and location_lng between -180 and 180
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_message_security_check'
  ) then
    alter table public.leads
      add constraint leads_message_security_check
      check (char_length(btrim(message)) between 10 and 2000);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_name_security_check'
  ) then
    alter table public.leads
      add constraint leads_name_security_check
      check (char_length(btrim(full_name)) between 3 and 120);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'leads_reference_slug_security_check'
  ) then
    alter table public.leads
      add constraint leads_reference_slug_security_check
      check (
        reference_slug is null
        or (
          char_length(reference_slug) between 3 and 120
          and reference_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
        )
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'building_units_range_security_check'
  ) then
    alter table public.building_units
      add constraint building_units_range_security_check
      check (
        bedrooms between 0 and 10
        and bathrooms between 0 and 10
      );
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'admin_profiles_email_security_check'
  ) then
    alter table public.admin_profiles
      add constraint admin_profiles_email_security_check
      check (
        email is null
        or (
          char_length(email) <= 255
          and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
        )
      );
  end if;
end $$;

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
alter table public.business_area_pages enable row level security;
alter table public.real_estate_properties enable row level security;

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

drop policy if exists "public can read business area pages" on public.business_area_pages;
create policy "public can read business area pages" on public.business_area_pages for select using (true);

drop policy if exists "public can read real estate properties" on public.real_estate_properties;
create policy "public can read real estate properties" on public.real_estate_properties for select using (true);

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

drop policy if exists "authenticated can manage business area pages" on public.business_area_pages;
create policy "authenticated can manage business area pages" on public.business_area_pages
for all to authenticated using (public.is_cms_admin()) with check (public.is_cms_admin());

drop policy if exists "authenticated can manage real estate properties" on public.real_estate_properties;
create policy "authenticated can manage real estate properties" on public.real_estate_properties
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

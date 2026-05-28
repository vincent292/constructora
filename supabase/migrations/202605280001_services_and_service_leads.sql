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

update public.services
set
  slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')) || '-' || substring(id::text from 1 for 8),
  description = case when btrim(description) = '' then text else description end,
  lead_prompt = case when btrim(lead_prompt) = '' then text else lead_prompt end
where slug is null or btrim(slug) = '';

alter table public.services
  alter column slug set not null;

create unique index if not exists services_slug_key on public.services (slug);

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
  alter column email drop not null;

update public.leads
set national_id = 'Pendiente'
where national_id is null or btrim(national_id) = '';

alter table public.leads
  alter column national_id set not null;

alter table public.leads
  drop constraint if exists leads_interest_type_check;

alter table public.leads
  add constraint leads_interest_type_check
  check (interest_type in ('obra', 'edificio', 'departamento', 'general', 'servicio'));

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

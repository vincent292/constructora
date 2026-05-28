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

alter table public.real_estate_properties enable row level security;

drop policy if exists "public can read real estate properties" on public.real_estate_properties;
create policy "public can read real estate properties" on public.real_estate_properties
for select using (true);

drop policy if exists "authenticated can manage real estate properties" on public.real_estate_properties;
create policy "authenticated can manage real estate properties" on public.real_estate_properties
for all to authenticated
using (public.is_cms_admin())
with check (public.is_cms_admin());

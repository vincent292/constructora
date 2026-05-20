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


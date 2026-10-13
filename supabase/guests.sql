-- The existing public.guests table must have an integer `icon` column.
-- Numbered icons available in public/assets/icons are 1.png through 22.png.
create or replace function public.assign_next_guest_icon()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  guest_count bigint;
begin
  -- Serialize RSVP inserts so concurrent submissions get consecutive icons.
  perform pg_catalog.pg_advisory_xact_lock(731984527::bigint);

  select count(*)
    into guest_count
    from public.guests;

  new.icon := ((guest_count % 22) + 1)::integer;
  return new;
end;
$$;

drop trigger if exists assign_guest_icon_before_insert on public.guests;
create trigger assign_guest_icon_before_insert
  before insert on public.guests
  for each row
  execute function public.assign_next_guest_icon();

-- Give existing rows without a valid icon a number as well.
with icon_state as (
  select coalesce(max(icon), 0)::bigint as last_icon
    from public.guests
    where icon between 1 and 22
), missing_icons as (
  select guests.ctid, row_number() over (order by guests.ctid) as row_number
    from public.guests as guests
    where guests.icon is null or guests.icon not between 1 and 22
)
update public.guests as guests
  set icon = (((icon_state.last_icon + missing_icons.row_number - 1) % 22) + 1)::integer
  from icon_state, missing_icons
  where guests.ctid = missing_icons.ctid;

-- Return the public RSVP display data (names and icons).
drop function if exists public.get_guest_icons();
create function public.get_guest_icons()
returns table(name text, icon integer)
language sql
stable
security definer
set search_path = ''
as $$
  select guest_rows.name::text,
         case
           when guest_rows.icon between 1 and 22
             then guest_rows.icon::integer
           else (((guest_rows.guest_number - 1) % 22) + 1)::integer
         end as icon
    from (
      select guests.name,
             guests.icon,
             row_number() over (order by guests.ctid) as guest_number
        from public.guests as guests
    ) as guest_rows
    order by guest_rows.guest_number;
$$;

revoke all on function public.get_guest_icons() from public, anon;
grant execute on function public.get_guest_icons() to anon;

notify pgrst, 'reload schema';

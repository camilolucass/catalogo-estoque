create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.stock_movement_type as enum ('entrada', 'saida');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_length check (char_length(trim(name)) between 2 and 80)
);

create unique index categories_name_unique_ci
  on public.categories (lower(trim(name)));

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(12, 2) not null,
  stock_quantity integer not null default 0,
  minimum_stock integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_length check (char_length(trim(name)) between 2 and 120),
  constraint products_price_non_negative check (price >= 0),
  constraint products_stock_non_negative check (stock_quantity >= 0),
  constraint products_minimum_stock_non_negative check (minimum_stock >= 0)
);

create index products_category_id_idx on public.products(category_id);
create index products_name_ci_idx on public.products(lower(name));
create index products_stock_alert_idx
  on public.products(stock_quantity, minimum_stock)
  where is_active = true;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  created_at timestamptz not null default now(),
  constraint profiles_name_length check (char_length(trim(name)) between 2 and 80)
);

create unique index profiles_email_unique_ci on public.profiles(lower(email));

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  type public.stock_movement_type not null,
  quantity integer not null,
  movement_date timestamptz not null default now(),
  observation text,
  created_at timestamptz not null default now(),
  constraint stock_movements_quantity_positive check (quantity > 0),
  constraint stock_movements_observation_length check (
    observation is null or char_length(observation) <= 500
  )
);

create index stock_movements_product_date_idx
  on public.stock_movements(product_id, movement_date desc);
create index stock_movements_type_date_idx
  on public.stock_movements(type, movement_date desc);
create index stock_movements_user_id_idx on public.stock_movements(user_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function private.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(coalesce(new.email, 'Usuario'), '@', 1))
  )
  on conflict (id) do update
  set email = excluded.email,
      name = excluded.name;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function private.handle_new_user();

create or replace function private.apply_stock_movement()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_stock integer;
  active_product boolean;
  current_user_id uuid;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception using errcode = '42501', message = 'Autenticacao obrigatoria.';
  end if;

  if new.quantity <= 0 then
    raise exception using errcode = '22023', message = 'A quantidade deve ser maior que zero.';
  end if;

  select stock_quantity, is_active
    into current_stock, active_product
  from public.products
  where id = new.product_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Produto nao encontrado.';
  end if;

  if active_product is not true then
    raise exception using errcode = '22023', message = 'Produto inativo nao pode ser movimentado.';
  end if;

  if new.type = 'saida' and new.quantity > current_stock then
    raise exception using errcode = '23514', message = 'A quantidade de saida e maior que o estoque disponivel.';
  end if;

  new.user_id := current_user_id;

  update public.products
  set stock_quantity = case
    when new.type = 'entrada' then current_stock + new.quantity
    else current_stock - new.quantity
  end
  where id = new.product_id;

  return new;
end;
$$;

revoke all on function private.apply_stock_movement() from public, anon, authenticated;

create trigger stock_movements_apply_balance
before insert on public.stock_movements
for each row execute function private.apply_stock_movement();

create or replace function public.register_stock_movement(
  p_product_id uuid,
  p_type public.stock_movement_type,
  p_quantity integer,
  p_movement_date timestamptz default now(),
  p_observation text default null
)
returns public.stock_movements
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_movement public.stock_movements;
begin
  insert into public.stock_movements (
    product_id,
    user_id,
    type,
    quantity,
    movement_date,
    observation
  ) values (
    p_product_id,
    auth.uid(),
    p_type,
    p_quantity,
    coalesce(p_movement_date, now()),
    nullif(trim(p_observation), '')
  )
  returning * into created_movement;

  return created_movement;
end;
$$;

create or replace function public.create_product_with_initial_stock(
  p_category_id uuid,
  p_name text,
  p_description text,
  p_price numeric,
  p_initial_stock integer default 0,
  p_minimum_stock integer default 5
)
returns public.products
language plpgsql
security invoker
set search_path = ''
as $$
declare
  created_product public.products;
begin
  if p_initial_stock < 0 then
    raise exception using errcode = '22023', message = 'O estoque inicial nao pode ser negativo.';
  end if;

  insert into public.products (
    category_id,
    name,
    description,
    price,
    minimum_stock
  ) values (
    p_category_id,
    trim(p_name),
    nullif(trim(p_description), ''),
    p_price,
    p_minimum_stock
  )
  returning * into created_product;

  if p_initial_stock > 0 then
    perform public.register_stock_movement(
      created_product.id,
      'entrada',
      p_initial_stock,
      now(),
      'Estoque inicial'
    );
  end if;

  select * into created_product
  from public.products
  where id = created_product.id;

  return created_product;
end;
$$;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.stock_movements enable row level security;
alter table public.profiles enable row level security;

create policy categories_select_authenticated
on public.categories for select to authenticated
using ((select auth.uid()) is not null);

create policy categories_insert_authenticated
on public.categories for insert to authenticated
with check ((select auth.uid()) is not null);

create policy categories_update_authenticated
on public.categories for update to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

create policy categories_delete_authenticated
on public.categories for delete to authenticated
using ((select auth.uid()) is not null);

create policy products_select_authenticated
on public.products for select to authenticated
using ((select auth.uid()) is not null);

create policy products_insert_authenticated
on public.products for insert to authenticated
with check ((select auth.uid()) is not null and stock_quantity = 0);

create policy products_update_authenticated
on public.products for update to authenticated
using ((select auth.uid()) is not null)
with check ((select auth.uid()) is not null);

create policy products_delete_authenticated
on public.products for delete to authenticated
using ((select auth.uid()) is not null);

create policy movements_select_authenticated
on public.stock_movements for select to authenticated
using ((select auth.uid()) is not null);

create policy movements_insert_authenticated
on public.stock_movements for insert to authenticated
with check ((select auth.uid()) is not null and user_id = (select auth.uid()));

create policy profiles_select_authenticated
on public.profiles for select to authenticated
using ((select auth.uid()) is not null);

create policy profiles_update_own
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke all on public.categories, public.products, public.stock_movements, public.profiles
  from anon, authenticated;

grant select, insert, update, delete on public.categories to authenticated;
grant select on public.products to authenticated;
grant insert (category_id, name, description, price, minimum_stock) on public.products to authenticated;
grant update (category_id, name, description, price, minimum_stock, is_active) on public.products to authenticated;
grant delete on public.products to authenticated;
grant select, insert (product_id, user_id, type, quantity, movement_date, observation)
  on public.stock_movements to authenticated;
grant select on public.profiles to authenticated;
grant update (name) on public.profiles to authenticated;

revoke all on function public.register_stock_movement(uuid, public.stock_movement_type, integer, timestamptz, text)
  from public, anon;
grant execute on function public.register_stock_movement(uuid, public.stock_movement_type, integer, timestamptz, text)
  to authenticated;

revoke all on function public.create_product_with_initial_stock(uuid, text, text, numeric, integer, integer)
  from public, anon;
grant execute on function public.create_product_with_initial_stock(uuid, text, text, numeric, integer, integer)
  to authenticated;

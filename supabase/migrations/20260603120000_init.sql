-- Perkins marketplace: esquema inicial + RLS

create extension if not exists "pgcrypto";

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  phone text,
  avatar_url text,
  roles text[] not null default '{requester}'::text[],
  subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'premium_requester', 'premium_perkin')),
  mp_seller_id text,
  mp_access_token text,
  mp_connected boolean not null default false,
  comuna text,
  region text,
  perkin_verified boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  completed_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_roles_check check (
    roles <@ array['requester', 'perkin', 'admin']::text[]
  )
);

-- Categories (global)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  icon text not null default 'package',
  sort_order int not null default 0,
  active boolean not null default true
);

-- Subscription plans
create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  price_clp int not null check (price_clp >= 0),
  billing_period text not null default 'monthly',
  target_role text not null check (target_role in ('requester', 'perkin')),
  benefits jsonb not null default '[]'::jsonb,
  mp_plan_id text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- User subscriptions
create table public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  plan_id uuid not null references public.subscription_plans on delete restrict,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'cancelled', 'past_due')),
  mp_preapproval_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index user_subscriptions_user_idx on public.user_subscriptions (user_id, status);

-- Solicitudes
create table public.solicitudes (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users on delete cascade,
  category_id uuid not null references public.categories on delete restrict,
  title text not null,
  description text not null,
  address_text text,
  comuna text not null,
  lat numeric,
  lng numeric,
  amount_clp int not null check (amount_clp > 0),
  platform_fee_clp int not null default 0 check (platform_fee_clp >= 0),
  total_clp int not null check (total_clp > 0),
  visibility text not null default 'standard'
    check (visibility in ('standard', 'premium_only')),
  status text not null default 'draft'
    check (status in ('draft', 'open', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed')),
  assigned_perkin_id uuid references auth.users on delete set null,
  deadline_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index solicitudes_status_idx on public.solicitudes (status, published_at desc);
create index solicitudes_requester_idx on public.solicitudes (requester_id, created_at desc);
create index solicitudes_perkin_idx on public.solicitudes (assigned_perkin_id);
create index solicitudes_comuna_idx on public.solicitudes (comuna);

-- Messages
create table public.solicitud_messages (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes on delete cascade,
  sender_id uuid not null references auth.users on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index solicitud_messages_thread_idx on public.solicitud_messages (solicitud_id, created_at);

-- Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes on delete cascade,
  payer_id uuid not null references auth.users on delete cascade,
  payee_id uuid references auth.users on delete set null,
  mp_payment_id text,
  mp_preference_id text,
  amount_clp int not null check (amount_clp > 0),
  marketplace_fee_clp int not null default 0,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'released', 'refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_solicitud_idx on public.payments (solicitud_id);
create index payments_status_idx on public.payments (status);

-- Reviews
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  solicitud_id uuid not null references public.solicitudes on delete cascade,
  reviewer_id uuid not null references auth.users on delete cascade,
  reviewee_id uuid not null references auth.users on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (solicitud_id, reviewer_id)
);

-- Admin audit log
create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Helpers (después de crear tablas referenciadas)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  ) or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and 'admin' = any(p.roles)
  );
$$;

create or replace function public.is_perkin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and 'perkin' = any(p.roles)
  );
$$;

create or replace function public.is_requester()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and 'requester' = any(p.roles)
  );
$$;

create or replace function public.is_premium_perkin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.subscription_tier = 'premium_perkin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.subscription_plans enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.solicitudes enable row level security;
alter table public.solicitud_messages enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_audit_log enable row level security;

-- profiles policies
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_select_public_perkins"
  on public.profiles for select
  using ('perkin' = any(roles));

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- categories: public read
create policy "categories_select_all"
  on public.categories for select
  using (active = true or public.is_admin());

create policy "categories_admin_all"
  on public.categories for all
  using (public.is_admin())
  with check (public.is_admin());

-- subscription_plans: public read active
create policy "subscription_plans_select_active"
  on public.subscription_plans for select
  using (active = true or public.is_admin());

create policy "subscription_plans_admin_all"
  on public.subscription_plans for all
  using (public.is_admin())
  with check (public.is_admin());

-- user_subscriptions
create policy "user_subscriptions_select_own"
  on public.user_subscriptions for select
  using (auth.uid() = user_id or public.is_admin());

create policy "user_subscriptions_insert_own"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "user_subscriptions_update_own_or_admin"
  on public.user_subscriptions for update
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- solicitudes policies
create policy "solicitudes_select_own"
  on public.solicitudes for select
  using (
    auth.uid() = requester_id
    or auth.uid() = assigned_perkin_id
    or public.is_admin()
  );

create policy "solicitudes_select_open_for_perkins"
  on public.solicitudes for select
  using (
    status = 'open'
    and public.is_perkin()
    and (
      visibility = 'standard'
      or (visibility = 'premium_only' and public.is_premium_perkin())
    )
    and (
      published_at is null
      or public.is_premium_perkin()
      or published_at <= now()
    )
  );

create policy "solicitudes_insert_requester"
  on public.solicitudes for insert
  with check (auth.uid() = requester_id and public.is_requester());

create policy "solicitudes_update_participants"
  on public.solicitudes for update
  using (
    auth.uid() = requester_id
    or auth.uid() = assigned_perkin_id
    or public.is_admin()
  )
  with check (
    auth.uid() = requester_id
    or auth.uid() = assigned_perkin_id
    or public.is_admin()
  );

-- messages
create policy "messages_select_participants"
  on public.solicitud_messages for select
  using (
    exists (
      select 1 from public.solicitudes s
      where s.id = solicitud_id
        and (
          s.requester_id = auth.uid()
          or s.assigned_perkin_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "messages_insert_participants"
  on public.solicitud_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.solicitudes s
      where s.id = solicitud_id
        and (
          s.requester_id = auth.uid()
          or s.assigned_perkin_id = auth.uid()
        )
    )
  );

-- payments
create policy "payments_select_participants"
  on public.payments for select
  using (
    auth.uid() = payer_id
    or auth.uid() = payee_id
    or public.is_admin()
  );

create policy "payments_insert_payer"
  on public.payments for insert
  with check (auth.uid() = payer_id);

create policy "payments_update_admin_or_participants"
  on public.payments for update
  using (auth.uid() = payer_id or public.is_admin())
  with check (auth.uid() = payer_id or public.is_admin());

-- reviews
create policy "reviews_select_related"
  on public.reviews for select
  using (
    auth.uid() = reviewer_id
    or auth.uid() = reviewee_id
    or public.is_admin()
  );

create policy "reviews_insert_own"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

-- admin audit
create policy "admin_audit_admin_only"
  on public.admin_audit_log for all
  using (public.is_admin())
  with check (public.is_admin());

-- Triggers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger solicitudes_set_updated_at
  before update on public.solicitudes
  for each row execute function public.set_updated_at();

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create trigger user_subscriptions_set_updated_at
  before update on public.user_subscriptions
  for each row execute function public.set_updated_at();

-- New user handler
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  signup_role text;
  user_roles text[];
begin
  signup_role := coalesce(new.raw_user_meta_data->>'signup_role', 'requester');

  user_roles := case signup_role
    when 'perkin' then array['perkin']::text[]
    when 'both' then array['requester', 'perkin']::text[]
    else array['requester']::text[]
  end;

  insert into public.profiles (
    id,
    display_name,
    phone,
    comuna,
    region,
    roles
  ) values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'comuna',
    new.raw_user_meta_data->>'region',
    user_roles
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Seed categories
insert into public.categories (slug, name, icon, sort_order) values
  ('farmacia', 'Farmacia', 'pill', 1),
  ('compras', 'Compras', 'shopping-bag', 2),
  ('traslados', 'Traslados', 'car', 3),
  ('diligencias', 'Diligencias', 'file-text', 4),
  ('otros', 'Otros', 'help-circle', 5);

-- Seed subscription plans
insert into public.subscription_plans (slug, name, price_clp, target_role, benefits) values
  (
    'requester-premium',
    'Vioh Premium',
    4990,
    'requester',
    '["Perkins con ficha máxima — capa puesta","Prioridad al publicar paletiadas","Badge premium en tus ofertas","Soporte prioritario"]'::jsonb
  ),
  (
    'perkin-premium',
    'Perkin Premium',
    7990,
    'perkin',
    '["Paletiadas premium antes que nadie","Paletiadas con más lucas","Filtros por comuna","Camino a ficha máxima verificada"]'::jsonb
  );

-- Enable realtime for messages
alter publication supabase_realtime add table public.solicitud_messages;

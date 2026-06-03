-- Admin read policies + payment uniqueness

create unique index if not exists payments_solicitud_unique on public.payments (solicitud_id);

create policy "solicitudes_admin_select"
  on public.solicitudes for select
  using (public.is_admin());

create policy "solicitudes_admin_update"
  on public.solicitudes for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "payments_admin_select"
  on public.payments for select
  using (public.is_admin());

create policy "payments_admin_update"
  on public.payments for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "user_subscriptions_admin_all"
  on public.user_subscriptions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "reviews_admin_select"
  on public.reviews for select
  using (public.is_admin());

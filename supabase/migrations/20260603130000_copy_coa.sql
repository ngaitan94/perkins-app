-- Redacción COA chilena: vioh, ficha, lucas, Perkin
update public.subscription_plans
set
  name = 'Vioh Premium',
  benefits = '["Perkins con ficha máxima — capa puesta","Prioridad al publicar paletiadas","Badge premium en tus ofertas","Soporte prioritario"]'::jsonb
where slug = 'requester-premium';

update public.subscription_plans
set
  benefits = '["Paletiadas premium antes que nadie","Paletiadas con más lucas","Filtros por comuna","Camino a ficha máxima verificada"]'::jsonb
where slug = 'perkin-premium';

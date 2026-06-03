# Perkins App

Favores / paletiadas entre viohs (Chile). Roles en copy: **vioh que pide**, **Perkin que trae** (Perkin = asistente coloquial). Lógica narrativa: los Perkines **aspiran a ser vioh**; el ascenso es pasar de traer a pedir (misma cuenta puede tener ambos roles: `signup_role` both). **Paletiada** = favor. Frases: **te pegai la misión**, **ponte la capa**, **perro bomba**, **ficha máxima**. Stack: Astro SSR, Supabase, Mercado Pago, Vercel.

## Convenciones

- UI en español chileno (es-CL), montos en CLP
- Auth con `@supabase/ssr` + middleware
- RLS en todas las tablas; roles en `profiles.roles`
- Pagos: Mercado Pago Split marketplace; modo demo sin credenciales MP
- Patrones de referencia: `../fintech-app`, `../desvelado.media`
- Video landing: Remotion en `remotion/` → `npm run remotion:render` → `public/videos/perkins-como-funciona.mp4`

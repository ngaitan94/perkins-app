# Perkins — Paletiadas entre viohs (Chile)

Aplicación web de paletiadas entre viohs: el **vioh que pide** publica con lucas en CLP y el **Perkin que trae** hace llegar la paletiada. En la narrativa del producto, los Perkines aspiran a ser vioh — muchos parten trayendo y con ficha pasan a pedir (`both` en registro). La **ficha** mide el ascenso.

## Stack

- **Astro 6** (SSR) + **Vercel**
- **Supabase** (Auth, Postgres, RLS, Realtime, Edge Functions)
- **Mercado Pago Chile** (Checkout Pro marketplace, suscripciones)

## Desarrollo local

```bash
cp .env.example .env
# Configura PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY

npm install
npm run dev
```

### Supabase

```bash
supabase init   # si aún no está inicializado
supabase db push
```

Aplica las migraciones en `supabase/migrations/`.

### Modo demo (sin Mercado Pago)

Si `MP_ACCESS_TOKEN` no está configurado, la app funciona en **modo demo**: pagos y suscripciones se simulan localmente.

## Estructura

- `src/pages/` — rutas (landing, auth, app, admin, API)
- `src/sections/` — secciones de landing
- `src/scripts/` — lógica cliente Supabase
- `src/lib/` — helpers (CLP, roles, Mercado Pago)
- `supabase/migrations/` — esquema Postgres + RLS

## Roles

| Rol | Descripción |
|-----|-------------|
| `requester` | Vioh que pide (publica paletiadas) |
| `perkin` | Perkin que trae (cumple y cobra lucas) |
| `admin` | Panel de administración |

## Deploy (Vercel)

1. Conecta el repo a Vercel
2. Configura variables de entorno (ver `.env.example`)
3. `npm run build`

## Mercado Pago

1. Crea app tipo **Marketplace** en [Mercado Pago Developers Chile](https://www.mercadopago.cl/developers/panel/app)
2. Configura OAuth redirect: `{PUBLIC_APP_URL}/api/mp/oauth/callback`
3. Webhook: `{PUBLIC_APP_URL}/api/mp/webhook`

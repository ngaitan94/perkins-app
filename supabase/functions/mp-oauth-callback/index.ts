import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) {
    return new Response("Missing code or state", { status: 400 });
  }

  const appUrl = Deno.env.get("PUBLIC_APP_URL") ?? "";
  const tokenRes = await fetch("https://api.mercadopago.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: Deno.env.get("MP_CLIENT_ID"),
      client_secret: Deno.env.get("MP_CLIENT_SECRET"),
      grant_type: "authorization_code",
      code,
      redirect_uri: `${appUrl}/api/mp/oauth/callback`,
    }),
  });

  if (!tokenRes.ok) {
    return Response.redirect(`${appUrl}/app/perfil?error=oauth`, 302);
  }

  const tokens = await tokenRes.json();
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  await supabase.from("profiles").update({
    mp_access_token: tokens.access_token,
    mp_seller_id: String(tokens.user_id),
    mp_connected: true,
  }).eq("id", state);

  return Response.redirect(`${appUrl}/app/perfil?mp=connected`, 302);
});

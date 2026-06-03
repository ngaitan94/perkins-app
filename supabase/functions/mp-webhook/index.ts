import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    if (body.type === "payment" && body.data?.id) {
      const mpToken = Deno.env.get("MP_ACCESS_TOKEN");
      const paymentId = body.data.id;
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${mpToken}` },
      });
      if (mpRes.ok) {
        const payment = await mpRes.json();
        const solicitudId = payment.external_reference;
        if (solicitudId && payment.status === "approved") {
          await supabase.from("payments").upsert({
            solicitud_id: solicitudId,
            mp_payment_id: String(paymentId),
            amount_clp: Math.round(payment.transaction_amount),
            marketplace_fee_clp: Math.round(payment.application_fee || 0),
            status: "approved",
          }, { onConflict: "solicitud_id" });

          await supabase.from("solicitudes").update({
            status: "open",
            published_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          }).eq("id", solicitudId);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

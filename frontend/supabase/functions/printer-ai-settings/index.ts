// Edge Function: printer-ai-settings
// GET ?printer_id=...      → retorna config atual (auth Bearer agente_token)
// PUT body={printer_id, settings} → upsert (auth via JWT do admin no client)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function authPrinter(supabase: any, printerId: string, token: string) {
  const { data } = await supabase
    .from("printer_devices")
    .select("agente_token")
    .eq("id", printerId)
    .maybeSingle();
  return data && data.agente_token === token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: "missing token" }, 401);
  const token = auth.substring(7);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  if (req.method === "GET") {
    const url = new URL(req.url);
    const printerId = url.searchParams.get("printer_id");
    if (!printerId) return json({ error: "printer_id missing" }, 400);

    if (!(await authPrinter(supabase, printerId, token))) {
      return json({ error: "invalid token" }, 401);
    }

    const { data, error } = await supabase
      .from("printer_ai_settings")
      .select("*")
      .eq("printer_id", printerId)
      .maybeSingle();
    if (error) return json({ error: error.message }, 500);
    return json({ settings: data });
  }

  if (req.method === "PUT") {
    let body: any;
    try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }
    const { printer_id, settings } = body || {};
    if (!printer_id || !settings) return json({ error: "printer_id and settings required" }, 400);

    if (!(await authPrinter(supabase, printer_id, token))) {
      return json({ error: "invalid token" }, 401);
    }

    const allowed: Record<string, true> = {
      ai_enabled: true, pause_on_failure: true, confidence_threshold: true,
      snapshot_interval_seconds: true, provider: true, enabled_types: true, notes: true,
    };
    const payload: Record<string, unknown> = { printer_id, updated_at: new Date().toISOString() };
    for (const k of Object.keys(settings)) {
      if (allowed[k]) payload[k] = settings[k];
    }
    const { error } = await supabase
      .from("printer_ai_settings")
      .upsert(payload, { onConflict: "printer_id" });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});

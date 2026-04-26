// Edge Function: printer-failure-events
//
// GET ?printer_id=...&limit=50 → lista últimos eventos
// PATCH body={id, status, notes?} → atualiza status (acknowledged/false_positive/resolved)
//
// Frontend chama via supabase JS client direto também, mas essa function existe
// pra permitir auth Bearer pelo agente caso ele precise listar/atualizar (futuro).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  if (req.method === "GET") {
    const url = new URL(req.url);
    const printerId = url.searchParams.get("printer_id");
    const limit = Math.min(200, parseInt(url.searchParams.get("limit") || "50", 10));
    if (!printerId) return json({ error: "printer_id missing" }, 400);

    const { data, error } = await supabase
      .from("printer_failure_events")
      .select("*")
      .eq("printer_id", printerId)
      .order("detected_at", { ascending: false })
      .limit(limit);
    if (error) return json({ error: error.message }, 500);
    return json({ events: data });
  }

  if (req.method === "PATCH") {
    let body: any;
    try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }
    const { id, status, notes } = body || {};
    if (!id || !status) return json({ error: "id and status required" }, 400);
    const allowed = ["open", "acknowledged", "false_positive", "resolved"];
    if (!allowed.includes(status)) return json({ error: "invalid status" }, 400);

    const patch: Record<string, unknown> = { status };
    if (notes !== undefined) patch.notes = notes;
    const { error } = await supabase
      .from("printer_failure_events")
      .update(patch)
      .eq("id", id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});

// Edge Function: printer-job
// Recebe eventos de início/fim de job do agente e materializa em printer_print_jobs.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: "missing token" }, 401);
  const token = auth.substring(7);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  const printerId: string | undefined = body?.printer_id;
  const event = body?.event;
  if (!printerId || !event) return json({ error: "printer_id e event obrigatórios" }, 400);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: device } = await supabase
    .from("printer_devices")
    .select("id, agente_token")
    .eq("id", printerId)
    .maybeSingle();
  if (!device) return json({ error: "printer not found" }, 404);
  if (device.agente_token !== token) return json({ error: "invalid token" }, 401);

  const type = event.type;
  if (type === "started") {
    const { error } = await supabase.from("printer_print_jobs").insert({
      printer_id: printerId,
      gcode_filename: event.filename ?? null,
      status: "running",
      started_at: new Date().toISOString(),
    });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  }
  if (type === "finished") {
    // Acha o último job "running" daquela impressora e fecha
    const { data: openJob } = await supabase
      .from("printer_print_jobs")
      .select("id")
      .eq("printer_id", printerId)
      .eq("status", "running")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const updatePayload = {
      status: event.status || "completed",
      finished_at: new Date().toISOString(),
      duration_seconds: event.duration_seconds ?? null,
      filament_used_g: event.filament_used_mm ? Math.round(event.filament_used_mm / 1000 * 2.98) : null, // estima g via PLA 1.75mm — aproximação
      failure_reason: event.failure_reason ?? null,
      gcode_filename: event.filename ?? null,
    };

    if (openJob) {
      const { error } = await supabase
        .from("printer_print_jobs")
        .update(updatePayload)
        .eq("id", openJob.id);
      if (error) return json({ error: error.message }, 500);
    } else {
      // Fallback: cria registro completo (caso o agente reinicie no meio)
      const { error } = await supabase.from("printer_print_jobs").insert({
        printer_id: printerId,
        ...updatePayload,
        started_at: new Date(Date.now() - (event.duration_seconds || 0) * 1000).toISOString(),
      });
      if (error) return json({ error: error.message }, 500);
    }
    return json({ ok: true });
  }
  return json({ error: "event type desconhecido" }, 400);
});

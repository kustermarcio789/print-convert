// Edge Function: printer-telemetry
//
// Recebe telemetria enviada pelo agente local (RPi) e faz upsert
// na tabela printer_telemetry.
//
// Auth: Bearer token que deve bater exatamente com printer_devices.agente_token
// do printer_id informado no corpo. Nada de JWT de admin aqui — o agente não é
// um usuário do site.
//
// POST { printer_id: uuid, telemetry: {...} }

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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "missing Bearer token" }, 401);
  }
  const token = authHeader.substring(7);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  const printerId: string | undefined = body?.printer_id;
  const telemetry = body?.telemetry;
  if (!printerId || !telemetry) {
    return json({ error: "printer_id and telemetry are required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Valida que o token bate com o agente_token da impressora
  const { data: device, error: devErr } = await supabase
    .from("printer_devices")
    .select("id, agente_token")
    .eq("id", printerId)
    .maybeSingle();

  if (devErr || !device) {
    return json({ error: "printer not found" }, 404);
  }
  if (device.agente_token !== token) {
    return json({ error: "invalid agent token" }, 401);
  }

  // Sanitiza os campos esperados (evita injeção de colunas arbitrárias)
  const allowed = [
    "state",
    "state_message",
    "extruder_temp",
    "extruder_target",
    "bed_temp",
    "bed_target",
    "chamber_temp",
    "progress",
    "current_file",
    "print_duration_seconds",
    "print_time_remaining_seconds",
    "position_x",
    "position_y",
    "position_z",
    "raw",
  ];
  const row: Record<string, unknown> = { printer_id: printerId, updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (telemetry[key] !== undefined) row[key] = telemetry[key];
  }

  const { error: upErr } = await supabase
    .from("printer_telemetry")
    .upsert(row, { onConflict: "printer_id" });

  if (upErr) {
    console.error("upsert telemetry error:", upErr);
    return json({ error: "db error", detail: upErr.message }, 500);
  }

  return json({ ok: true });
});

// Edge Function: printer-commands
//
// Usado pelo agente local para:
//   GET   ?printer_id=... → devolve comandos pendentes e os marca in_progress
//   PATCH body={command_id, status, error_message?} → marca como done/failed
//
// Auth: Bearer token que bate com printer_devices.agente_token do printer_id.
//
// Para CRIAR comandos (do site → impressora) usamos o CRUD padrão na tabela
// printer_commands (via JS client autenticado do admin). Aqui só trata a
// ponta consumidora.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function authenticatePrinter(
  supabase: ReturnType<typeof createClient>,
  printerId: string,
  token: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("printer_devices")
    .select("agente_token")
    .eq("id", printerId)
    .maybeSingle();
  if (error || !data) return false;
  return data.agente_token === token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return json({ error: "missing Bearer token" }, 401);
  }
  const token = authHeader.substring(7);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // ------------------------------------------------------------
  // GET: agente busca comandos pendentes e marca como in_progress
  // ------------------------------------------------------------
  if (req.method === "GET") {
    const url = new URL(req.url);
    const printerId = url.searchParams.get("printer_id");
    if (!printerId) return json({ error: "printer_id missing" }, 400);

    if (!(await authenticatePrinter(supabase, printerId, token))) {
      return json({ error: "invalid agent token" }, 401);
    }

    // Pega todos os pendentes, os marca como in_progress (atomicamente) e os devolve
    const { data: pending, error: selErr } = await supabase
      .from("printer_commands")
      .select("id, command, params")
      .eq("printer_id", printerId)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(5);

    if (selErr) {
      console.error("select pending error:", selErr);
      return json({ error: "db error" }, 500);
    }
    if (!pending || pending.length === 0) {
      return json({ commands: [] });
    }

    const ids = pending.map((c) => c.id);
    const { error: upErr } = await supabase
      .from("printer_commands")
      .update({ status: "in_progress", picked_up_at: new Date().toISOString() })
      .in("id", ids)
      .eq("status", "pending"); // guarda contra race

    if (upErr) {
      console.error("update in_progress error:", upErr);
      return json({ error: "db error" }, 500);
    }

    return json({ commands: pending });
  }

  // ------------------------------------------------------------
  // PATCH: agente reporta conclusão de um comando
  // ------------------------------------------------------------
  if (req.method === "PATCH") {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return json({ error: "invalid JSON body" }, 400);
    }
    const { command_id, status, error_message } = body || {};
    if (!command_id || !["done", "failed"].includes(status)) {
      return json({ error: "command_id and status (done|failed) required" }, 400);
    }

    // Carrega o comando para descobrir o printer_id e validar o token
    const { data: cmd, error: cmdErr } = await supabase
      .from("printer_commands")
      .select("id, printer_id, status")
      .eq("id", command_id)
      .maybeSingle();

    if (cmdErr || !cmd) return json({ error: "command not found" }, 404);
    if (!(await authenticatePrinter(supabase, cmd.printer_id, token))) {
      return json({ error: "invalid agent token" }, 401);
    }

    const { error: upErr } = await supabase
      .from("printer_commands")
      .update({
        status,
        error_message: error_message ?? null,
        completed_at: new Date().toISOString(),
      })
      .eq("id", command_id);

    if (upErr) return json({ error: "db error", detail: upErr.message }, 500);
    return json({ ok: true });
  }

  return json({ error: "Method not allowed" }, 405);
});

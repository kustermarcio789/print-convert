// Edge Function: printer-snapshot
// Recebe imagem em base64 do agente, sobe pro Storage (bucket "webcam") e
// grava ponteiro em printer_snapshots.

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

function base64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
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
  const { printer_id, image_base64, content_type } = body || {};
  if (!printer_id || !image_base64) {
    return json({ error: "printer_id e image_base64 obrigatórios" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  const { data: device } = await supabase
    .from("printer_devices")
    .select("id, agente_token")
    .eq("id", printer_id)
    .maybeSingle();
  if (!device) return json({ error: "printer not found" }, 404);
  if (device.agente_token !== token) return json({ error: "invalid token" }, 401);

  const ext = (content_type || "image/jpeg").includes("png") ? "png" : "jpg";
  const path = `${printer_id}/${Date.now()}.${ext}`;
  const bytes = base64ToUint8(image_base64);

  const { error: upErr } = await supabase.storage
    .from("webcam")
    .upload(path, bytes, {
      contentType: content_type || "image/jpeg",
      upsert: false,
    });
  if (upErr) return json({ error: upErr.message }, 500);

  const { error: insErr } = await supabase.from("printer_snapshots").insert({
    printer_id,
    storage_path: path,
  });
  if (insErr) return json({ error: insErr.message }, 500);

  // Limpeza: mantém apenas últimos 50 snapshots por impressora pra não estourar storage
  const { data: old } = await supabase
    .from("printer_snapshots")
    .select("id, storage_path")
    .eq("printer_id", printer_id)
    .order("taken_at", { ascending: false })
    .range(50, 200);
  if (old && old.length > 0) {
    const ids = old.map((r) => r.id);
    const paths = old.map((r) => r.storage_path);
    await supabase.storage.from("webcam").remove(paths);
    await supabase.from("printer_snapshots").delete().in("id", ids);
  }

  return json({ ok: true, path });
});

// Edge Function: printer-ai-analyze
//
// POST { printer_id, image_base64, content_type } - chamado pelo agente
// Faz análise de IA na imagem da webcam e retorna se há falha.
//
// Provider:
// - "openai" → GPT-4o vision (precisa OPENAI_API_KEY env)
// - "anthropic" → Claude vision (precisa ANTHROPIC_API_KEY env)
// - "stub" (default) → simulação simples (heurística zero, retorna no_failure)
//
// Configura provider em printer_ai_settings.provider (ou env AI_PROVIDER fallback).

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

interface AnalysisResult {
  failure_detected: boolean;
  failure_type?: 'spaghetti_failure'|'bed_detachment'|'layer_shift'|'extrusion_failure'|'unknown_failure';
  confidence: number;
  notes?: string;
  provider: string;
}

async function analyzeOpenAI(imageBase64: string, contentType: string): Promise<AnalysisResult> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) throw new Error("OPENAI_API_KEY ausente");
  const dataUrl = `data:${contentType};base64,${imageBase64}`;
  const prompt = `You are a 3D printing failure detector. Look at this webcam image of a 3D printer and respond with strict JSON only:
{"failure_detected": boolean, "failure_type": "spaghetti_failure"|"bed_detachment"|"layer_shift"|"extrusion_failure"|"unknown_failure"|null, "confidence": number (0..1), "notes": string}
If the print looks fine, set failure_detected=false.`;

  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${key}` },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl, detail: "low" } },
        ],
      }],
      response_format: { type: "json_object" },
      max_tokens: 200,
    }),
  });
  if (!r.ok) throw new Error(`openai ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const txt = data.choices?.[0]?.message?.content || "{}";
  const parsed = JSON.parse(txt);
  return {
    failure_detected: !!parsed.failure_detected,
    failure_type: parsed.failure_type ?? undefined,
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0))),
    notes: parsed.notes,
    provider: "openai/gpt-4o-mini",
  };
}

async function analyzeAnthropic(imageBase64: string, contentType: string): Promise<AnalysisResult> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) throw new Error("ANTHROPIC_API_KEY ausente");
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: contentType, data: imageBase64 },
          },
          {
            type: "text",
            text: `Analyze this 3D printer webcam image. Reply ONLY with strict JSON:
{"failure_detected": bool, "failure_type": "spaghetti_failure"|"bed_detachment"|"layer_shift"|"extrusion_failure"|"unknown_failure"|null, "confidence": 0..1, "notes": "brief explanation"}`,
          },
        ],
      }],
    }),
  });
  if (!r.ok) throw new Error(`anthropic ${r.status}: ${await r.text()}`);
  const data = await r.json();
  const txt = data.content?.[0]?.text || "{}";
  const m = txt.match(/\{[\s\S]*\}/);
  const parsed = m ? JSON.parse(m[0]) : {};
  return {
    failure_detected: !!parsed.failure_detected,
    failure_type: parsed.failure_type ?? undefined,
    confidence: Math.max(0, Math.min(1, Number(parsed.confidence ?? 0))),
    notes: parsed.notes,
    provider: "anthropic/claude-haiku-4-5",
  };
}

function analyzeStub(): AnalysisResult {
  // Modo simulação: nunca detecta falha. Use pra testar a infra sem custo.
  return {
    failure_detected: false,
    confidence: 0,
    notes: "stub mode (no real analysis)",
    provider: "stub",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: "missing token" }, 401);
  const token = auth.substring(7);

  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid JSON" }, 400); }
  const { printer_id, image_base64, content_type } = body || {};
  if (!printer_id || !image_base64) {
    return json({ error: "printer_id and image_base64 required" }, 400);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Auth: token bate com agente
  const { data: device } = await supabase
    .from("printer_devices")
    .select("id, agente_token")
    .eq("id", printer_id)
    .maybeSingle();
  if (!device) return json({ error: "printer not found" }, 404);
  if (device.agente_token !== token) return json({ error: "invalid token" }, 401);

  // Settings da impressora
  const { data: settings } = await supabase
    .from("printer_ai_settings")
    .select("*")
    .eq("printer_id", printer_id)
    .maybeSingle();
  const provider = settings?.provider || Deno.env.get("AI_PROVIDER") || "stub";

  let result: AnalysisResult;
  try {
    if (provider === "openai") result = await analyzeOpenAI(image_base64, content_type || "image/jpeg");
    else if (provider === "anthropic") result = await analyzeAnthropic(image_base64, content_type || "image/jpeg");
    else result = analyzeStub();
  } catch (exc) {
    console.error("analyze error:", exc);
    // fallback pra stub: não estoura o agente
    result = { ...analyzeStub(), notes: `analyze error (fell back to stub): ${(exc as Error).message}` };
  }

  // Filtra por enabled_types se especificado
  const enabledTypes: string[] = settings?.enabled_types || [];
  if (
    result.failure_detected &&
    enabledTypes.length > 0 &&
    result.failure_type &&
    !enabledTypes.includes(result.failure_type)
  ) {
    result.failure_detected = false;
    result.notes = `${result.notes || ""} (type ${result.failure_type} not in enabled_types)`;
  }

  // Se falha detectada → upload snapshot + grava failure_event
  if (result.failure_detected) {
    const ext = (content_type || "image/jpeg").includes("png") ? "png" : "jpg";
    const path = `${printer_id}/failures/${Date.now()}.${ext}`;
    try {
      const bin = atob(image_base64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      await supabase.storage.from("webcam").upload(path, bytes, {
        contentType: content_type || "image/jpeg",
        upsert: false,
      });
      const pub = supabase.storage.from("webcam").getPublicUrl(path).data.publicUrl;

      // Pega último job ativo pra associar
      const { data: openJob } = await supabase
        .from("printer_print_jobs")
        .select("id")
        .eq("printer_id", printer_id)
        .eq("status", "running")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const willPause = !!(settings?.pause_on_failure && result.confidence >= (settings?.confidence_threshold ?? 0.75));

      await supabase.from("printer_failure_events").insert({
        printer_id,
        job_id: openJob?.id ?? null,
        failure_type: result.failure_type ?? "unknown_failure",
        confidence: result.confidence,
        snapshot_url: pub,
        action_taken: willPause ? "paused" : "logged_only",
        notes: result.notes,
        metadata: { provider: result.provider },
      });
      (result as any).snapshot_url = pub;
    } catch (e) {
      console.error("save failure_event err:", e);
    }
  }

  return json(result);
});

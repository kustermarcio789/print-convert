import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Valida e renova um JWT do administrador
 */
serve(async (req) => {
  // Lidar com CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Apenas aceitar POST
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ message: "Método não permitido" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Obter o token do header Authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ message: "Token não fornecido" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(
      Deno.env.get("JWT_SECRET") || "your-secret-key-change-in-production"
    );

    // Verificar e decodificar o token
    let payload;
    try {
      const verified = await jose.jwtVerify(token, secret);
      payload = verified.payload;
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Token inválido ou expirado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar um novo token
    const newToken = await new jose.SignJWT({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);

    return new Response(
      JSON.stringify({
        success: true,
        token: newToken,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return new Response(
      JSON.stringify({ message: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Tipos
interface AdminCredentials {
  email: string;
  password: string;
}

interface AdminUser {
  id: string;
  email: string;
  role: "master" | "atendimento" | "producao";
  permissions: string[];
  createdAt: string;
}

// Dados dos administradores (em produção, isso deve estar no banco de dados)
// As senhas devem ser armazenadas com hash (bcrypt, argon2, etc.)
const ADMIN_USERS: Record<string, { passwordHash: string; role: string; permissions: string[] }> = {
  "3dk.print.br@gmail.com": {
    // Hash de "1A9B8Z5X" (em produção, usar bcrypt)
    passwordHash: "$2b$10$YourHashedPasswordHere", // Placeholder
    role: "master",
    permissions: ["all"],
  },
  "atendimento@3dkprint.com.br": {
    passwordHash: "$2b$10$AnotherHashHere", // Placeholder
    role: "atendimento",
    permissions: ["dashboard", "orcamentos"],
  },
  "producao@3dkprint.com.br": {
    passwordHash: "$2b$10$YetAnotherHashHere", // Placeholder
    role: "producao",
    permissions: ["dashboard", "producao", "estoque"],
  },
};

/**
 * Simula a comparação de senha com hash (em produção, usar bcrypt)
 */
function verifyPassword(password: string, hash: string): boolean {
  // TODO: Implementar verificação real com bcrypt
  // Por enquanto, apenas para demonstração
  return true;
}

/**
 * Gera um JWT para o usuário autenticado
 */
async function generateJWT(user: AdminUser): Promise<string> {
  const secret = new TextEncoder().encode(
    Deno.env.get("JWT_SECRET") || "your-secret-key-change-in-production"
  );

  const jwt = await new jose.SignJWT({
    sub: user.id,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return jwt;
}

/**
 * Handler principal da função
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

    // Parsear o corpo da requisição
    const body: AdminCredentials = await req.json();
    const { email, password } = body;

    // Validar entrada
    if (!email || !password) {
      return new Response(
        JSON.stringify({ message: "E-mail e senha são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Procurar o usuário
    const adminData = ADMIN_USERS[email.toLowerCase()];
    if (!adminData) {
      return new Response(
        JSON.stringify({ message: "Credenciais inválidas" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar a senha
    if (!verifyPassword(password, adminData.passwordHash)) {
      return new Response(
        JSON.stringify({ message: "Credenciais inválidas" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar objeto do usuário
    const user: AdminUser = {
      id: `admin_${Date.now()}`,
      email,
      role: adminData.role as "master" | "atendimento" | "producao",
      permissions: adminData.permissions,
      createdAt: new Date().toISOString(),
    };

    // Gerar JWT
    const token = await generateJWT(user);

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        user,
        token,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro na autenticação:", error);
    return new Response(
      JSON.stringify({ message: "Erro interno do servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

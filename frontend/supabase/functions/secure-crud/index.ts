import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import * as jose from "https://deno.land/x/jose@v4.14.4/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CrudRequest {
  operation: "create" | "update" | "delete";
  table: string;
  data?: Record<string, any>;
  id?: string | number;
}

/**
 * Valida o token JWT e extrai as permissões do usuário
 */
async function validateToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Token não fornecido");
  }

  const token = authHeader.substring(7);
  const secret = new TextEncoder().encode(
    Deno.env.get("JWT_SECRET") || "your-secret-key-change-in-production"
  );

  try {
    const verified = await jose.jwtVerify(token, secret);
    return verified.payload;
  } catch (error) {
    throw new Error("Token inválido ou expirado");
  }
}

/**
 * Valida se o usuário tem permissão para a operação
 */
function checkPermission(
  userRole: string,
  operation: string,
  table: string
): boolean {
  // Master tem acesso a tudo
  if (userRole === "master") return true;

  // Definir permissões por role
  const permissions: Record<string, Record<string, string[]>> = {
    atendimento: {
      create: ["orcamentos"],
      update: ["orcamentos"],
      delete: [],
    },
    producao: {
      create: ["producao"],
      update: ["producao", "estoque"],
      delete: [],
    },
  };

  const rolePerms = permissions[userRole];
  if (!rolePerms) return false;

  const opPerms = rolePerms[operation];
  if (!opPerms) return false;

  return opPerms.includes(table);
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

    // Validar token
    const payload = await validateToken(req.headers.get("Authorization"));
    const userRole = payload.role as string;

    // Parsear o corpo da requisição
    const body: CrudRequest = await req.json();
    const { operation, table, data, id } = body;

    // Validar entrada
    if (!operation || !table) {
      return new Response(
        JSON.stringify({ message: "Operação e tabela são obrigatórias" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar permissões
    if (!checkPermission(userRole, operation, table)) {
      return new Response(
        JSON.stringify({ message: "Permissão negada para esta operação" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Criar cliente Supabase com chave de serviço (segura no backend)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    let result;

    // Executar operação
    switch (operation) {
      case "create":
        if (!data) {
          throw new Error("Dados são obrigatórios para criar");
        }
        const { data: createData, error: createError } = await supabase
          .from(table)
          .insert([data])
          .select();

        if (createError) throw createError;
        result = createData;
        break;

      case "update":
        if (!id || !data) {
          throw new Error("ID e dados são obrigatórios para atualizar");
        }
        const { data: updateData, error: updateError } = await supabase
          .from(table)
          .update(data)
          .eq("id", id)
          .select();

        if (updateError) throw updateError;
        result = updateData;
        break;

      case "delete":
        if (!id) {
          throw new Error("ID é obrigatório para deletar");
        }
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
        result = { success: true };
        break;

      default:
        throw new Error("Operação inválida");
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    const status = message.includes("Permissão negada") ? 403 : 400;

    return new Response(
      JSON.stringify({ message }),
      { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

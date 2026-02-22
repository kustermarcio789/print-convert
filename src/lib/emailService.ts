/**
 * Serviço de Notificações por E-mail
 * 
 * Este arquivo contém funções para enviar e-mails automáticos
 * para clientes e administradores.
 * 
 * Para usar este serviço, você precisa configurar:
 * 1. SendGrid API (https://sendgrid.com) ou similar
 * 2. Supabase Functions para executar o envio de e-mails
 */

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
}

/**
 * Template de confirmação de novo orçamento para o cliente
 */
export function templateConfirmacaoOrcamentoCliente(
  nomeCliente: string,
  numeroOrcamento: string,
  tipo: string,
  valor: number
): EmailTemplate {
  return {
    to: '', // Será preenchido com o e-mail do cliente
    subject: `Orçamento #${numeroOrcamento} - 3DKPRINT`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center;">
          <h1 style="margin: 0;">3DKPRINT</h1>
          <p style="margin: 10px 0 0 0;">Serviços de Impressão 3D</p>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Olá ${nomeCliente}!</h2>
          
          <p>Recebemos seu pedido de orçamento e estamos analisando os detalhes.</p>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0;">
            <p><strong>Número do Orçamento:</strong> #${numeroOrcamento}</p>
            <p><strong>Tipo de Serviço:</strong> ${tipo}</p>
            <p><strong>Valor Estimado:</strong> R$ ${valor.toFixed(2)}</p>
            <p><strong>Status:</strong> Pendente de Análise</p>
          </div>
          
          <p>Nosso time técnico analisará seu projeto e entrará em contato em até 24 horas com uma proposta detalhada.</p>
          
          <p style="margin-top: 30px;">
            <a href="https://www.3dkprint.com.br" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Acompanhar Orçamento
            </a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #666;">
            <strong>Dúvidas?</strong> Entre em contato conosco via WhatsApp: <strong>(43) 99174-1518</strong>
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2026 3DKPRINT. Todos os direitos reservados.</p>
          <p style="margin: 5px 0 0 0;">www.3dkprint.com.br</p>
        </div>
      </div>
    `,
  };
}

/**
 * Template de notificação para o administrador sobre novo orçamento
 */
export function templateNovoOrcamentoAdmin(
  nomeCliente: string,
  emailCliente: string,
  telefoneCliente: string,
  numeroOrcamento: string,
  tipo: string,
  descricao: string
): EmailTemplate {
  return {
    to: 'contato@3dkprint.com.br', // E-mail do admin
    subject: `[NOVO] Orçamento #${numeroOrcamento} - ${nomeCliente}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ff6b6b; padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">🔔 NOVO ORÇAMENTO RECEBIDO</h2>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h3>Detalhes do Cliente</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Nome:</strong> ${nomeCliente}</li>
            <li><strong>E-mail:</strong> <a href="mailto:${emailCliente}">${emailCliente}</a></li>
            <li><strong>Telefone:</strong> <a href="tel:${telefoneCliente}">${telefoneCliente}</a></li>
          </ul>
          
          <h3 style="margin-top: 20px;">Detalhes do Orçamento</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>ID:</strong> #${numeroOrcamento}</li>
            <li><strong>Tipo:</strong> ${tipo}</li>
            <li><strong>Descrição:</strong> ${descricao}</li>
          </ul>
          
          <p style="margin-top: 20px;">
            <a href="https://www.3dkprint.com.br/admin/orcamentos" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Ver no Painel Admin
            </a>
          </p>
        </div>
      </div>
    `,
  };
}

/**
 * Template de aprovação de orçamento para o cliente
 */
export function templateOrcamentoAprovado(
  nomeCliente: string,
  numeroOrcamento: string,
  valorFinal: number,
  prazoEntrega: string
): EmailTemplate {
  return {
    to: '', // Será preenchido com o e-mail do cliente
    subject: `Orçamento #${numeroOrcamento} - APROVADO!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; color: white; text-align: center;">
          <h1 style="margin: 0;">✓ Orçamento Aprovado!</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Olá ${nomeCliente}!</h2>
          
          <p>Excelente notícia! Seu orçamento foi aprovado e estamos prontos para começar!</p>
          
          <div style="background: white; padding: 20px; border-left: 4px solid #51cf66; margin: 20px 0;">
            <p><strong>Número do Orçamento:</strong> #${numeroOrcamento}</p>
            <p><strong>Valor Final:</strong> R$ ${valorFinal.toFixed(2)}</p>
            <p><strong>Prazo de Entrega:</strong> ${prazoEntrega}</p>
            <p><strong>Status:</strong> ✓ Aprovado</p>
          </div>
          
          <p>Próximos passos:</p>
          <ol>
            <li>Você receberá um link para pagamento</li>
            <li>Após confirmação do pagamento, iniciaremos a produção</li>
            <li>Você receberá atualizações sobre o progresso</li>
            <li>Entrega conforme prazo acordado</li>
          </ol>
          
          <p style="margin-top: 30px;">
            <a href="https://www.3dkprint.com.br/meus-orcamentos" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Acompanhar Projeto
            </a>
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">© 2026 3DKPRINT. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
  };
}

/**
 * Função para enviar e-mail via Supabase Function
 * 
 * Você precisa criar uma Supabase Function que execute este código:
 * 
 * ```typescript
 * import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
 * import { Resend } from "https://cdn.jsdelivr.net/npm/resend@latest/+esm"
 * 
 * const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
 * 
 * serve(async (req) => {
 *   const { to, subject, html } = await req.json()
 *   const data = await resend.emails.send({
 *     from: "noreply@3dkprint.com.br",
 *     to,
 *     subject,
 *     html,
 *   })
 *   return new Response(JSON.stringify(data), { status: 200 })
 * })
 * ```
 */
export async function enviarEmail(email: EmailTemplate) {
  try {
    // Chamar a Supabase Function
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(email),
      }
    );

    if (!response.ok) {
      throw new Error('Falha ao enviar e-mail');
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    return { success: false, error };
  }
}

/**
 * Enviar confirmação de novo orçamento para o cliente
 */
export async function notificarNovoOrcamento(
  emailCliente: string,
  nomeCliente: string,
  numeroOrcamento: string,
  tipo: string,
  valor: number
) {
  const template = templateConfirmacaoOrcamentoCliente(
    nomeCliente,
    numeroOrcamento,
    tipo,
    valor
  );
  
  return enviarEmail({
    ...template,
    to: emailCliente,
  });
}

/**
 * Notificar administrador sobre novo orçamento
 */
export async function notificarAdminNovoOrcamento(
  nomeCliente: string,
  emailCliente: string,
  telefoneCliente: string,
  numeroOrcamento: string,
  tipo: string,
  descricao: string
) {
  const template = templateNovoOrcamentoAdmin(
    nomeCliente,
    emailCliente,
    telefoneCliente,
    numeroOrcamento,
    tipo,
    descricao
  );
  
  return enviarEmail(template);
}

/**
 * Notificar cliente sobre aprovação do orçamento
 */
export async function notificarOrcamentoAprovado(
  emailCliente: string,
  nomeCliente: string,
  numeroOrcamento: string,
  valorFinal: number,
  prazoEntrega: string
) {
  const template = templateOrcamentoAprovado(
    nomeCliente,
    numeroOrcamento,
    valorFinal,
    prazoEntrega
  );
  
  return enviarEmail({
    ...template,
    to: emailCliente,
  });
}

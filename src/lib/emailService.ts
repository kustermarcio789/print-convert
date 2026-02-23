import { gerarPDFOrcamento } from './pdfGenerator';

interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: {
    filename: string;
    content: Blob;
  }[];
}

interface OrcamentoEmailData {
  orcamentoId: string;
  clienteNome: string;
  clienteEmail: string;
  clienteTelefone: string;
  tipo: string;
  descricao: string;
  valorServico: number;
  valorFrete: number;
  valorTotal: number;
  data: string;
  prazoEntrega?: string;
  observacoes?: string;
}

/**
 * Envia email usando EmailJS ou API própria
 * Para produção, configure as credenciais do EmailJS ou use um backend próprio
 */
export async function enviarEmail(data: EmailData): Promise<boolean> {
  try {
    // Simulação de envio de email
    // Em produção, integrar com EmailJS, SendGrid, AWS SES, etc.
    
    console.log('Enviando email:', {
      to: data.to,
      subject: data.subject,
      attachments: data.attachments?.length || 0
    });

    // Simular delay de envio
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Em produção, usar algo como:
    /*
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: 'YOUR_SERVICE_ID',
        template_id: 'YOUR_TEMPLATE_ID',
        user_id: 'YOUR_USER_ID',
        template_params: {
          to_email: data.to,
          subject: data.subject,
          message: data.body,
        }
      })
    });

    return response.ok;
    */

    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
}

/**
 * Envia orçamento por email com PDF anexado
 */
export async function enviarOrcamentoPorEmail(data: OrcamentoEmailData): Promise<boolean> {
  try {
    // Gerar PDF
    const pdfBlob = await gerarPDFOrcamento({
      id: data.orcamentoId,
      cliente: {
        nome: data.clienteNome,
        email: data.clienteEmail,
        telefone: data.clienteTelefone,
      },
      tipo: data.tipo,
      descricao: data.descricao,
      valorServico: data.valorServico,
      valorFrete: data.valorFrete,
      valorTotal: data.valorTotal,
      data: data.data,
      prazoEntrega: data.prazoEntrega,
      observacoes: data.observacoes,
    });

    // Preparar corpo do email
    const emailBody = `
Olá ${data.clienteNome},

Segue em anexo o orçamento solicitado para o serviço de ${data.tipo}.

**Detalhes do Orçamento:**
- Número: ${data.orcamentoId}
- Serviço: ${data.tipo}
- Valor do Serviço: R$ ${data.valorServico.toFixed(2)}
- Valor do Frete: R$ ${data.valorFrete.toFixed(2)}
- **Valor Total: R$ ${data.valorTotal.toFixed(2)}**
${data.prazoEntrega ? `- Prazo de Entrega: ${data.prazoEntrega}` : ''}

**Dados para Pagamento:**
- Banco: 336 – Banco C6 S.A.
- Agência: 0001
- Conta: 40017048-5
- CNPJ: 62.440.010/0001-03
- Chave PIX: 62440010000103

${data.observacoes ? `\n**Observações:**\n${data.observacoes}\n` : ''}

Este orçamento tem validade de 7 dias a partir da data de emissão.

Após a confirmação do pagamento, o prazo de entrega será iniciado.

Qualquer dúvida, estamos à disposição!

Atenciosamente,
Equipe 3DKPRINT
www.3dkprint.com.br
(43) 9-9174-1518
    `.trim();

    // Enviar email com PDF anexado
    const success = await enviarEmail({
      to: data.clienteEmail,
      subject: `Orçamento ${data.orcamentoId} - 3DKPRINT`,
      body: emailBody,
      attachments: [
        {
          filename: `orcamento_${data.orcamentoId}.pdf`,
          content: pdfBlob
        }
      ]
    });

    return success;
  } catch (error) {
    console.error('Erro ao enviar orçamento por email:', error);
    return false;
  }
}

/**
 * Envia notificação de novo orçamento para o admin
 */
export async function notificarNovoOrcamento(data: {
  orcamentoId: string;
  clienteNome: string;
  tipo: string;
  valor: number;
}): Promise<boolean> {
  const emailBody = `
Novo orçamento recebido!

**Detalhes:**
- ID: ${data.orcamentoId}
- Cliente: ${data.clienteNome}
- Tipo: ${data.tipo}
- Valor: R$ ${data.valor.toFixed(2)}

Acesse o painel administrativo para visualizar e responder:
https://www.3dkprint.com.br/admin/orcamentos/${data.orcamentoId}
  `.trim();

  return await enviarEmail({
    to: '3dk.print.br@gmail.com',
    subject: `Novo Orçamento #${data.orcamentoId}`,
    body: emailBody
  });
}

/**
 * Envia notificação de mudança de status do orçamento
 */
export async function notificarMudancaStatus(data: {
  orcamentoId: string;
  clienteNome: string;
  clienteEmail: string;
  novoStatus: string;
  mensagem?: string;
}): Promise<boolean> {
  const statusLabels: Record<string, string> = {
    pendente: 'Pendente',
    aprovado: 'Aprovado',
    recusado: 'Recusado',
    em_producao: 'Em Produção',
    concluido: 'Concluído',
    cancelado: 'Cancelado'
  };

  const emailBody = `
Olá ${data.clienteNome},

O status do seu orçamento foi atualizado!

**Orçamento:** ${data.orcamentoId}
**Novo Status:** ${statusLabels[data.novoStatus] || data.novoStatus}

${data.mensagem ? `\n**Mensagem:**\n${data.mensagem}\n` : ''}

Você pode acompanhar o andamento do seu pedido através do nosso site.

Qualquer dúvida, estamos à disposição!

Atenciosamente,
Equipe 3DKPRINT
www.3dkprint.com.br
(43) 9-9174-1518
  `.trim();

  return await enviarEmail({
    to: data.clienteEmail,
    subject: `Atualização do Orçamento ${data.orcamentoId} - 3DKPRINT`,
    body: emailBody
  });
}

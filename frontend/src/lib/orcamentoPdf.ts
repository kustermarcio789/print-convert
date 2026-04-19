import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { OrcamentoV2 } from '@/types/orcamento';
import { EMPRESA, enderecoFormatado } from './empresaData';

function fmtCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('pt-BR');
}

function esc(s?: string | number | null): string {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const resp = await fetch(url, { mode: 'cors' });
    if (!resp.ok) return null;
    const blob = await resp.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function preloadImagens(orc: OrcamentoV2): Promise<Map<string, string>> {
  const cache = new Map<string, string>();
  const urls = new Set<string>();
  if (EMPRESA.logoUrl) urls.add(EMPRESA.logoUrl);
  orc.itens.forEach((it) => {
    if (it.imagem_principal) urls.add(it.imagem_principal);
  });
  await Promise.all(
    Array.from(urls).map(async (u) => {
      const d = await urlToDataUrl(u);
      if (d) cache.set(u, d);
    })
  );
  return cache;
}

function buildHtml(orc: OrcamentoV2, imgCache: Map<string, string>): string {
  const subtotal = orc.itens.reduce((a, it) => a + it.valor_total, 0);
  const frete = orc.envio.valor_frete || 0;
  const base = subtotal + frete;
  const desconto = base * ((orc.desconto_percentual || 0) / 100);
  const total = base - desconto;

  const logo = imgCache.get(EMPRESA.logoUrl) || '';
  const numeroTag = orc.numero || (orc.id ? `#${orc.id.slice(0, 8)}` : '');

  const enderecoCliente = [
    orc.endereco.logradouro,
    orc.endereco.numero && `N° ${orc.endereco.numero}`,
    orc.endereco.complemento,
    orc.endereco.bairro,
    orc.endereco.cidade && orc.endereco.estado
      ? `${orc.endereco.cidade}/${orc.endereco.estado}`
      : orc.endereco.cidade,
    orc.endereco.cep,
  ]
    .filter(Boolean)
    .join(', ');

  const itensHtml = orc.itens
    .map((it, i) => {
      const img = it.imagem_principal ? imgCache.get(it.imagem_principal) : null;
      const especs = [
        it.material && `Material: ${it.material}`,
        it.cor && `Cor: ${it.cor}`,
        it.acabamento && `Acab: ${it.acabamento}`,
      ]
        .filter(Boolean)
        .join(' • ');
      return `
      <div style="display:flex; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:14px; page-break-inside:avoid;">
        <div style="width:200px; min-width:200px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; padding:14px;">
          ${
            img
              ? `<img src="${img}" alt="" style="max-width:100%; max-height:200px; object-fit:contain;" />`
              : `<div style="color:#9ca3af; font-size:13px;">sem foto</div>`
          }
        </div>
        <div style="flex:1; padding:18px 22px; display:flex; flex-direction:column; gap:8px;">
          <div style="font-size:17px; font-weight:700; color:#1e40af; line-height:1.3;">
            ${i + 1}. ${esc(it.nome || 'Item sem nome')}
          </div>
          ${
            it.descricao
              ? `<div style="font-size:12px; color:#374151; line-height:1.5; max-height:60px; overflow:hidden;">${esc(it.descricao)}</div>`
              : ''
          }
          ${especs ? `<div style="font-size:11px; color:#6b7280;">${esc(especs)}</div>` : ''}
          <div style="border-top:1px solid #e5e7eb; margin-top:auto; padding-top:10px; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-size:13px; color:#374151;">
              <strong>Qtd:</strong> ${it.quantidade} × ${fmtCurrency(it.valor_unitario)}
            </div>
            <div style="font-size:18px; font-weight:700; color:#059669;">
              ${fmtCurrency(it.valor_total)}
            </div>
          </div>
        </div>
      </div>`;
    })
    .join('');

  return `
  <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background:#ffffff; color:#1f2937; width:800px; padding:0; margin:0;">
    <!-- HEADER -->
    <div style="background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding:28px 36px; display:flex; align-items:center; gap:22px;">
      ${
        logo
          ? `<div style="width:88px; height:88px; background:#ffffff1a; border-radius:14px; display:flex; align-items:center; justify-content:center; padding:8px;">
              <img src="${logo}" alt="logo" style="max-width:100%; max-height:100%; object-fit:contain;" />
            </div>`
          : ''
      }
      <div style="flex:1;">
        <div style="font-size:34px; font-weight:800; color:#ffffff; letter-spacing:1px;">${esc(EMPRESA.nomeFantasia)}</div>
        <div style="font-size:14px; color:#dbeafe; margin-top:4px;">Proposta de Orçamento${numeroTag ? ` — ${esc(numeroTag)}` : ''}</div>
      </div>
      <div style="text-align:right; color:#dbeafe; font-size:11px; line-height:1.7;">
        <div>Emitido em <strong style="color:#fff;">${fmtDate(orc.created_at)}</strong></div>
        <div>Validade: <strong style="color:#fff;">${orc.validade_dias} dias</strong></div>
        <div>${esc(EMPRESA.site)}</div>
      </div>
    </div>

    <!-- DADOS EMPRESA -->
    <div style="background:#f8fafc; padding:14px 36px; border-bottom:2px solid #e5e7eb; display:flex; gap:28px; font-size:12px; color:#374151; flex-wrap:wrap;">
      <div>📞 <strong>${esc(EMPRESA.contato.telefone)}</strong></div>
      <div>✉️ ${esc(EMPRESA.contato.email)}</div>
      <div>📍 CNPJ <strong>${esc(EMPRESA.cnpj)}</strong></div>
      <div style="flex-basis:100%; color:#6b7280;">📌 ${esc(enderecoFormatado())}</div>
    </div>

    <!-- BODY -->
    <div style="padding:24px 36px;">

      <!-- DADOS DO CLIENTE -->
      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:18px 22px; margin-bottom:22px;">
        <div style="font-size:13px; font-weight:700; color:#1e40af; letter-spacing:0.5px; margin-bottom:12px;">
          DADOS DO CLIENTE
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px 28px; font-size:13px; color:#374151;">
          <div>👤 <strong>${esc(orc.cliente_nome || '—')}</strong></div>
          <div>${orc.cliente_tipo === 'PJ' ? 'CNPJ' : 'CPF'}: <strong>${esc(orc.cliente_cpf_cnpj || '—')}</strong></div>
          <div>✉️ ${esc(orc.cliente_email || '—')}</div>
          <div>💬 WhatsApp: <strong>${esc(orc.cliente_whatsapp || '—')}</strong></div>
        </div>
        ${
          enderecoCliente
            ? `<div style="margin-top:12px; font-size:12px; color:#4b5563;">📍 Endereço: ${esc(enderecoCliente)}</div>`
            : ''
        }
      </div>

      <!-- ITENS -->
      <div style="font-size:15px; font-weight:700; color:#1f2937; margin-bottom:12px; border-bottom:2px solid #2563eb; padding-bottom:6px;">
        ITENS DO ORÇAMENTO <span style="color:#2563eb;">(${orc.itens.length})</span>
      </div>

      ${itensHtml}

      <!-- TOTAIS -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:18px;">
        <div style="background:#f3f4f6; border-radius:12px; padding:18px 22px; font-size:13px; color:#374151;">
          <div style="display:flex; justify-content:space-between; padding:4px 0;">
            <span>Subtotal dos itens:</span>
            <strong>${fmtCurrency(subtotal)}</strong>
          </div>
          ${
            frete > 0
              ? `<div style="display:flex; justify-content:space-between; padding:4px 0;">
                  <span>Frete${orc.envio.modalidade ? ` (${esc(orc.envio.modalidade)}${orc.envio.prazo_dias ? `, ${orc.envio.prazo_dias}d` : ''})` : ''}:</span>
                  <strong>${fmtCurrency(frete)}</strong>
                </div>`
              : ''
          }
          ${
            desconto > 0
              ? `<div style="display:flex; justify-content:space-between; padding:4px 0; color:#dc2626;">
                  <span>Desconto (${orc.desconto_percentual}%):</span>
                  <strong>− ${fmtCurrency(desconto)}</strong>
                </div>`
              : ''
          }
        </div>
        <div style="background:linear-gradient(135deg, #047857, #065f46); color:#ffffff; border-radius:12px; padding:18px 22px; display:flex; flex-direction:column; justify-content:center; text-align:center;">
          <div style="font-size:12px; letter-spacing:1px; opacity:0.85;">INVESTIMENTO TOTAL:</div>
          <div style="font-size:30px; font-weight:800; margin-top:6px;">${fmtCurrency(total)}</div>
        </div>
      </div>

    </div>

    <!-- BANNER -->
    <div style="background:linear-gradient(90deg, transparent, #2563eb, transparent); padding:14px; text-align:center;">
      <div style="color:#ffffff; font-size:15px; font-weight:700; letter-spacing:0.5px;">
        Especialistas em impressão 3D industrial
      </div>
    </div>

    <!-- VALIDADE + OBS -->
    <div style="padding:16px 36px 6px; text-align:center; font-size:12px; color:#6b7280;">
      Condição válida por <strong>${orc.validade_dias} dias</strong> — sujeita a alteração de preço sem aviso.
    </div>

    ${
      orc.observacoes_cliente
        ? `<div style="margin:10px 36px 4px; padding:12px 16px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:6px; font-size:12px; color:#78350f;">
            <strong>Observações:</strong> ${esc(orc.observacoes_cliente)}
          </div>`
        : ''
    }

    <!-- FOOTER -->
    <div style="background:linear-gradient(135deg, #1e3a8a, #1e40af); color:#ffffff; padding:16px 36px; margin-top:18px; text-align:center; font-size:11px; line-height:1.8;">
      <div style="font-size:13px; font-weight:600;">
        📞 ${esc(EMPRESA.contato.telefone)} &nbsp;•&nbsp; ✉️ ${esc(EMPRESA.contato.email)}
      </div>
      <div style="opacity:0.8; margin-top:4px;">
        ${esc(EMPRESA.razaoSocial)} — CNPJ ${esc(EMPRESA.cnpj)} — CNAE ${esc(EMPRESA.atividadePrincipalCnae)}
      </div>
    </div>
  </div>`;
}

export interface PdfOptions {
  nomeEmpresa?: string;
}

function sanitizeFilename(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120) || 'orcamento';
}

export async function gerarOrcamentoPdf(orc: OrcamentoV2, _opts: PdfOptions = {}): Promise<jsPDF> {
  const imgCache = await preloadImagens(orc);
  const html = buildHtml(orc, imgCache);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = '#ffffff';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await new Promise((r) => setTimeout(r, 200));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
    });

    if (!canvas.width || !canvas.height) {
      throw new Error('Falha ao renderizar o orçamento em canvas');
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasAspect = canvas.height / canvas.width;
    const pageAspect = pdfHeight / pdfWidth;

    if (canvasAspect <= pageAspect) {
      const imgHeight = pdfWidth * canvasAspect;
      const dataUrl = canvas.toDataURL('image/png');
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);
    } else {
      const pxPerMm = canvas.width / pdfWidth;
      const pagePx = pdfHeight * pxPerMm;
      let y = 0;
      let pageIdx = 0;
      while (y < canvas.height) {
        const sliceH = Math.min(pagePx, canvas.height - y);
        const tmp = document.createElement('canvas');
        tmp.width = canvas.width;
        tmp.height = sliceH;
        const ctx = tmp.getContext('2d');
        if (!ctx) throw new Error('Canvas 2D context não disponível');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, tmp.width, tmp.height);
        ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        const dataUrl = tmp.toDataURL('image/png');
        if (pageIdx > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, (sliceH / canvas.width) * pdfWidth);
        y += sliceH;
        pageIdx++;
      }
    }

    return pdf;
  } finally {
    container.remove();
  }
}

export async function baixarOrcamentoPdf(orc: OrcamentoV2, opts?: PdfOptions) {
  try {
    const doc = await gerarOrcamentoPdf(orc, opts);
    const ref = orc.numero || (orc.id ? orc.id.slice(0, 8) : String(Date.now()));
    const cliente = orc.cliente_nome || 'cliente';
    const nome = `${sanitizeFilename(ref)}_${sanitizeFilename(cliente)}.pdf`;
    doc.save(nome);
  } catch (err) {
    console.error('[orcamentoPdf] falha ao gerar/salvar:', err);
    throw err;
  }
}

export function formatarMensagemWhatsApp(orc: OrcamentoV2): string {
  const linhas: string[] = [];
  linhas.push(`*${EMPRESA.nomeFantasia} — Proposta de Orçamento*`);
  if (orc.numero) linhas.push(`_${orc.numero}_`);
  linhas.push('');
  linhas.push(`Olá ${orc.cliente_nome}! 👋`);
  linhas.push('');
  linhas.push(`Segue a proposta com *${orc.itens.length} ${orc.itens.length === 1 ? 'item' : 'itens'}*:`);
  linhas.push('');

  orc.itens.forEach((it, i) => {
    linhas.push(`*${i + 1}. ${it.nome}* (${it.quantidade}x)`);
    if (it.material) linhas.push(`   🎨 Material: ${it.material}${it.cor ? ` — ${it.cor}` : ''}`);
    if (it.descricao) linhas.push(`   📝 ${it.descricao.slice(0, 140)}${it.descricao.length > 140 ? '...' : ''}`);
    linhas.push(`   💵 ${fmtCurrency(it.valor_total)}`);
    linhas.push('');
  });

  const subtotal = orc.itens.reduce((a, b) => a + b.valor_total, 0);
  const frete = orc.envio.valor_frete || 0;
  const base = subtotal + frete;
  const desconto = base * ((orc.desconto_percentual || 0) / 100);
  const total = base - desconto;

  linhas.push(`_Subtotal:_ ${fmtCurrency(subtotal)}`);
  if (frete > 0) linhas.push(`_Frete (${orc.envio.modalidade || '—'}):_ ${fmtCurrency(frete)}`);
  if (desconto > 0) linhas.push(`_Desconto (${orc.desconto_percentual}%):_ −${fmtCurrency(desconto)}`);
  linhas.push('');
  linhas.push(`💰 *INVESTIMENTO TOTAL: ${fmtCurrency(total)}*`);
  linhas.push('');
  if (orc.envio.prazo_dias) linhas.push(`⏰ Prazo estimado: *${orc.envio.prazo_dias} dias*`);
  linhas.push(`📅 Validade da proposta: *${orc.validade_dias} dias*`);
  linhas.push('');
  linhas.push(`Para aprovar, basta responder esta mensagem! ✅`);
  linhas.push('');
  linhas.push(`_${EMPRESA.razaoSocial}_`);
  linhas.push(`_CNPJ ${EMPRESA.cnpj} • ${EMPRESA.contato.site}_`);

  return linhas.join('\n');
}

export interface MensagemEmail {
  subject: string;
  body: string;
}

export function formatarMensagemEmail(orc: OrcamentoV2): MensagemEmail {
  const subtotal = orc.itens.reduce((a, b) => a + b.valor_total, 0);
  const frete = orc.envio.valor_frete || 0;
  const base = subtotal + frete;
  const desconto = base * ((orc.desconto_percentual || 0) / 100);
  const total = base - desconto;

  const num = orc.numero || (orc.id ? `#${orc.id.slice(0, 8)}` : '');
  const subject = `Proposta de Orçamento ${num} — ${EMPRESA.nomeFantasia}`;

  const linhas: string[] = [];
  linhas.push(`Olá ${orc.cliente_nome},`);
  linhas.push('');
  linhas.push(
    `Segue nossa proposta de orçamento ${num ? `(${num}) ` : ''}com ${orc.itens.length} ${orc.itens.length === 1 ? 'item' : 'itens'}.`
  );
  linhas.push('O PDF completo com imagens e detalhes está anexado a este e-mail.');
  linhas.push('');
  linhas.push('================================');
  linhas.push('RESUMO');
  linhas.push('================================');
  linhas.push('');

  orc.itens.forEach((it, i) => {
    linhas.push(`${i + 1}. ${it.nome}`);
    if (it.descricao) {
      const desc = it.descricao.length > 200 ? it.descricao.slice(0, 200) + '...' : it.descricao;
      linhas.push(`   ${desc}`);
    }
    const specs = [
      it.material && `Material: ${it.material}`,
      it.cor && `Cor: ${it.cor}`,
      it.acabamento && `Acabamento: ${it.acabamento}`,
    ]
      .filter(Boolean)
      .join(' | ');
    if (specs) linhas.push(`   ${specs}`);
    linhas.push(`   Qtd: ${it.quantidade}  x  ${fmtCurrency(it.valor_unitario)}  =  ${fmtCurrency(it.valor_total)}`);
    linhas.push('');
  });

  linhas.push('--------------------------------');
  linhas.push(`Subtotal dos itens: ${fmtCurrency(subtotal)}`);
  if (frete > 0) {
    const modalidade = orc.envio.modalidade ? ` (${orc.envio.modalidade}${orc.envio.prazo_dias ? `, ${orc.envio.prazo_dias} dias` : ''})` : '';
    linhas.push(`Frete${modalidade}: ${fmtCurrency(frete)}`);
  }
  if (desconto > 0) {
    linhas.push(`Desconto (${orc.desconto_percentual}%): - ${fmtCurrency(desconto)}`);
  }
  linhas.push('--------------------------------');
  linhas.push(`INVESTIMENTO TOTAL: ${fmtCurrency(total)}`);
  linhas.push('');
  if (orc.envio.prazo_dias) linhas.push(`Prazo estimado: ${orc.envio.prazo_dias} dias`);
  linhas.push(`Validade da proposta: ${orc.validade_dias} dias a partir desta data.`);
  linhas.push('');
  if (orc.observacoes_cliente) {
    linhas.push('Observações:');
    linhas.push(orc.observacoes_cliente);
    linhas.push('');
  }
  linhas.push('Para aprovar, basta responder este e-mail ou entrar em contato.');
  linhas.push('');
  linhas.push('Atenciosamente,');
  linhas.push(EMPRESA.nomeFantasia);
  linhas.push('');
  linhas.push('--');
  linhas.push(EMPRESA.razaoSocial);
  linhas.push(`CNPJ ${EMPRESA.cnpj}`);
  linhas.push(`${EMPRESA.contato.telefone}  |  ${EMPRESA.contato.email}`);
  linhas.push(`${EMPRESA.contato.site}`);

  return { subject, body: linhas.join('\n') };
}

/**
 * Baixa o PDF e abre o cliente de e-mail nativo do usuário com o corpo preparado.
 * Ele vai precisar anexar o PDF manualmente (está no Downloads).
 */
export async function enviarOrcamentoPorEmail(orc: OrcamentoV2): Promise<void> {
  await baixarOrcamentoPdf(orc);

  const { subject, body } = formatarMensagemEmail(orc);
  const to = orc.cliente_email || '';
  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // O mailto tem limite de tamanho (~2000 chars em alguns clientes). Se passar, usa sem body.
  if (mailto.length > 1800) {
    const shortBody = `Olá ${orc.cliente_nome},\n\nSegue em anexo a proposta de orçamento ${orc.numero || ''}.\n\nValor total: ${fmtCurrency(orc.valor_total)}\n\nAguardamos seu retorno!\n\n${EMPRESA.nomeFantasia}`;
    const shortLink = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(shortBody)}`;
    window.location.href = shortLink;
  } else {
    window.location.href = mailto;
  }
}

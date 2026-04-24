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

function getImagemEfetiva(it: OrcamentoV2['itens'][number]): string | undefined {
  if (it.imagem_principal) return it.imagem_principal;
  if (it.imagens && it.imagens.length > 0) return it.imagens[0];
  return undefined;
}

async function preloadImagens(orc: OrcamentoV2): Promise<Map<string, string>> {
  const cache = new Map<string, string>();
  const urls = new Set<string>();
  if (EMPRESA.logoUrl) urls.add(EMPRESA.logoUrl);
  orc.itens.forEach((it) => {
    const u = getImagemEfetiva(it);
    if (u) urls.add(u);
  });
  await Promise.all(
    Array.from(urls).map(async (u) => {
      const d = await urlToDataUrl(u);
      if (d) cache.set(u, d);
    })
  );
  return cache;
}

const ITENS_POR_PAGINA = 4;
// Dimensões do card de item. Controla caber 4 itens grandes em A4 mantendo qualidade.
const ITEM_HEIGHT = 180;
const ITEM_MARGIN = 10;
const ITEM_IMG_SIZE = 178; // área quadrada da foto

function buildItemHtml(it: OrcamentoV2['itens'][number], globalIdx: number, imgCache: Map<string, string>): string {
  const imgUrl = getImagemEfetiva(it);
  const img = imgUrl ? imgCache.get(imgUrl) : null;
  const especs = [
    it.material && `Material: ${it.material}`,
    it.cor && `Cor: ${it.cor}`,
    it.acabamento && `Acab: ${it.acabamento}`,
  ]
    .filter(Boolean)
    .join(' • ');
  const descShort = it.descricao ? (it.descricao.length > 240 ? it.descricao.slice(0, 240) + '...' : it.descricao) : '';
  // Usa <img> tag em vez de background-image: html2canvas preserva a resolução
  // original da imagem muito melhor assim (background-image sofre reamostragem agressiva).
  const imgBlock = img
    ? `<img src="${img}" style="width:100%; height:100%; object-fit:contain; display:block; image-rendering:high-quality;" />`
    : `<div style="display:flex; align-items:center; justify-content:center; height:100%; color:#9ca3af; font-size:12px;">sem foto</div>`;
  const textLeft = ITEM_IMG_SIZE + 14;
  return `
  <div style="position:relative; height:${ITEM_HEIGHT}px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; margin-bottom:${ITEM_MARGIN}px; box-sizing:border-box;">
    <div style="position:absolute; left:0; top:0; width:${ITEM_IMG_SIZE}px; height:${ITEM_HEIGHT - 2}px; background-color:#f3f4f6; padding:2px; box-sizing:border-box;">
      ${imgBlock}
    </div>
    <div style="margin-left:${textLeft}px; padding:12px 16px; height:${ITEM_HEIGHT - 2}px; box-sizing:border-box; overflow:hidden;">
      <div style="font-size:16px; font-weight:700; color:#1e40af; line-height:1.25; margin-bottom:6px;">
        ${globalIdx + 1}. ${esc(it.nome || 'Item sem nome')}
      </div>
      ${descShort ? `<div style="font-size:11px; color:#374151; line-height:1.45; max-height:74px; overflow:hidden; margin-bottom:5px;">${esc(descShort)}</div>` : ''}
      ${especs ? `<div style="font-size:11px; color:#6b7280; margin-bottom:5px;">${esc(especs)}</div>` : ''}
      <div style="position:absolute; bottom:10px; left:${textLeft + 12}px; right:16px; display:flex; justify-content:space-between; align-items:center; padding-top:6px; border-top:1px solid #e5e7eb;">
        <div style="font-size:12px; color:#374151;">
          <strong>Qtd:</strong> ${it.quantidade} × ${fmtCurrency(it.valor_unitario)}
        </div>
        <div style="font-size:18px; font-weight:700; color:#059669;">
          ${fmtCurrency(it.valor_total)}
        </div>
      </div>
    </div>
  </div>`;
}

function buildHeaderHtml(orc: OrcamentoV2, logo: string): string {
  const numeroTag = orc.numero || (orc.id ? `#${orc.id.slice(0, 8)}` : '');
  return `
    <div style="position:relative; height:92px; background:linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding:16px 28px; box-sizing:border-box; overflow:hidden;">
      ${
        logo
          ? `<div style="position:absolute; left:28px; top:14px; width:62px; height:62px; background-color:rgba(255,255,255,0.1); border-radius:10px; padding:5px; box-sizing:border-box;"><img src="${logo}" style="width:100%; height:100%; object-fit:contain; display:block;" /></div>`
          : ''
      }
      <div style="margin-left:${logo ? '82px' : '0'}; margin-right:200px;">
        <div style="font-size:26px; font-weight:800; color:#ffffff; letter-spacing:1px; line-height:1.1;">${esc(EMPRESA.nomeFantasia)}</div>
        <div style="font-size:12px; color:#dbeafe; margin-top:5px;">Proposta de Orçamento${numeroTag ? ` — ${esc(numeroTag)}` : ''}</div>
      </div>
      <div style="position:absolute; right:28px; top:16px; text-align:right; color:#dbeafe; font-size:10.5px; line-height:1.6;">
        <div>Emitido em <strong style="color:#fff;">${fmtDate(orc.created_at)}</strong></div>
        <div>Validade: <strong style="color:#fff;">${orc.validade_dias} dias</strong></div>
        <div>${esc(EMPRESA.contato.site)}</div>
      </div>
    </div>
    <div style="background:#f8fafc; padding:10px 36px; border-bottom:2px solid #e5e7eb; display:flex; gap:22px; font-size:11px; color:#374151; flex-wrap:wrap;">
      <div>📞 <strong>${esc(EMPRESA.contato.telefone)}</strong></div>
      <div>✉️ ${esc(EMPRESA.contato.email)}</div>
      <div>📍 CNPJ <strong>${esc(EMPRESA.cnpj)}</strong></div>
    </div>`;
}

function buildClienteHtml(orc: OrcamentoV2): string {
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
  return `
    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:10px; padding:12px 18px; margin-bottom:14px;">
      <div style="font-size:12px; font-weight:700; color:#1e40af; letter-spacing:0.5px; margin-bottom:8px;">DADOS DO CLIENTE</div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px 22px; font-size:12px; color:#374151;">
        <div>👤 <strong>${esc(orc.cliente_nome || '—')}</strong></div>
        <div>${orc.cliente_tipo === 'PJ' ? 'CNPJ' : 'CPF'}: <strong>${esc(orc.cliente_cpf_cnpj || '—')}</strong></div>
        <div>✉️ ${esc(orc.cliente_email || '—')}</div>
        <div>💬 WhatsApp: <strong>${esc(orc.cliente_whatsapp || '—')}</strong></div>
      </div>
      ${
        enderecoCliente
          ? `<div style="margin-top:8px; font-size:11px; color:#4b5563;">📍 ${esc(enderecoCliente)}</div>`
          : ''
      }
    </div>`;
}

function buildTotaisHtml(orc: OrcamentoV2): string {
  const subtotal = orc.itens.reduce((a, it) => a + it.valor_total, 0);
  const frete = orc.envio.valor_frete || 0;
  const base = subtotal + frete;
  const desconto = base * ((orc.desconto_percentual || 0) / 100);
  const total = base - desconto;
  return `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-top:12px;">
      <div style="background:#f3f4f6; border-radius:10px; padding:14px 18px; font-size:12px; color:#374151;">
        <div style="display:flex; justify-content:space-between; padding:3px 0;">
          <span>Subtotal dos itens:</span>
          <strong>${fmtCurrency(subtotal)}</strong>
        </div>
        ${
          frete > 0
            ? `<div style="display:flex; justify-content:space-between; padding:3px 0;">
                <span>Frete${orc.envio.modalidade ? ` (${esc(orc.envio.modalidade)}${orc.envio.prazo_dias ? `, ${orc.envio.prazo_dias}d` : ''})` : ''}:</span>
                <strong>${fmtCurrency(frete)}</strong>
              </div>`
            : ''
        }
        ${
          desconto > 0
            ? `<div style="display:flex; justify-content:space-between; padding:3px 0; color:#dc2626;">
                <span>Desconto (${orc.desconto_percentual}%):</span>
                <strong>− ${fmtCurrency(desconto)}</strong>
              </div>`
            : ''
        }
      </div>
      <div style="background:linear-gradient(135deg, #047857, #065f46); color:#ffffff; border-radius:10px; padding:14px 18px; display:flex; flex-direction:column; justify-content:center; text-align:center;">
        <div style="font-size:11px; letter-spacing:1px; opacity:0.85;">INVESTIMENTO TOTAL:</div>
        <div style="font-size:26px; font-weight:800; margin-top:4px;">${fmtCurrency(total)}</div>
      </div>
    </div>`;
}

function buildFooterHtml(orc: OrcamentoV2): string {
  return `
    <div style="background:linear-gradient(90deg, transparent, #2563eb, transparent); padding:10px; text-align:center;">
      <div style="color:#ffffff; font-size:13px; font-weight:700; letter-spacing:0.5px;">
        Especialistas em impressão 3D industrial
      </div>
    </div>
    <div style="padding:10px 36px 4px; text-align:center; font-size:11px; color:#6b7280;">
      Condição válida por <strong>${orc.validade_dias} dias</strong> — sujeita a alteração de preço sem aviso.
    </div>
    ${
      orc.observacoes_cliente
        ? `<div style="margin:8px 36px 4px; padding:8px 14px; background:#fef3c7; border-left:4px solid #f59e0b; border-radius:6px; font-size:11px; color:#78350f;">
            <strong>Observações:</strong> ${esc(orc.observacoes_cliente)}
          </div>`
        : ''
    }
    <div style="background:linear-gradient(135deg, #1e3a8a, #1e40af); color:#ffffff; padding:10px 36px; margin-top:10px; text-align:center; font-size:10.5px; line-height:1.7;">
      <div style="font-size:12px; font-weight:600;">
        📞 ${esc(EMPRESA.contato.telefone)} &nbsp;•&nbsp; ✉️ ${esc(EMPRESA.contato.email)}
      </div>
      <div style="opacity:0.8; margin-top:2px;">
        ${esc(EMPRESA.razaoSocial)} — CNPJ ${esc(EMPRESA.cnpj)} — CNAE ${esc(EMPRESA.atividadePrincipalCnae)}
      </div>
    </div>`;
}

function buildPaginaHtml(
  orc: OrcamentoV2,
  imgCache: Map<string, string>,
  itensDaPagina: OrcamentoV2['itens'],
  startIdx: number,
  isFirst: boolean,
  isLast: boolean,
  pageNum: number,
  totalPages: number,
): string {
  const logo = imgCache.get(EMPRESA.logoUrl) || '';
  const itensHtml = itensDaPagina.map((it, i) => buildItemHtml(it, startIdx + i, imgCache)).join('');
  const paginador = totalPages > 1
    ? `<div style="text-align:right; font-size:10px; color:#9ca3af; padding:4px 36px 0;">Página ${pageNum} de ${totalPages}</div>`
    : '';

  return `
  <div style="font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background:#ffffff; color:#1f2937; width:800px; padding:0; margin:0;">
    ${buildHeaderHtml(orc, logo)}
    ${paginador}
    <div style="padding:14px 36px;">
      ${isFirst ? buildClienteHtml(orc) : ''}
      <div style="font-size:13px; font-weight:700; color:#1f2937; margin-bottom:10px; border-bottom:2px solid #2563eb; padding-bottom:4px;">
        ITENS DO ORÇAMENTO <span style="color:#2563eb;">(${orc.itens.length})</span>${totalPages > 1 ? ` <span style="font-weight:400; color:#6b7280; font-size:11px;">— continuação</span>`.replace(' — continuação', isFirst ? '' : ' — continuação') : ''}
      </div>
      ${itensHtml}
      ${isLast ? buildTotaisHtml(orc) : ''}
    </div>
    ${isLast ? buildFooterHtml(orc) : ''}
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

async function renderPaginaCanvas(html: string): Promise<HTMLCanvasElement> {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-10000px';
  container.style.top = '0';
  container.style.width = '800px';
  container.style.background = '#ffffff';
  container.innerHTML = html;
  document.body.appendChild(container);
  try {
    // Espera um pouco mais pra garantir que todas as <img> (data URLs) já
    // foram decoded pelo browser antes do html2canvas capturar.
    await new Promise((r) => setTimeout(r, 250));
    // Força aguardar qualquer <img> no container terminar de carregar.
    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map((im) =>
        im.complete && im.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((res) => {
              im.addEventListener('load', () => res(), { once: true });
              im.addEventListener('error', () => res(), { once: true });
            })
      )
    );
    const canvas = await html2canvas(container, {
      // Scale 2.5 dobra+ a resolução efetiva do canvas. As imagens das peças
      // são renderizadas com muito mais detalhe (evita o efeito "pixelado/pequeno")
      // sem aumentar tanto o tamanho do arquivo a ponto de o PDF ficar lento.
      scale: 2.5,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: 800,
      windowWidth: 800,
      imageTimeout: 15000,
    });
    if (!canvas.width || !canvas.height) {
      throw new Error('Falha ao renderizar o orçamento em canvas');
    }
    return canvas;
  } finally {
    container.remove();
  }
}

export async function gerarOrcamentoPdf(orc: OrcamentoV2, _opts: PdfOptions = {}): Promise<jsPDF> {
  const imgCache = await preloadImagens(orc);

  // Divide itens em grupos de 5 por página
  const chunks: OrcamentoV2['itens'][] = [];
  for (let i = 0; i < orc.itens.length; i += ITENS_POR_PAGINA) {
    chunks.push(orc.itens.slice(i, i + ITENS_POR_PAGINA));
  }
  if (chunks.length === 0) chunks.push([]);

  const totalPages = chunks.length;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const pageAspect = pdfHeight / pdfWidth;

  for (let pageIdx = 0; pageIdx < totalPages; pageIdx++) {
    const itensDaPagina = chunks[pageIdx];
    const startIdx = pageIdx * ITENS_POR_PAGINA;
    const isFirst = pageIdx === 0;
    const isLast = pageIdx === totalPages - 1;
    const html = buildPaginaHtml(orc, imgCache, itensDaPagina, startIdx, isFirst, isLast, pageIdx + 1, totalPages);
    const canvas = await renderPaginaCanvas(html);

    const canvasAspect = canvas.height / canvas.width;
    if (pageIdx > 0) pdf.addPage();

    // Se a página cabe na A4 com folga, centraliza em largura total e altura proporcional.
    // Se a página ficou maior que a A4 (raro com 5 itens), fatia dentro dessa página apenas.
    if (canvasAspect <= pageAspect) {
      const imgHeight = pdfWidth * canvasAspect;
      const dataUrl = canvas.toDataURL('image/png');
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, imgHeight);
    } else {
      // fallback defensivo: compressão vertical para caber na página (mantém conteúdo visível)
      const dataUrl = canvas.toDataURL('image/png');
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
    }
  }

  return pdf;
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

export async function visualizarOrcamentoPdf(orc: OrcamentoV2, opts?: PdfOptions) {
  try {
    const doc = await gerarOrcamentoPdf(orc, opts);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) {
      // Pop-up bloqueado: cai pra download como fallback
      await baixarOrcamentoPdf(orc, opts);
      throw new Error('Pop-up bloqueado — baixei o PDF em vez de abrir');
    }
    // Libera a memória depois de um tempo (pro navegador carregar o blob)
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    console.error('[orcamentoPdf] falha ao visualizar:', err);
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
  // Assinatura centralizada (padding manual na largura 80)
  const CENTER_WIDTH = 80;
  const center = (s: string) => ' '.repeat(Math.max(0, Math.floor((CENTER_WIDTH - s.length) / 2))) + s;
  linhas.push(center(`CNPJ ${EMPRESA.cnpj}`));
  linhas.push(center(EMPRESA.contato.telefone));
  linhas.push(center(EMPRESA.contato.email));
  linhas.push(center(EMPRESA.contato.site));

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

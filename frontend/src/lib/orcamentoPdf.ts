import jsPDF from 'jspdf';
import type { OrcamentoV2 } from '@/types/orcamento';
import { EMPRESA, enderecoFormatado } from './empresaData';

const BRAND_BLUE: [number, number, number] = [37, 99, 235];
const BRAND_GREEN: [number, number, number] = [22, 163, 74];
const GRAY_DARK: [number, number, number] = [55, 65, 81];
const GRAY_LIGHT: [number, number, number] = [156, 163, 175];
const GRAY_BG: [number, number, number] = [243, 244, 246];

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

function fmtCurrency(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleDateString('pt-BR');
}

function sum(a: number, b: number) { return a + b; }

export interface PdfOptions {
  nomeEmpresa?: string;
  enderecoEmpresa?: string;
  telefoneEmpresa?: string;
  emailEmpresa?: string;
  logoUrl?: string;
}

const DEFAULT_OPTS: Required<PdfOptions> = {
  nomeEmpresa: EMPRESA.nomeFantasia,
  enderecoEmpresa: enderecoFormatado(),
  telefoneEmpresa: EMPRESA.contato.telefone,
  emailEmpresa: EMPRESA.contato.email,
  logoUrl: EMPRESA.logoUrl,
};

export async function gerarOrcamentoPdf(orc: OrcamentoV2, opts: PdfOptions = {}): Promise<jsPDF> {
  const conf = { ...DEFAULT_OPTS, ...opts };
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const marginX = 15;
  let y = 15;

  // Header azul com logo + nome empresa
  const headerH = 34;
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, pageW, headerH, 'F');

  // Logo (se carregar)
  const logoData = conf.logoUrl ? await urlToDataUrl(conf.logoUrl) : null;
  let textX = marginX;
  if (logoData) {
    try {
      const logoSize = 22;
      doc.addImage(logoData, 'PNG', marginX, 6, logoSize, logoSize);
      textX = marginX + logoSize + 5;
    } catch {
      /* se falhar, continua sem logo */
    }
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(conf.nomeEmpresa, textX, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Proposta de Orçamento', textX, 19);
  doc.text(`CNPJ ${EMPRESA.cnpj}`, textX, 23);
  doc.text(`${conf.telefoneEmpresa} • ${conf.emailEmpresa}`, textX, 27);
  doc.text(conf.enderecoEmpresa, textX, 31, { maxWidth: pageW - textX - 55 });

  if (orc.numero || orc.id) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const numero = orc.numero || `#${String(orc.id).slice(0, 8)}`;
    doc.text(numero, pageW - marginX, 12, { align: 'right' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(`Emitido em ${fmtDate(orc.created_at)}`, pageW - marginX, 18, { align: 'right' });
    doc.text(`Validade: ${orc.validade_dias} dias`, pageW - marginX, 23, { align: 'right' });
    doc.text(EMPRESA.site, pageW - marginX, 28, { align: 'right' });
  }

  y = 44;
  doc.setTextColor(...GRAY_DARK);

  doc.setFillColor(...GRAY_BG);
  doc.rect(marginX, y, pageW - 2 * marginX, 28, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', marginX + 3, y + 5);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_DARK);

  const leftX = marginX + 3;
  const rightX = pageW / 2 + 3;
  doc.text(`Nome: ${orc.cliente_nome || '—'}`, leftX, y + 11);
  doc.text(`${orc.cliente_tipo === 'PJ' ? 'CNPJ' : 'CPF'}: ${orc.cliente_cpf_cnpj || '—'}`, rightX, y + 11);
  doc.text(`E-mail: ${orc.cliente_email || '—'}`, leftX, y + 16);
  doc.text(`WhatsApp: ${orc.cliente_whatsapp || '—'}`, rightX, y + 16);
  const enderecoLinha = [
    orc.endereco.logradouro,
    orc.endereco.numero,
    orc.endereco.complemento,
    orc.endereco.bairro,
    orc.endereco.cidade && orc.endereco.estado ? `${orc.endereco.cidade}/${orc.endereco.estado}` : orc.endereco.cidade,
    orc.endereco.cep,
  ].filter(Boolean).join(', ');
  if (enderecoLinha) {
    doc.text(`Endereço: ${enderecoLinha}`, leftX, y + 22, { maxWidth: pageW - 2 * marginX - 6 });
  }

  y += 34;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND_BLUE);
  doc.text(`ITENS DO ORÇAMENTO (${orc.itens.length})`, marginX, y);
  y += 5;
  doc.setDrawColor(...BRAND_BLUE);
  doc.setLineWidth(0.5);
  doc.line(marginX, y, pageW - marginX, y);
  y += 4;

  for (let i = 0; i < orc.itens.length; i++) {
    const item = orc.itens[i];
    const imagemData = item.imagem_principal ? await urlToDataUrl(item.imagem_principal) : null;

    if (y > 250) { doc.addPage(); y = 20; }

    const blockStartY = y;
    const blockHeight = 42;

    doc.setFillColor(249, 250, 251);
    doc.rect(marginX, y, pageW - 2 * marginX, blockHeight, 'F');

    const imgX = marginX + 2;
    const imgY = y + 2;
    const imgSize = 38;

    if (imagemData) {
      try {
        doc.addImage(imagemData, 'JPEG', imgX, imgY, imgSize, imgSize);
      } catch {
        doc.setFillColor(...GRAY_LIGHT);
        doc.rect(imgX, imgY, imgSize, imgSize, 'F');
      }
    } else {
      doc.setFillColor(229, 231, 235);
      doc.rect(imgX, imgY, imgSize, imgSize, 'F');
      doc.setTextColor(...GRAY_LIGHT);
      doc.setFontSize(7);
      doc.text('sem foto', imgX + imgSize / 2, imgY + imgSize / 2, { align: 'center' });
    }

    const textX = imgX + imgSize + 4;
    const textMaxW = pageW - marginX - textX - 30;
    doc.setTextColor(...GRAY_DARK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}. ${item.nome || 'Item sem nome'}`, textX, y + 6, { maxWidth: textMaxW });

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    if (item.descricao) {
      const descLines = doc.splitTextToSize(item.descricao, textMaxW).slice(0, 3);
      doc.text(descLines, textX, y + 11);
    }

    const specLine = [
      item.material && `Material: ${item.material}`,
      item.cor && `Cor: ${item.cor}`,
      item.acabamento && `Acab: ${item.acabamento}`,
      (item.largura_mm || item.altura_mm || item.profundidade_mm) && `${item.largura_mm || '?'}×${item.altura_mm || '?'}×${item.profundidade_mm || '?'}mm`,
    ].filter(Boolean).join(' • ');
    if (specLine) {
      doc.setTextColor(...GRAY_LIGHT);
      doc.text(specLine, textX, y + 24, { maxWidth: textMaxW });
    }

    doc.setTextColor(...GRAY_DARK);
    doc.setFontSize(9);
    doc.text(`Qtd: ${item.quantidade}  ×  ${fmtCurrency(item.valor_unitario)}`, textX, y + 32);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_GREEN);
    doc.text(fmtCurrency(item.valor_total), pageW - marginX - 2, y + 32, { align: 'right' });

    y = blockStartY + blockHeight + 3;
  }

  if (y > 230) { doc.addPage(); y = 20; }

  const subtotal = orc.itens.reduce((acc, it) => acc + it.valor_total, 0);
  const frete = orc.envio.valor_frete || 0;
  const base = subtotal + frete;
  const desconto = base * ((orc.desconto_percentual || 0) / 100);
  const total = base - desconto;

  y += 4;
  doc.setTextColor(...GRAY_DARK);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal dos itens:', pageW - marginX - 60, y);
  doc.text(fmtCurrency(subtotal), pageW - marginX - 2, y, { align: 'right' });
  y += 5;

  if (frete > 0 || orc.envio.modalidade) {
    doc.text(`Frete (${orc.envio.modalidade || '—'}${orc.envio.prazo_dias ? `, ${orc.envio.prazo_dias}d` : ''}):`, pageW - marginX - 60, y);
    doc.text(fmtCurrency(frete), pageW - marginX - 2, y, { align: 'right' });
    y += 5;
  }

  if (desconto > 0) {
    doc.setTextColor(...BRAND_GREEN);
    doc.text(`Desconto (${orc.desconto_percentual}%):`, pageW - marginX - 60, y);
    doc.text(`− ${fmtCurrency(desconto)}`, pageW - marginX - 2, y, { align: 'right' });
    doc.setTextColor(...GRAY_DARK);
    y += 5;
  }

  y += 2;
  doc.setDrawColor(...BRAND_GREEN);
  doc.setLineWidth(0.8);
  doc.line(pageW - marginX - 62, y, pageW - marginX, y);
  y += 6;

  doc.setFillColor(...BRAND_GREEN);
  doc.rect(pageW - marginX - 62, y - 4, 62, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('VALOR TOTAL', pageW - marginX - 60, y + 2);
  doc.setFontSize(13);
  doc.text(fmtCurrency(total), pageW - marginX - 2, y + 3, { align: 'right' });
  y += 12;

  if (orc.observacoes_cliente) {
    y += 6;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setTextColor(...GRAY_DARK);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', marginX, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(orc.observacoes_cliente, pageW - 2 * marginX);
    doc.text(lines, marginX, y);
    y += lines.length * 4;
  }

  const pageH = doc.internal.pageSize.getHeight();

  // Linha separadora rodapé
  doc.setDrawColor(...GRAY_LIGHT);
  doc.setLineWidth(0.2);
  doc.line(marginX, pageH - 14, pageW - marginX, pageH - 14);

  doc.setFontSize(7);
  doc.setTextColor(...GRAY_DARK);
  doc.setFont('helvetica', 'bold');
  doc.text(EMPRESA.razaoSocial, pageW / 2, pageH - 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY_LIGHT);
  doc.text(
    `${EMPRESA.textoLegalRodape} • ${conf.telefoneEmpresa} • ${EMPRESA.site}`,
    pageW / 2, pageH - 6, { align: 'center' }
  );
  doc.text(
    `Orçamento válido por ${orc.validade_dias} dias a partir da data de emissão`,
    pageW / 2, pageH - 3, { align: 'center' }
  );

  return doc;
}

export async function baixarOrcamentoPdf(orc: OrcamentoV2, opts?: PdfOptions) {
  const doc = await gerarOrcamentoPdf(orc, opts);
  const nome = `Orcamento_${(orc.numero || orc.id || Date.now()).toString().replace(/[^\w-]/g, '_')}_${orc.cliente_nome.replace(/\s+/g, '_') || 'cliente'}.pdf`;
  doc.save(nome);
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
    linhas.push(`   💵 ${it.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
    linhas.push('');
  });

  const subtotal = orc.itens.reduce((a, b) => a + b.valor_total, 0);
  const frete = orc.envio.valor_frete || 0;
  const base = subtotal + frete;
  const desconto = base * ((orc.desconto_percentual || 0) / 100);
  const total = base - desconto;

  linhas.push(`_Subtotal:_ ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
  if (frete > 0) linhas.push(`_Frete (${orc.envio.modalidade || '—'}):_ ${frete.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
  if (desconto > 0) linhas.push(`_Desconto (${orc.desconto_percentual}%):_ −${desconto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`);
  linhas.push('');
  linhas.push(`💰 *VALOR TOTAL: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}*`);
  linhas.push('');
  if (orc.envio.prazo_dias) linhas.push(`⏰ Prazo estimado: *${orc.envio.prazo_dias} dias*`);
  linhas.push(`📅 Validade da proposta: *${orc.validade_dias} dias*`);
  linhas.push('');
  linhas.push(`Para aprovar, basta responder esta mensagem! ✅`);
  linhas.push('');
  linhas.push(`_${EMPRESA.razaoSocial}_`);
  linhas.push(`_CNPJ ${EMPRESA.cnpj} • ${EMPRESA.site}_`);

  return linhas.join('\n');
}

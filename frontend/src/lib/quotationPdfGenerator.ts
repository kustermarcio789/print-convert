/**
 * Gerador de PDF Profissional para Orçamentos - 3DKPRINT
 * Layout premium estilo ERP + QR Code PIX
 */

import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import type { Quotation, CompanyInfo } from './quotationTypes';
import { COMPANY_INFO, STATUS_LABELS, SERVICE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from './quotationTypes';
import { formatCurrencyBRL } from './quotePricingEngine';

// Logo 3DKPRINT
import logo3dkprint from '@/assets/logo-3dkprint.png';

// Cores
const COLORS = {
  primary: [15, 23, 42] as [number, number, number],      // azul escuro ERP
  primarySoft: [37, 99, 235] as [number, number, number], // azul destaque
  accent: [255, 193, 7] as [number, number, number],      // dourado/amarelo
  success: [22, 163, 74] as [number, number, number],
  warning: [245, 158, 11] as [number, number, number],
  danger: [220, 38, 38] as [number, number, number],
  text: [31, 41, 55] as [number, number, number],
  textLight: [107, 114, 128] as [number, number, number],
  background: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  muted: [241, 245, 249] as [number, number, number],
};

interface GeneratePdfOptions {
  quotation: Quotation;
  companyInfo?: CompanyInfo;
  includeInternalNotes?: boolean;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return 'N/A';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPhone(phone: string | undefined): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function getStatusColor(status?: string): [number, number, number] {
  switch ((status || '').toLowerCase()) {
    case 'aprovado':
      return COLORS.success;
    case 'pendente':
    case 'rascunho':
      return COLORS.warning;
    case 'recusado':
    case 'cancelado':
      return COLORS.danger;
    default:
      return COLORS.primarySoft;
  }
}

function safeText(value?: string | number | null): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function buildPixPayload(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount?: number;
  txid?: string;
  description?: string;
}): string {
  const sanitize = (str: string, max = 99) =>
    str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9\s\-\.]/g, '')
      .toUpperCase()
      .slice(0, max);

  const emv = (id: string, value: string) =>
    `${id}${String(value.length).padStart(2, '0')}${value}`;

  const merchantAccountInfo =
    emv('00', 'br.gov.bcb.pix') +
    emv('01', params.pixKey) +
    (params.description ? emv('02', sanitize(params.description, 72)) : '');

  let payload =
    emv('00', '01') +
    emv('01', '12') +
    emv('26', merchantAccountInfo) +
    emv('52', '0000') +
    emv('53', '986');

  if (params.amount && params.amount > 0) {
    payload += emv('54', params.amount.toFixed(2));
  }

  payload +=
    emv('58', 'BR') +
    emv('59', sanitize(params.merchantName, 25)) +
    emv('60', sanitize(params.merchantCity, 15)) +
    emv('62', emv('05', sanitize(params.txid || '3DKPRINT', 25)));

  const payloadToCrc = payload + '6304';

  const crc16 = (str: string) => {
    let crc = 0xffff;
    for (let c = 0; c < str.length; c++) {
      crc ^= str.charCodeAt(c) << 8;
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) {
          crc = (crc << 1) ^ 0x1021;
        } else {
          crc <<= 1;
        }
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  };

  return payloadToCrc + crc16(payloadToCrc);
}

async function fileToDataUrl(src: string): Promise<string> {
  const response = await fetch(src);
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function generateQuotationPdf(options: GeneratePdfOptions): Promise<Blob> {
  const { quotation, companyInfo = COMPANY_INFO, includeInternalNotes = false } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const rightX = pageWidth - margin;
  let yPos = 0;

  const logoDataUrl = await fileToDataUrl(logo3dkprint);

  const pixPayload = buildPixPayload({
    pixKey: '62440010000103',
    merchantName: '62.440.010 JOSE MARCIO KUSTER DE AZEVEDO',
    merchantCity: 'JACAREZINHO',
    amount: quotation.final_total || quotation.total || 0,
    txid: quotation.quotation_number || '3DKPRINT',
    description: `Orcamento ${quotation.quotation_number || ''}`.trim(),
  });

  const pixQrDataUrl = await QRCode.toDataURL(pixPayload, {
    margin: 1,
    width: 256,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });

  const checkPageBreak = (heightNeeded: number) => {
    if (yPos + heightNeeded > pageHeight - 28) {
      doc.addPage();
      yPos = margin;
    }
  };

  const drawSectionTitle = (title: string) => {
    doc.setFillColor(...COLORS.muted);
    doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(title, margin + 4, yPos + 5.5);
    yPos += 12;
  };

  // ==================== HEADER ====================
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 34, 'F');

  doc.addImage(logoDataUrl, 'PNG', margin, 6, 22, 22);

  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(21);
  doc.text(companyInfo.name || '3DKPRINT', margin + 28, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('PROPOSTA COMERCIAL / ORÇAMENTO', margin + 28, 21);
  doc.text('Impressão 3D • Modelagem • Produção Sob Demanda', margin + 28, 26);

  doc.setFontSize(8.5);
  doc.text(`CNPJ: ${companyInfo.cnpj || '62.440.010/0001-03'}`, rightX, 12, { align: 'right' });
  doc.text(formatPhone(companyInfo.phone), rightX, 17, { align: 'right' });
  doc.text(companyInfo.email, rightX, 22, { align: 'right' });
  doc.text(companyInfo.website, rightX, 27, { align: 'right' });

  yPos = 42;

  // ==================== TOP SUMMARY ====================
  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ORÇAMENTO COMERCIAL', margin, yPos);

  doc.setFontSize(11);
  doc.setTextColor(...COLORS.primarySoft);
  doc.text(`Nº ${safeText(quotation.quotation_number)}`, margin, yPos + 7);

  const statusLabel =
    STATUS_LABELS?.[quotation.status as keyof typeof STATUS_LABELS] ||
    safeText(quotation.status || 'Pendente');

  const statusColor = getStatusColor(quotation.status);
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - 50, yPos - 4, 38, 9, 3, 3, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(statusLabel.toUpperCase(), pageWidth - 31, yPos + 1.5, { align: 'center' });

  yPos += 16;

  // Caixa resumo superior
  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, yPos, contentWidth, 18, 3, 3, 'FD');

  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  doc.text('Emissão', margin + 5, yPos + 6);
  doc.text('Validade', margin + 55, yPos + 6);
  doc.text('Tipo de Serviço', margin + 105, yPos + 6);
  doc.text('Total', rightX - 20, yPos + 6, { align: 'right' });

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);

  doc.text(formatDate(quotation.issue_date), margin + 5, yPos + 12);
  doc.text(formatDate(quotation.validity_date), margin + 55, yPos + 12);
  doc.text(
    SERVICE_TYPE_LABELS?.[quotation.service_type as keyof typeof SERVICE_TYPE_LABELS] ||
      safeText(quotation.service_type),
    margin + 105,
    yPos + 12
  );
  doc.setTextColor(...COLORS.success);
  doc.setFontSize(12);
  doc.text(formatCurrencyBRL(quotation.final_total || quotation.total || 0), rightX - 5, yPos + 12, {
    align: 'right',
  });

  yPos += 25;

  // ==================== CLIENT DATA ====================
  drawSectionTitle('DADOS DO CLIENTE');

  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, yPos - 2, contentWidth, 34, 3, 3, 'FD');

  let clientY = yPos + 4;
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  doc.text('Nome / Contato:', margin + 4, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(quotation.client_name), margin + 32, clientY);

  doc.setFont('helvetica', 'bold');
  doc.text('Empresa:', margin + 110, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(quotation.company_name || '-'), margin + 126, clientY);

  clientY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('E-mail:', margin + 4, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(quotation.client_email || '-'), margin + 18, clientY);

  doc.setFont('helvetica', 'bold');
  doc.text('Telefone:', margin + 110, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatPhone(quotation.client_phone || quotation.client_whatsapp) || '-', margin + 129, clientY);

  clientY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('CPF/CNPJ:', margin + 4, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(quotation.client_cnpj || quotation.client_cpf || '-'), margin + 23, clientY);

  clientY += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Observação de cadastro:', margin + 4, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text('Proposta emitida conforme dados informados pelo cliente.', margin + 42, clientY);

  yPos += 38;

  // ==================== ITEMS ====================
  checkPageBreak(70);
  drawSectionTitle('ITENS DO ORÇAMENTO');

  const tableHeaders = ['#', 'Descrição', 'Qtd', 'Preço Unit.', 'Desc.', 'Total'];
  const colWidths = [8, 73, 14, 28, 22, 28];
  const colX = [margin];
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i - 1] + colWidths[i - 1] + 2);
  }

  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(margin, yPos, contentWidth, 8, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);

  tableHeaders.forEach((header, i) => {
    const align = i >= 2 ? 'right' : 'left';
    const x = align === 'right' ? colX[i] + colWidths[i] : colX[i] + 2;
    doc.text(header, x, yPos + 5.3, { align });
  });

  yPos += 9;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.text);

  quotation.items.forEach((item, index) => {
    checkPageBreak(10);

    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos - 1, contentWidth, 8, 'F');
    }

    doc.text(String(index + 1), colX[0] + 2, yPos + 4);

    let descText = safeText(item.name);
    if (item.description) descText += ` - ${item.description}`;
    const descLines = doc.splitTextToSize(descText, colWidths[1] - 2);
    doc.text(descLines[0] || '-', colX[1] + 2, yPos + 4);

    doc.text(String(item.quantity), colX[2] + colWidths[2], yPos + 4, { align: 'right' });
    doc.text(formatCurrencyBRL(item.unit_price), colX[3] + colWidths[3], yPos + 4, { align: 'right' });

    if (item.discount_amount > 0) {
      doc.setTextColor(...COLORS.success);
      doc.text(`-${formatCurrencyBRL(item.discount_amount)}`, colX[4] + colWidths[4], yPos + 4, {
        align: 'right',
      });
      doc.setTextColor(...COLORS.text);
    } else {
      doc.text('-', colX[4] + colWidths[4], yPos + 4, { align: 'right' });
    }

    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrencyBRL(item.total_price), colX[5] + colWidths[5], yPos + 4, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    yPos += 8;
  });

  doc.setDrawColor(...COLORS.border);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 7;

  // ==================== TOTALS ====================
  const totalsBoxX = pageWidth - 84;
  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(totalsBoxX, yPos, 72, 30, 3, 3, 'FD');

  let totalY = yPos + 7;
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');

  doc.text('Subtotal:', totalsBoxX + 4, totalY);
  doc.text(formatCurrencyBRL(quotation.subtotal), totalsBoxX + 68, totalY, { align: 'right' });
  totalY += 6;

  doc.text('Desconto:', totalsBoxX + 4, totalY);
  doc.text(`- ${formatCurrencyBRL(quotation.total_discount || 0)}`, totalsBoxX + 68, totalY, { align: 'right' });
  totalY += 6;

  doc.text('Frete:', totalsBoxX + 4, totalY);
  doc.text(formatCurrencyBRL(quotation.shipping_cost || 0), totalsBoxX + 68, totalY, { align: 'right' });
  totalY += 7;

  doc.setFillColor(...COLORS.success);
  doc.roundedRect(totalsBoxX + 3, totalY - 4, 66, 10, 2, 2, 'F');
  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL FINAL', totalsBoxX + 6, totalY + 2.5);
  doc.text(formatCurrencyBRL(quotation.final_total), totalsBoxX + 65, totalY + 2.5, { align: 'right' });

  yPos += 38;

  // ==================== COMMERCIAL TERMS ====================
  checkPageBreak(45);
  drawSectionTitle('CONDIÇÕES COMERCIAIS');

  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, yPos - 2, contentWidth, 28, 3, 3, 'FD');

  let condY = yPos + 4;
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Prazo de Produção:', margin + 4, condY);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(quotation.production_lead_time || '-'), margin + 38, condY);

  condY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Formas de Pagamento:', margin + 4, condY);
  doc.setFont('helvetica', 'normal');
  const paymentLabels = quotation.payment_methods?.length
    ? quotation.payment_methods.map((m) => PAYMENT_METHOD_LABELS[m] || m).join(', ')
    : '-';
  doc.text(paymentLabels, margin + 42, condY);

  condY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Condição Comercial:', margin + 4, condY);
  doc.setFont('helvetica', 'normal');
  doc.text(safeText(quotation.payment_conditions || 'Pagamento conforme negociação comercial.'), margin + 39, condY);

  yPos += 34;

  // ==================== COMMERCIAL MESSAGE ====================
  checkPageBreak(35);
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(margin, yPos, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Mensagem Comercial', margin + 5, yPos + 7);

  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.8);
  const commercialMessage = doc.splitTextToSize(
    'A 3DKPRINT agradece a oportunidade de apresentar esta proposta. Trabalhamos com foco em precisão técnica, acabamento profissional e compromisso com prazo. Permanecemos à disposição para ajustes, validações finais e aprovação imediata da produção.',
    contentWidth - 10
  );
  doc.text(commercialMessage, margin + 5, yPos + 13);

  yPos += 30;

  // ==================== OBSERVATIONS ====================
  if (quotation.observations) {
    checkPageBreak(28);
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, yPos, contentWidth, 22, 3, 3, 'F');

    doc.setTextColor(...COLORS.primarySoft);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Observações', margin + 5, yPos + 7);

    doc.setTextColor(...COLORS.text);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.8);
    const obsLines = doc.splitTextToSize(quotation.observations, contentWidth - 10);
    doc.text(obsLines, margin + 5, yPos + 13);

    yPos += 28;
  }

  // ==================== PAYMENT BLOCK + PIX QR ====================
  checkPageBreak(70);
  drawSectionTitle('DADOS PARA PAGAMENTO');

  // Caixa da esquerda
  doc.setDrawColor(...COLORS.border);
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, yPos - 2, 112, 52, 3, 3, 'FD');

  let bankY = yPos + 5;
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Banco:', margin + 4, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('336 – Banco C6 S.A.', margin + 18, bankY);

  bankY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Agência:', margin + 4, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('0001', margin + 22, bankY);

  bankY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Conta Corrente:', margin + 4, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('40017048-5', margin + 31, bankY);

  bankY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Chave PIX:', margin + 4, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('62440010000103', margin + 23, bankY);

  bankY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('CNPJ:', margin + 4, bankY);
  doc.setFont('helvetica', 'normal');
  doc.text('62.440.010/0001-03', margin + 18, bankY);

  bankY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Favorecido:', margin + 4, bankY);
  doc.setFont('helvetica', 'normal');
  const holderLines = doc.splitTextToSize('62.440.010 JOSE MARCIO KUSTER DE AZEVEDO', 70);
  doc.text(holderLines, margin + 25, bankY);

  // QR code box
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(pageWidth - 68, yPos - 2, 56, 52, 3, 3, 'FD');
  doc.addImage(pixQrDataUrl, 'PNG', pageWidth - 60, yPos + 3, 40, 40);

  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('PAGUE COM PIX', pageWidth - 40, yPos + 46, { align: 'center' });

  yPos += 58;

  // ==================== VALIDITY NOTICE ====================
  checkPageBreak(14);
  doc.setFillColor(254, 249, 195);
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');
  doc.setTextColor(133, 77, 14);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.8);
  doc.text(`Este orçamento é válido até ${formatDate(quotation.validity_date)} e poderá sofrer revisão após esse período.`, margin + 4, yPos + 6.2);

  // ==================== FOOTER ====================
  const footerY = pageHeight - 20;
  doc.setDrawColor(...COLORS.primary);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`${companyInfo.name} • Impressão 3D Profissional`, pageWidth / 2, footerY, { align: 'center' });
  doc.text(`CNPJ: ${companyInfo.cnpj} • ${companyInfo.email} • ${companyInfo.phone}`, pageWidth / 2, footerY + 4, { align: 'center' });
  doc.setTextColor(...COLORS.primarySoft);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.website, pageWidth / 2, footerY + 8, { align: 'center' });

  return doc.output('blob');
}

export async function downloadQuotationPdf(quotation: Quotation): Promise<void> {
  const blob = await generateQuotationPdf({ quotation });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Orcamento_${quotation.quotation_number}_${quotation.client_name.replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function openQuotationPdf(quotation: Quotation): Promise<void> {
  const blob = await generateQuotationPdf({ quotation });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

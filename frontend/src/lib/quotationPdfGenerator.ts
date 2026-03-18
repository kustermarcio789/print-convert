/**
 * Gerador de PDF Profissional para Orçamentos - 3DKPRINT
 * Usa jsPDF para criar PDFs de alta qualidade
 */

import jsPDF from 'jspdf';
import type { Quotation, CompanyInfo } from './quotationTypes';
import { COMPANY_INFO, STATUS_LABELS, SERVICE_TYPE_LABELS, PAYMENT_METHOD_LABELS } from './quotationTypes';
import { formatCurrencyBRL } from './quotePricingEngine';

// Cores do tema
const COLORS = {
  primary: [37, 99, 235] as [number, number, number],      // Azul #2563eb
  primaryDark: [29, 78, 216] as [number, number, number],  // Azul escuro
  secondary: [51, 51, 51] as [number, number, number],     // Cinza escuro
  accent: [255, 193, 7] as [number, number, number],       // Amarelo dourado (logo)
  success: [22, 163, 74] as [number, number, number],      // Verde
  text: [33, 33, 33] as [number, number, number],          // Texto principal
  textLight: [107, 114, 128] as [number, number, number],  // Texto secundário
  background: [249, 250, 251] as [number, number, number], // Fundo claro
  white: [255, 255, 255] as [number, number, number],
  border: [229, 231, 235] as [number, number, number],
};

interface GeneratePdfOptions {
  quotation: Quotation;
  companyInfo?: CompanyInfo;
  includeInternalNotes?: boolean;
}

/**
 * Formata data para exibição
 */
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

/**
 * Formata telefone
 */
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

/**
 * Gera o PDF do orçamento
 */
export async function generateQuotationPdf(options: GeneratePdfOptions): Promise<Blob> {
  const { quotation, companyInfo = COMPANY_INFO, includeInternalNotes = false } = options;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = 0;

  // ==================== CABEÇALHO ====================
  // Fundo do cabeçalho
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo/Nome da empresa
  doc.setTextColor(...COLORS.white);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Impressão 3D Profissional', margin, 26);

  // Informações da empresa no cabeçalho (lado direito)
  doc.setFontSize(9);
  const rightX = pageWidth - margin;
  doc.text(`CNPJ: ${companyInfo.cnpj}`, rightX, 14, { align: 'right' });
  doc.text(formatPhone(companyInfo.phone), rightX, 20, { align: 'right' });
  doc.text(companyInfo.email, rightX, 26, { align: 'right' });
  doc.text(companyInfo.website, rightX, 32, { align: 'right' });

  yPos = 55;

  // ==================== TÍTULO DO ORÇAMENTO ====================
  doc.setTextColor(...COLORS.secondary);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', margin, yPos);

  // Número e status
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text(`Nº ${quotation.quotation_number}`, margin, yPos + 8);

  // Datas (lado direito)
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textLight);
  doc.setFont('helvetica', 'normal');
  doc.text(`Emissão: ${formatDate(quotation.issue_date)}`, rightX, yPos, { align: 'right' });
  doc.text(`Validade: ${formatDate(quotation.validity_date)}`, rightX, yPos + 6, { align: 'right' });

  yPos += 20;

  // Linha separadora
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;

  // ==================== DADOS DO CLIENTE ====================
  // Caixa de dados do cliente
  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos, contentWidth, 42, 3, 3, 'F');

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', margin + 5, yPos + 7);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  let clientY = yPos + 14;

  // Nome / Razão Social
  if (quotation.company_name) {
    doc.setFont('helvetica', 'bold');
    doc.text('Razão Social:', margin + 5, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.company_name, margin + 35, clientY);
    clientY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Contato:', margin + 5, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.client_name, margin + 25, clientY);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', margin + 5, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.client_name, margin + 22, clientY);
  }
  clientY += 6;

  // CPF/CNPJ
  if (quotation.client_cnpj) {
    doc.setFont('helvetica', 'bold');
    doc.text('CNPJ:', margin + 5, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.client_cnpj, margin + 20, clientY);
    clientY += 6;
  } else if (quotation.client_cpf) {
    doc.setFont('helvetica', 'bold');
    doc.text('CPF:', margin + 5, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.client_cpf, margin + 17, clientY);
    clientY += 6;
  }

  // Telefone e Email (na mesma linha)
  doc.setFont('helvetica', 'bold');
  doc.text('Tel:', margin + 5, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatPhone(quotation.client_phone || quotation.client_whatsapp) || 'N/A', margin + 15, clientY);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', margin + 70, clientY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.client_email || 'N/A', margin + 85, clientY);

  yPos += 50;

  // ==================== TIPO DE SERVIÇO ====================
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tipo de Serviço: ${SERVICE_TYPE_LABELS[quotation.service_type] || quotation.service_type}`, margin, yPos);

  yPos += 10;

  // ==================== TABELA DE ITENS ====================
  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ITENS DO ORÇAMENTO', margin, yPos);
  yPos += 5;

  // Cabeçalho da tabela
  const tableHeaders = ['#', 'Descrição', 'Qtd', 'Preço Unit.', 'Desconto', 'Total'];
  const colWidths = [8, 75, 15, 28, 25, 28];
  const colX = [margin];
  for (let i = 1; i < colWidths.length; i++) {
    colX.push(colX[i - 1] + colWidths[i - 1] + 2);
  }

  // Fundo do cabeçalho
  doc.setFillColor(...COLORS.primary);
  doc.rect(margin, yPos, contentWidth, 8, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  tableHeaders.forEach((header, i) => {
    const align = i >= 2 ? 'right' : 'left';
    const x = align === 'right' ? colX[i] + colWidths[i] : colX[i] + 2;
    doc.text(header, x, yPos + 5.5, { align });
  });

  yPos += 8;

  // Linhas da tabela
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  quotation.items.forEach((item, index) => {
    // Verifica se precisa de nova página
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }

    // Fundo alternado
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos, contentWidth, 7, 'F');
    }

    // Número
    doc.text(String(index + 1), colX[0] + 2, yPos + 5);

    // Descrição (com truncamento se necessário)
    let descText = item.name;
    if (item.description) {
      descText += ` - ${item.description}`;
    }
    if (descText.length > 50) {
      descText = descText.substring(0, 47) + '...';
    }
    doc.text(descText, colX[1] + 2, yPos + 5);

    // Quantidade
    doc.text(String(item.quantity), colX[2] + colWidths[2], yPos + 5, { align: 'right' });

    // Preço unitário
    doc.text(formatCurrencyBRL(item.unit_price), colX[3] + colWidths[3], yPos + 5, { align: 'right' });

    // Desconto
    if (item.discount_amount > 0) {
      doc.setTextColor(...COLORS.success);
      doc.text(`-${formatCurrencyBRL(item.discount_amount)}`, colX[4] + colWidths[4], yPos + 5, { align: 'right' });
      doc.setTextColor(...COLORS.text);
    } else {
      doc.text('-', colX[4] + colWidths[4], yPos + 5, { align: 'right' });
    }

    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrencyBRL(item.total_price), colX[5] + colWidths[5], yPos + 5, { align: 'right' });
    doc.setFont('helvetica', 'normal');

    yPos += 7;
  });

  // Linha final da tabela
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 5;

  // ==================== TOTAIS ====================
  const totalsX = pageWidth - margin - 70;

  // Subtotal
  doc.setFontSize(10);
  doc.setTextColor(...COLORS.text);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, yPos);
  doc.text(formatCurrencyBRL(quotation.subtotal), pageWidth - margin, yPos, { align: 'right' });
  yPos += 6;

  // Desconto total (se houver)
  if (quotation.total_discount > 0) {
    doc.setTextColor(...COLORS.success);
    doc.text('Desconto Total:', totalsX, yPos);
    doc.text(`-${formatCurrencyBRL(quotation.total_discount)}`, pageWidth - margin, yPos, { align: 'right' });
    doc.setTextColor(...COLORS.text);
    yPos += 6;
  }

  // Frete (se houver)
  if (quotation.shipping_cost > 0) {
    doc.text('Frete:', totalsX, yPos);
    doc.text(formatCurrencyBRL(quotation.shipping_cost), pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  }

  yPos += 2;

  // Total Final (destacado)
  doc.setFillColor(...COLORS.success);
  doc.roundedRect(totalsX - 5, yPos - 4, 75, 12, 2, 2, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', totalsX, yPos + 4);
  doc.text(formatCurrencyBRL(quotation.final_total), pageWidth - margin - 3, yPos + 4, { align: 'right' });

  yPos += 18;

  // ==================== CONDIÇÕES COMERCIAIS ====================
  // Verifica se precisa de nova página
  if (yPos > pageHeight - 90) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos, contentWidth, 35, 3, 3, 'F');

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDIÇÕES COMERCIAIS', margin + 5, yPos + 7);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  let condY = yPos + 14;

  // Prazo de produção
  if (quotation.production_lead_time) {
    doc.setFont('helvetica', 'bold');
    doc.text('Prazo de Produção:', margin + 5, condY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.production_lead_time, margin + 45, condY);
    condY += 6;
  }

  // Formas de pagamento
  if (quotation.payment_methods && quotation.payment_methods.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.text('Formas de Pagamento:', margin + 5, condY);
    doc.setFont('helvetica', 'normal');
    const paymentLabels = quotation.payment_methods.map(m => PAYMENT_METHOD_LABELS[m] || m).join(', ');
    doc.text(paymentLabels, margin + 52, condY);
    condY += 6;
  }

  // Condições de pagamento
  if (quotation.payment_conditions) {
    doc.setFont('helvetica', 'bold');
    doc.text('Condições:', margin + 5, condY);
    doc.setFont('helvetica', 'normal');
    doc.text(quotation.payment_conditions, margin + 28, condY);
  }

  yPos += 42;

  // ==================== OBSERVAÇÕES ====================
  if (quotation.observations) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFillColor(255, 251, 235); // Amarelo claro
    doc.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');

    doc.setTextColor(146, 64, 14); // Texto âmbar
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', margin + 5, yPos + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const obsLines = doc.splitTextToSize(quotation.observations, contentWidth - 10);
    doc.text(obsLines, margin + 5, yPos + 14);

    yPos += 30;
  }

  // ==================== DADOS BANCÁRIOS ====================
  if (yPos > pageHeight - 60) {
    doc.addPage();
    yPos = margin;
  }

  doc.setFillColor(...COLORS.background);
  doc.roundedRect(margin, yPos, contentWidth, 40, 3, 3, 'F');

  doc.setTextColor(...COLORS.primary);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS PARA PAGAMENTO', margin + 5, yPos + 7);

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  let bankY = yPos + 14;
  doc.text(`Banco: ${companyInfo.bank_code} – ${companyInfo.bank_name}`, margin + 5, bankY);
  bankY += 5;
  doc.text(`Agência: ${companyInfo.bank_agency} | Conta Corrente: ${companyInfo.bank_account}`, margin + 5, bankY);
  bankY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text(`Chave PIX (CNPJ): ${companyInfo.pix_key}`, margin + 5, bankY);
  doc.setFont('helvetica', 'normal');
  bankY += 5;
  doc.text(`Titular: ${companyInfo.account_holder}`, margin + 5, bankY);

  yPos += 48;

  // ==================== VALIDADE ====================
  doc.setFillColor(254, 249, 195); // Amarelo claro
  doc.roundedRect(margin, yPos, contentWidth, 10, 2, 2, 'F');

  doc.setTextColor(133, 77, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(`⚠ Este orçamento é válido até ${formatDate(quotation.validity_date)}.`, margin + 5, yPos + 6.5);

  yPos += 15;

  // ==================== RODAPÉ ====================
  // Linha separadora
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

  // Informações da empresa no rodapé
  doc.setTextColor(...COLORS.textLight);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyInfo.name} – Impressão 3D Profissional | CNPJ: ${companyInfo.cnpj}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text(`${companyInfo.address}, ${companyInfo.city} - ${companyInfo.state}`, pageWidth / 2, pageHeight - 16, { align: 'center' });
  doc.text(`Tel.: ${companyInfo.phone} | Email: ${companyInfo.email}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  doc.setTextColor(...COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.website, pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Retorna o PDF como Blob
  return doc.output('blob');
}

/**
 * Gera e faz download do PDF
 */
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

/**
 * Abre o PDF em uma nova aba
 */
export async function openQuotationPdf(quotation: Quotation): Promise<void> {
  const blob = await generateQuotationPdf({ quotation });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

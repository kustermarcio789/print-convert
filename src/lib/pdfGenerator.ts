import { jsPDF } from 'jspdf';

interface OrcamentoData {
  id: string;
  cliente: {
    nome: string;
    email: string;
    telefone: string;
  };
  tipo: string;
  descricao: string;
  valorServico: number;
  valorFrete: number;
  valorTotal: number;
  data: string;
  prazoEntrega?: string;
  observacoes?: string;
}

export async function gerarPDFOrcamento(data: OrcamentoData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Adicionar logo
  try {
    const logoImg = await loadImage('/logo.png');
    doc.addImage(logoImg, 'PNG', margin, yPos, 40, 15);
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
  }

  // Título da empresa
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('3DKPRINT', pageWidth - margin, yPos + 10, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Impressão 3D e Serviços', pageWidth - margin, yPos + 16, { align: 'right' });
  doc.text('www.3dkprint.com.br', pageWidth - margin, yPos + 21, { align: 'right' });

  yPos += 35;

  // Linha separadora
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Título do documento
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nº ${data.id}`, pageWidth / 2, yPos, { align: 'center' });
  doc.text(`Data: ${data.data}`, pageWidth / 2, yPos + 5, { align: 'center' });
  yPos += 15;

  // Dados do cliente
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${data.cliente.nome}`, margin, yPos);
  yPos += 5;
  doc.text(`E-mail: ${data.cliente.email}`, margin, yPos);
  yPos += 5;
  doc.text(`Telefone: ${data.cliente.telefone}`, margin, yPos);
  yPos += 10;

  // Detalhes do serviço
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DETALHES DO SERVIÇO', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo de Serviço: ${data.tipo}`, margin, yPos);
  yPos += 5;
  
  // Descrição com quebra de linha
  const descricaoLines = doc.splitTextToSize(`Descrição: ${data.descricao}`, pageWidth - 2 * margin);
  doc.text(descricaoLines, margin, yPos);
  yPos += descricaoLines.length * 5 + 5;

  if (data.prazoEntrega) {
    doc.text(`Prazo de Entrega: ${data.prazoEntrega}`, margin, yPos);
    yPos += 5;
  }

  if (data.observacoes) {
    const obsLines = doc.splitTextToSize(`Observações: ${data.observacoes}`, pageWidth - 2 * margin);
    doc.text(obsLines, margin, yPos);
    yPos += obsLines.length * 5;
  }

  yPos += 10;

  // Tabela de valores
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALORES', margin, yPos);
  yPos += 7;

  // Cabeçalho da tabela
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  doc.setFontSize(10);
  doc.text('Descrição', margin + 2, yPos + 5);
  doc.text('Valor', pageWidth - margin - 30, yPos + 5);
  yPos += 10;

  // Linhas da tabela
  doc.setFont('helvetica', 'normal');
  doc.text('Serviço', margin + 2, yPos);
  doc.text(`R$ ${data.valorServico.toFixed(2)}`, pageWidth - margin - 30, yPos);
  yPos += 6;

  doc.text('Frete', margin + 2, yPos);
  doc.text(`R$ ${data.valorFrete.toFixed(2)}`, pageWidth - margin - 30, yPos);
  yPos += 8;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL', margin + 2, yPos);
  doc.text(`R$ ${data.valorTotal.toFixed(2)}`, pageWidth - margin - 30, yPos);
  yPos += 15;

  // Dados bancários
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS PARA PAGAMENTO', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Banco: 336 – Banco C6 S.A.', margin, yPos);
  yPos += 5;
  doc.text('Agência: 0001', margin, yPos);
  yPos += 5;
  doc.text('Conta: 40017048-5', margin, yPos);
  yPos += 5;
  doc.text('CNPJ: 62.440.010/0001-03', margin, yPos);
  yPos += 5;
  doc.text('Nome: JOSE MARCIO KUSTER DE AZEVEDO', margin, yPos);
  yPos += 10;

  // QR Code PIX
  try {
    const qrImg = await loadImage('/pix_qr.png');
    const qrSize = 50;
    const qrX = pageWidth - margin - qrSize;
    
    doc.setFont('helvetica', 'bold');
    doc.text('PIX QR CODE', qrX + qrSize / 2, yPos, { align: 'center' });
    yPos += 5;
    
    doc.addImage(qrImg, 'PNG', qrX, yPos, qrSize, qrSize);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Chave PIX:', margin, yPos + 10);
    yPos += 15;
    doc.text('62440010000103', margin, yPos);
  } catch (error) {
    console.error('Erro ao carregar QR Code:', error);
    doc.text('Chave PIX: 62440010000103', margin, yPos);
    yPos += 10;
  }

  // Rodapé
  const footerY = pageHeight - 20;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(128, 128, 128);
  doc.text('Este orçamento tem validade de 7 dias a partir da data de emissão.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Após a confirmação do pagamento, o prazo de entrega será iniciado.', pageWidth / 2, footerY + 4, { align: 'center' });

  return doc.output('blob');
}

// Função auxiliar para carregar imagens
function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Não foi possível obter contexto do canvas'));
      }
    };
    img.onerror = () => reject(new Error(`Erro ao carregar imagem: ${url}`));
    img.src = url;
  });
}

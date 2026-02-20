import jsPDF from 'jspdf';

interface ClienteData {
  nome: string;
  email: string;
  telefone: string;
  // Pessoa Física
  cpf?: string;
  rg?: string;
  // Pessoa Jurídica
  cnpj?: string;
  razaoSocial?: string;
  inscricaoEstadual?: string;
  // Endereço
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

interface ItemOrcamento {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface OrcamentoData {
  id: string;
  cliente: ClienteData;
  tipo: string;
  itens: ItemOrcamento[];
  subtotal: number;
  valorFrete: number;
  valorTotal: number;
  data: string;
  prazoEntrega?: string;
  observacoes?: string;
  status?: string;
}

// Função auxiliar para carregar imagem
async function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export async function gerarPDFOrcamento(data: OrcamentoData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Cores do tema 3DKPRINT
  const corPrimaria = [0, 102, 204]; // Azul
  const corSecundaria = [51, 51, 51]; // Cinza escuro
  const corDestaque = [255, 153, 0]; // Laranja
  const corTexto = [33, 33, 33];
  const corCinzaClaro = [240, 240, 240];
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // ===== CABEÇALHO PREMIUM =====
  // Fundo azul no topo
  doc.setFillColor(...corPrimaria);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Logo (tentar carregar, se falhar continua sem)
  try {
    const logoImg = await loadImage('/logo.png');
    doc.addImage(logoImg, 'PNG', margin, 8, 35, 24);
  } catch (error) {
    console.warn('Logo não carregada, continuando sem logo');
  }

  // Título da empresa (branco sobre azul)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('3DKPRINT', pageWidth - margin, 15, { align: 'right' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Impressão 3D Profissional', pageWidth - margin, 22, { align: 'right' });
  doc.text('CNPJ: 62.440.010/0001-03', pageWidth - margin, 28, { align: 'right' });
  doc.text('Tel.: (43) 9174-1518', pageWidth - margin, 34, { align: 'right' });

  yPos = 50;

  // ===== TÍTULO DO ORÇAMENTO =====
  doc.setTextColor(...corSecundaria);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`ORÇAMENTO Nº ${data.id}`, margin, yPos);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Data: ${data.data}`, margin, yPos + 7);
  
  if (data.status) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...corDestaque);
    doc.text(`Status: ${data.status.toUpperCase()}`, pageWidth - margin, yPos + 7, { align: 'right' });
  }

  yPos += 20;

  // Linha separadora
  doc.setDrawColor(...corPrimaria);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // ===== DADOS DO CLIENTE =====
  doc.setFillColor(...corCinzaClaro);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 45, 2, 2, 'F');
  
  doc.setTextColor(...corPrimaria);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', margin + 5, yPos + 7);
  
  doc.setTextColor(...corTexto);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let clienteY = yPos + 15;
  
  // Nome / Razão Social
  if (data.cliente.razaoSocial) {
    doc.setFont('helvetica', 'bold');
    doc.text('Razão Social:', margin + 5, clienteY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.cliente.razaoSocial, margin + 35, clienteY);
  } else {
    doc.setFont('helvetica', 'bold');
    doc.text('Nome:', margin + 5, clienteY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.cliente.nome, margin + 20, clienteY);
  }
  
  clienteY += 6;
  
  // CPF/CNPJ
  if (data.cliente.cnpj) {
    doc.setFont('helvetica', 'bold');
    doc.text('CNPJ:', margin + 5, clienteY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.cliente.cnpj, margin + 20, clienteY);
  } else if (data.cliente.cpf) {
    doc.setFont('helvetica', 'bold');
    doc.text('CPF:', margin + 5, clienteY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.cliente.cpf, margin + 17, clienteY);
  }
  
  clienteY += 6;
  
  // Endereço completo
  if (data.cliente.endereco) {
    const enderecoCompleto = `${data.cliente.endereco}${data.cliente.numero ? ', ' + data.cliente.numero : ''}${data.cliente.complemento ? ' - ' + data.cliente.complemento : ''}`;
    doc.setFont('helvetica', 'bold');
    doc.text('Endereço:', margin + 5, clienteY);
    doc.setFont('helvetica', 'normal');
    doc.text(enderecoCompleto, margin + 25, clienteY);
    clienteY += 6;
  }
  
  // Cidade/Estado/CEP
  if (data.cliente.cidade) {
    const cidadeEstado = `${data.cliente.cidade}${data.cliente.estado ? ' - ' + data.cliente.estado : ''}${data.cliente.cep ? ' | CEP: ' + data.cliente.cep : ''}`;
    doc.text(cidadeEstado, margin + 5, clienteY);
    clienteY += 6;
  }
  
  // Telefone e Email
  doc.setFont('helvetica', 'bold');
  doc.text('Tel.:', margin + 5, clienteY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.cliente.telefone, margin + 15, clienteY);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Email:', margin + 60, clienteY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.cliente.email, margin + 75, clienteY);

  yPos += 55;

  // ===== TABELA DE ITENS =====
  doc.setTextColor(...corPrimaria);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ITENS DO ORÇAMENTO', margin, yPos);
  yPos += 8;

  // Cabeçalho da tabela
  doc.setFillColor(...corPrimaria);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO', margin + 2, yPos + 5);
  doc.text('QTD', pageWidth - margin - 60, yPos + 5, { align: 'center' });
  doc.text('VLR UNIT.', pageWidth - margin - 40, yPos + 5, { align: 'center' });
  doc.text('TOTAL', pageWidth - margin - 2, yPos + 5, { align: 'right' });
  
  yPos += 8;

  // Linhas da tabela
  doc.setTextColor(...corTexto);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  data.itens.forEach((item, index) => {
    // Fundo alternado
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, yPos, pageWidth - 2 * margin, 7, 'F');
    }
    
    doc.text(item.descricao, margin + 2, yPos + 5);
    doc.text(item.quantidade.toString(), pageWidth - margin - 60, yPos + 5, { align: 'center' });
    doc.text(`R$ ${item.valorUnitario.toFixed(2)}`, pageWidth - margin - 40, yPos + 5, { align: 'center' });
    doc.text(`R$ ${item.valorTotal.toFixed(2)}`, pageWidth - margin - 2, yPos + 5, { align: 'right' });
    
    yPos += 7;
  });

  // Linha separadora
  doc.setDrawColor(...corPrimaria);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Subtotal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Subtotal:', pageWidth - margin - 40, yPos);
  doc.text(`R$ ${data.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 6;

  // Frete
  if (data.valorFrete > 0) {
    doc.setFont('helvetica', 'normal');
    doc.text('Frete:', pageWidth - margin - 40, yPos);
    doc.text(`R$ ${data.valorFrete.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += 6;
  }

  // Total destacado
  doc.setFillColor(...corDestaque);
  doc.roundedRect(pageWidth - margin - 60, yPos - 2, 58, 10, 1, 1, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - margin - 55, yPos + 5);
  doc.text(`R$ ${data.valorTotal.toFixed(2)}`, pageWidth - margin - 2, yPos + 5, { align: 'right' });
  
  yPos += 18;

  // ===== INFORMAÇÕES ADICIONAIS =====
  if (data.prazoEntrega) {
    doc.setTextColor(...corTexto);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Prazo de Entrega:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(data.prazoEntrega, margin + 35, yPos);
    yPos += 8;
  }

  if (data.observacoes) {
    doc.setFont('helvetica', 'bold');
    doc.text('Observações:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const obsLines = doc.splitTextToSize(data.observacoes, pageWidth - 2 * margin);
    doc.text(obsLines, margin, yPos);
    yPos += obsLines.length * 5 + 5;
  }

  // ===== DADOS BANCÁRIOS =====
  yPos += 5;
  doc.setFillColor(...corCinzaClaro);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 40, 2, 2, 'F');
  
  doc.setTextColor(...corPrimaria);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS PARA PAGAMENTO', margin + 5, yPos + 7);
  
  doc.setTextColor(...corTexto);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  let pagY = yPos + 14;
  doc.text('Banco: 336 – Banco C6 S.A.', margin + 5, pagY);
  pagY += 5;
  doc.text('Agência: 0001 | Conta Corrente: 40017048-5', margin + 5, pagY);
  pagY += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('Chave PIX (CNPJ): 62.440.010/0001-03', margin + 5, pagY);
  doc.setFont('helvetica', 'normal');
  pagY += 5;
  doc.text('Titular: José Márcio Kuster de Azevedo', margin + 5, pagY);

  // QR Code PIX (tentar carregar)
  try {
    const qrCodeImg = await loadImage('/qrcode_pix.png');
    doc.addImage(qrCodeImg, 'PNG', pageWidth - margin - 35, yPos + 5, 30, 30);
  } catch (error) {
    console.warn('QR Code não carregado');
  }

  yPos += 48;

  // ===== RODAPÉ =====
  // Se estiver muito perto do fim da página, adicionar nova página
  if (yPos > pageHeight - 40) {
    doc.addPage();
    yPos = margin;
  }

  // Validade
  doc.setFillColor(255, 255, 200);
  doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 10, 1, 1, 'F');
  doc.setTextColor(...corTexto);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('⚠ Este orçamento é válido por 7 dias a partir da data de emissão.', margin + 3, yPos + 6);
  
  yPos += 15;

  // Linha separadora
  doc.setDrawColor(...corPrimaria);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Informações da empresa no rodapé
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('3DKPRINT – Impressão 3D Profissional | CNPJ: 62.440.010/0001-03', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('Rua Santo Antonio, Vila Santana, Jacarezinho - PR', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.text('Tel.: (43) 9174-1518 | Email: 3dk.print.br@gmail.com', pageWidth / 2, yPos, { align: 'center' });
  yPos += 4;
  doc.setTextColor(...corPrimaria);
  doc.setFont('helvetica', 'bold');
  doc.text('www.3dkprint.com.br', pageWidth / 2, yPos, { align: 'center' });

  // Retornar o PDF como Blob
  return doc.output('blob');
}

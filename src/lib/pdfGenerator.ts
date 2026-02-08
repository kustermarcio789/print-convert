import { jsPDF } from 'jspdf';

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

export async function gerarPDFOrcamento(data: OrcamentoData): Promise<Blob> {
  const doc = new jsPDF();
  
  // Configurações
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Cabeçalho com logo e dados da empresa
  try {
    const logoImg = await loadImage('/logo.png');
    doc.addImage(logoImg, 'PNG', margin, yPos, 40, 15);
  } catch (error) {
    console.error('Erro ao carregar logo:', error);
  }

  // Dados da empresa (lado direito)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3DKPRINT – Impressão 3D Profissional', pageWidth - margin, yPos, { align: 'right' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPos += 5;
  doc.text('3DKPRINT – José Márcio Kuster de Azevedo', pageWidth - margin, yPos, { align: 'right' });
  yPos += 4;
  doc.text('Tel.: (43) 9174-1518', pageWidth - margin, yPos, { align: 'right' });
  yPos += 4;
  doc.text('Email: 3dk.print.br@gmail.com', pageWidth - margin, yPos, { align: 'right' });

  yPos = margin + 20;

  // Linha separadora
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Título do documento
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ORÇAMENTO', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${data.id}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text(`Data: ${data.data}`, pageWidth / 2, yPos, { align: 'center' });
  if (data.status) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text(`Status: ${data.status.toUpperCase()}`, pageWidth / 2, yPos, { align: 'center' });
  }
  yPos += 12;

  // Dados do cliente
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS DO CLIENTE', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Nome ou Razão Social
  if (data.cliente.razaoSocial) {
    doc.text(`Nome: ${data.cliente.razaoSocial}`, margin, yPos);
  } else {
    doc.text(`Nome: ${data.cliente.nome}`, margin, yPos);
  }
  yPos += 5;

  // CPF ou CNPJ
  if (data.cliente.cnpj) {
    doc.text(`CNPJ/CPF: ${data.cliente.cnpj}`, margin, yPos);
    yPos += 5;
    if (data.cliente.inscricaoEstadual) {
      doc.text(`Inscrição Estadual: ${data.cliente.inscricaoEstadual}`, margin, yPos);
      yPos += 5;
    }
  } else if (data.cliente.cpf) {
    doc.text(`CNPJ/CPF: ${data.cliente.cpf}`, margin, yPos);
    yPos += 5;
    if (data.cliente.rg) {
      doc.text(`RG: ${data.cliente.rg}`, margin, yPos);
      yPos += 5;
    }
  }

  // Endereço completo
  if (data.cliente.endereco) {
    const enderecoCompleto = [
      data.cliente.endereco,
      data.cliente.numero && `${data.cliente.numero}`,
      data.cliente.complemento
    ].filter(Boolean).join(', ');
    
    doc.text(`Endereço: ${enderecoCompleto}`, margin, yPos);
    yPos += 5;
    
    if (data.cliente.bairro) {
      doc.text(`Bairro: ${data.cliente.bairro}`, margin, yPos);
      yPos += 5;
    }
    
    if (data.cliente.cidade && data.cliente.estado) {
      const cidadeEstado = `${data.cliente.cidade} - ${data.cliente.estado}`;
      doc.text(`Cidade/UF: ${cidadeEstado}`, margin, yPos);
      yPos += 5;
    }
    
    if (data.cliente.cep) {
      doc.text(`CEP: ${data.cliente.cep}`, margin, yPos);
      yPos += 5;
    }
  }

  // Contato
  doc.text(`Tel.: ${data.cliente.telefone}`, margin, yPos);
  yPos += 5;
  doc.text(`Email: ${data.cliente.email}`, margin, yPos);
  yPos += 12;

  // Itens do orçamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ITENS DO ORÇAMENTO', margin, yPos);
  yPos += 7;

  // Cabeçalho da tabela de itens
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, yPos, pageWidth - 2 * margin, 8, 'F');
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('PRODUTO', margin + 2, yPos + 5);
  doc.text('QTD', pageWidth - margin - 70, yPos + 5);
  doc.text('VLR UNIT.', pageWidth - margin - 50, yPos + 5);
  doc.text('TOTAL', pageWidth - margin - 25, yPos + 5, { align: 'right' });
  yPos += 10;

  // Linhas dos itens
  doc.setFont('helvetica', 'normal');
  data.itens.forEach((item) => {
    // Verificar se precisa de nova página
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = margin;
    }

    const descLines = doc.splitTextToSize(item.descricao, 90);
    doc.text(descLines, margin + 2, yPos);
    doc.text(item.quantidade.toString(), pageWidth - margin - 70, yPos);
    doc.text(`R$ ${item.valorUnitario.toFixed(2)}`, pageWidth - margin - 50, yPos);
    doc.text(`R$ ${item.valorTotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
    yPos += Math.max(descLines.length * 5, 6);
  });

  yPos += 5;

  // Linha separadora
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 7;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', pageWidth - margin - 50, yPos);
  doc.text(`R$ ${data.subtotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 10;

  // Total em destaque
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', pageWidth - margin - 50, yPos);
  doc.text(`R$ ${data.valorTotal.toFixed(2)}`, pageWidth - margin - 2, yPos, { align: 'right' });
  yPos += 15;

  // Verificar se precisa de nova página
  if (yPos > pageHeight - 100) {
    doc.addPage();
    yPos = margin;
  }

  // Dados para pagamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DADOS PARA PAGAMENTO', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PIX, transferência bancária ou cartão.', margin, yPos);
  yPos += 6;
  doc.text('Chave PIX (CNPJ): 62.440.010/0001-03', margin, yPos);
  yPos += 5;
  doc.text('Titular: José Márcio Kuster de Azevedo', margin, yPos);
  yPos += 15;

  // Validade do orçamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('VALIDADE DO ORÇAMENTO', margin, yPos);
  yPos += 7;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Este orçamento é válido por 7 dias a partir da data de emissão.', margin, yPos);
  yPos += 10;

  // Observações
  if (data.observacoes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const obsLines = doc.splitTextToSize(data.observacoes, pageWidth - 2 * margin);
    doc.text(obsLines, margin, yPos);
    yPos += obsLines.length * 5 + 10;
  }

  // Rodapé em todas as páginas
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = pageHeight - 15;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.text(
      '3DKPRINT – Impressão 3D Profissional | CNPJ: 62.440.010/0001-03',
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    doc.text(
      'Rua Santo Antonio, Vila Santana, Jacarezinho - PR',
      pageWidth / 2,
      footerY + 4,
      { align: 'center' }
    );
    
    doc.text(
      'Tel.: (43) 9174-1518 | Email: 3dk.print.br@gmail.com',
      pageWidth / 2,
      footerY + 8,
      { align: 'center' }
    );
  }

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

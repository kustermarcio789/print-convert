import jsPDF from 'jspdf';

interface DadosRelatorioGeral {
  vendas: {
    totalMes: number;
    quantidadeMes: number;
    ticketMedio: number;
    crescimentoMensal: number;
  };
  producao: {
    pecasProduzidas: number;
    materialConsumido: number;
    custoProducao: number;
    eficiencia: number;
  };
  orcamentos: {
    total: number;
    pendentes: number;
    aprovados: number;
    taxaConversao: number;
  };
}

interface DadosRelatorioVendas {
  faturamentoTotal: number;
  quantidadeVendas: number;
  ticketMedio: number;
  crescimento: number;
  metaMensal: number;
  percentualMeta: number;
  vendasPorCategoria: Array<{
    categoria: string;
    valor: number;
    quantidade: number;
    percentual: number;
  }>;
  topClientes: Array<{
    nome: string;
    totalCompras: number;
    quantidadeCompras: number;
  }>;
}

interface DadosRelatorioProducao {
  pecasProduzidas: number;
  materialConsumido: number;
  custoTotal: number;
  custoMedioPeca: number;
  eficiencia: number;
  desperdicio: number;
  consumoPorMaterial: Array<{
    material: string;
    quantidadeConsumida: number;
    custo: number;
    pecasProduzidas: number;
  }>;
}

export const exportarRelatorioGeralPDF = (dados: DadosRelatorioGeral) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138); // Azul escuro
  doc.text('3DKPRINT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(16);
  doc.text('Relatório Gerencial', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Seção de Vendas
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Desempenho de Vendas', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Faturamento Mensal: R$ ${dados.vendas.totalMes.toFixed(2)}`, 25, yPos);
  yPos += 6;
  doc.text(`Quantidade de Vendas: ${dados.vendas.quantidadeMes}`, 25, yPos);
  yPos += 6;
  doc.text(`Ticket Médio: R$ ${dados.vendas.ticketMedio.toFixed(2)}`, 25, yPos);
  yPos += 6;
  doc.text(`Crescimento: ${dados.vendas.crescimentoMensal.toFixed(1)}%`, 25, yPos);
  yPos += 12;

  // Seção de Produção
  doc.setFontSize(14);
  doc.text('Eficiência Operacional', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Peças Produzidas: ${dados.producao.pecasProduzidas}`, 25, yPos);
  yPos += 6;
  doc.text(`Material Consumido: ${(dados.producao.materialConsumido / 1000).toFixed(2)}kg`, 25, yPos);
  yPos += 6;
  doc.text(`Custo de Produção: R$ ${dados.producao.custoProducao.toFixed(2)}`, 25, yPos);
  yPos += 6;
  doc.text(`Eficiência: ${dados.producao.eficiencia.toFixed(1)}%`, 25, yPos);
  yPos += 12;

  // Seção de Orçamentos
  doc.setFontSize(14);
  doc.text('Análise de Orçamentos', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Total de Orçamentos: ${dados.orcamentos.total}`, 25, yPos);
  yPos += 6;
  doc.text(`Pendentes: ${dados.orcamentos.pendentes}`, 25, yPos);
  yPos += 6;
  doc.text(`Aprovados: ${dados.orcamentos.aprovados}`, 25, yPos);
  yPos += 6;
  doc.text(`Taxa de Conversão: ${dados.orcamentos.taxaConversao.toFixed(1)}%`, 25, yPos);
  yPos += 15;

  // Rodapé
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('3DKPRINT - Impressão 3D Profissional', pageWidth / 2, 280, { align: 'center' });
  doc.text('www.3dkprint.com.br', pageWidth / 2, 285, { align: 'center' });

  // Salvar PDF
  doc.save(`relatorio-geral-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportarRelatorioVendasPDF = (dados: DadosRelatorioVendas) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text('3DKPRINT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(16);
  doc.text('Relatório de Vendas', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Métricas Principais
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Métricas Principais', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Faturamento Total: R$ ${dados.faturamentoTotal.toFixed(2)}`, 25, yPos);
  yPos += 6;
  doc.text(`Quantidade de Vendas: ${dados.quantidadeVendas}`, 25, yPos);
  yPos += 6;
  doc.text(`Ticket Médio: R$ ${dados.ticketMedio.toFixed(2)}`, 25, yPos);
  yPos += 6;
  doc.text(`Crescimento: ${dados.crescimento.toFixed(1)}%`, 25, yPos);
  yPos += 6;
  doc.text(`Meta Mensal: R$ ${dados.metaMensal.toFixed(2)} (${dados.percentualMeta.toFixed(1)}% atingido)`, 25, yPos);
  yPos += 12;

  // Vendas por Categoria
  if (dados.vendasPorCategoria.length > 0) {
    doc.setFontSize(14);
    doc.text('Vendas por Categoria', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    dados.vendasPorCategoria.forEach((cat) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${cat.categoria}: R$ ${cat.valor.toFixed(2)} (${cat.quantidade} vendas - ${cat.percentual.toFixed(1)}%)`, 25, yPos);
      yPos += 6;
    });
    yPos += 6;
  }

  // Top Clientes
  if (dados.topClientes.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Top 5 Clientes', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    dados.topClientes.forEach((cliente, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${index + 1}. ${cliente.nome}: R$ ${cliente.totalCompras.toFixed(2)} (${cliente.quantidadeCompras} compras)`, 25, yPos);
      yPos += 6;
    });
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('3DKPRINT - Impressão 3D Profissional', pageWidth / 2, 280, { align: 'center' });
    doc.text('www.3dkprint.com.br', pageWidth / 2, 285, { align: 'center' });
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, 285, { align: 'right' });
  }

  doc.save(`relatorio-vendas-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportarRelatorioProducaoPDF = (dados: DadosRelatorioProducao) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Cabeçalho
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138);
  doc.text('3DKPRINT', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(16);
  doc.text('Relatório de Produção', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 15;

  // Métricas Principais
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Métricas de Produção', 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Peças Produzidas: ${dados.pecasProduzidas}`, 25, yPos);
  yPos += 6;
  doc.text(`Material Consumido: ${(dados.materialConsumido / 1000).toFixed(2)}kg`, 25, yPos);
  yPos += 6;
  doc.text(`Custo Total: R$ ${dados.custoTotal.toFixed(2)}`, 25, yPos);
  yPos += 6;
  doc.text(`Custo Médio por Peça: R$ ${dados.custoMedioPeca.toFixed(2)}`, 25, yPos);
  yPos += 6;
  doc.text(`Eficiência: ${dados.eficiencia.toFixed(1)}%`, 25, yPos);
  yPos += 6;
  doc.text(`Desperdício: ${(dados.desperdicio / 1000).toFixed(2)}kg`, 25, yPos);
  yPos += 12;

  // Consumo por Material
  if (dados.consumoPorMaterial.length > 0) {
    doc.setFontSize(14);
    doc.text('Consumo por Material', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    dados.consumoPorMaterial.forEach((mat) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`${mat.material}:`, 25, yPos);
      yPos += 6;
      doc.text(`  Consumido: ${(mat.quantidadeConsumida / 1000).toFixed(2)}kg`, 30, yPos);
      yPos += 6;
      doc.text(`  Custo: R$ ${mat.custo.toFixed(2)}`, 30, yPos);
      yPos += 6;
      doc.text(`  Peças: ${mat.pecasProduzidas}`, 30, yPos);
      yPos += 8;
    });
  }

  // Rodapé
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('3DKPRINT - Impressão 3D Profissional', pageWidth / 2, 280, { align: 'center' });
    doc.text('www.3dkprint.com.br', pageWidth / 2, 285, { align: 'center' });
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, 285, { align: 'right' });
  }

  doc.save(`relatorio-producao-${new Date().toISOString().split('T')[0]}.pdf`);
};

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Calculator, Check, Mail, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrcamentos } from '@/lib/dataStore';
import { gerarPDFOrcamento } from '@/lib/pdfGenerator';
import CalculadoraResina from '@/components/CalculadoraResina';
import CalculadoraFilamento from '@/components/CalculadoraFilamento';
import type { ResultadoCalculo } from '@/components/CalculadoraResina';
import type { ResultadoCalculoFilamento } from '@/components/CalculadoraFilamento';

interface Orcamento {
  id: string;
  tipo: 'impressao' | 'modelagem' | 'pintura' | 'manutencao';
  cliente: string;
  email: string;
  telefone: string;
  data: string;
  status: 'pendente' | 'aprovado' | 'recusado';
  valor?: number;
  detalhes: any;
}

export default function AdminOrcamentoDetalhes() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [orcamento, setOrcamento] = useState<Orcamento | null>(null);
  const [valorServico, setValorServico] = useState<number>(0);
  const [valorFrete, setValorFrete] = useState<number>(0);
  const [prazoEntrega, setPrazoEntrega] = useState<string>('');
  const [observacoes, setObservacoes] = useState<string>('');
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [tipoImpressao, setTipoImpressao] = useState<'resina' | 'filamento'>('resina');

  useEffect(() => {
    if (id) {
      const orcamentos = getOrcamentos();
      const orc = orcamentos.find(o => o.id === id);
      if (orc) {
        setOrcamento(orc);
        setValorServico(orc.valor || 0);
      }
    }
  }, [id]);

  const handleCalculoResinaCompleto = (resultado: ResultadoCalculo) => {
    setValorServico(resultado.precoVenda);
  };

  const handleCalculoFilamentoCompleto = (resultado: ResultadoCalculoFilamento) => {
    setValorServico(resultado.precoVenda);
  };

  const handleAprovarOrcamento = () => {
    if (!orcamento) return;
    
    const orcamentos = getOrcamentos();
    const updated = orcamentos.map(o => 
      o.id === orcamento.id ? { ...o, status: 'aprovado' as const } : o
    );
    localStorage.setItem('orcamentos', JSON.stringify(updated));
    setOrcamento({ ...orcamento, status: 'aprovado' });
    alert('Orçamento aprovado com sucesso!');
  };

  const handleEnviarEmail = async () => {
    if (!orcamento) return;
    
    // Gerar PDF primeiro
    try {
      const pdfBlob = await gerarPDFOrcamento({
        id: orcamento.id,
        cliente: {
          nome: orcamento.cliente,
          email: orcamento.email,
          telefone: orcamento.telefone,
        },
        tipo: getTipoLabel(orcamento.tipo),
        itens: [
          {
            descricao: getTipoLabel(orcamento.tipo),
            quantidade: 1,
            valorUnitario: valorServico,
            valorTotal: valorServico,
          }
        ],
        subtotal: valorServico,
        valorFrete,
        valorTotal: valorServico + valorFrete,
        data: new Date(orcamento.data).toLocaleDateString('pt-BR'),
        prazoEntrega,
        observacoes,
      });
      
      // Simular envio de email (em produção, integrar com serviço de email)
      alert(`Email enviado para ${orcamento.email} com o orçamento em anexo!\n\nEm produção, isso será integrado com um serviço de email real.`);
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alert('Erro ao enviar email.');
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!orcamento) return;
    
    const mensagem = `Olá ${orcamento.cliente}!\n\nSegue o orçamento ${orcamento.id}:\n\n` +
      `Serviço: ${getTipoLabel(orcamento.tipo)}\n` +
      `Valor: R$ ${(valorServico + valorFrete).toFixed(2)}\n` +
      `Prazo: ${prazoEntrega || 'A definir'}\n\n` +
      `Acesse o orçamento completo em:\nhttps://www.3dkprint.com.br/admin/orcamentos/${orcamento.id}\n\n` +
      `Qualquer dúvida, estou à disposição!`;
    
    const telefone = orcamento.telefone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleGerarPDF = async () => {
    if (!orcamento) return;

    setGerandoPDF(true);
    try {
      const pdfBlob = await gerarPDFOrcamento({
        id: orcamento.id,
        cliente: {
          nome: orcamento.cliente,
          email: orcamento.email,
          telefone: orcamento.telefone,
        },
        tipo: getTipoLabel(orcamento.tipo),
        itens: [
          {
            descricao: getTipoLabel(orcamento.tipo),
            quantidade: 1,
            valorUnitario: valorServico,
            valorTotal: valorServico,
          }
        ],
        subtotal: valorServico,
        valorFrete,
        valorTotal: valorServico + valorFrete,
        data: new Date(orcamento.data).toLocaleDateString('pt-BR'),
        prazoEntrega,
        observacoes,
      });

      // Download do PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orcamento_${orcamento.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
    } finally {
      setGerandoPDF(false);
    }
  };

  const getTipoLabel = (tipo: string): string => {
    const labels: Record<string, string> = {
      impressao: 'Impressão 3D',
      modelagem: 'Modelagem 3D',
      pintura: 'Pintura Premium',
      manutencao: 'Manutenção',
    };
    return labels[tipo] || tipo;
  };

  if (!orcamento) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/orcamentos')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <p className="text-center text-muted-foreground">Orçamento não encontrado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/orcamentos')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Detalhes do Orçamento</h1>
              <p className="text-muted-foreground">ID: {orcamento.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {/* Botão Aprovar */}
            <Button
              onClick={handleAprovarOrcamento}
              disabled={orcamento.status === 'aprovado'}
              variant={orcamento.status === 'aprovado' ? 'default' : 'outline'}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              {orcamento.status === 'aprovado' ? 'Aprovado' : 'Aprovar Orçamento'}
            </Button>
            
            {/* Botão Enviar Email */}
            <Button
              onClick={handleEnviarEmail}
              variant="outline"
              className="gap-2"
            >
              <Mail className="w-4 h-4" />
              Enviar Email
            </Button>
            
            {/* Botão WhatsApp */}
            <Button
              onClick={handleEnviarWhatsApp}
              variant="outline"
              className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
            >
              <MessageCircle className="w-4 h-4" />
              Enviar WhatsApp
            </Button>
            
            {/* Botão Gerar/Salvar PDF */}
            <Button
              onClick={handleGerarPDF}
              disabled={gerandoPDF}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {gerandoPDF ? 'Gerando...' : 'Salvar PDF'}
            </Button>
          </div>
        </div>

        {/* Informações do Cliente */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Nome</label>
                <p className="text-lg">{orcamento.cliente}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Email</label>
                <p className="text-lg">{orcamento.email}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Telefone</label>
                <p className="text-lg">{orcamento.telefone}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Data</label>
                <p className="text-lg">{new Date(orcamento.data).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Tipo de Serviço</label>
                <p className="text-lg">{getTipoLabel(orcamento.tipo)}</p>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground">Status</label>
                <p className="text-lg capitalize">{orcamento.status}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculadora baseada no tipo */}
        {orcamento.tipo === 'impressao' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculadora de Custos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-muted-foreground mb-2">
                  Tipo de Impressão
                </label>
                <select 
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  value={tipoImpressao}
                  onChange={(e) => setTipoImpressao(e.target.value as 'resina' | 'filamento')}
                >
                  <option value="resina">Resina</option>
                  <option value="filamento">Filamento</option>
                </select>
              </div>
              
              {/* Alternar entre calculadoras baseado na seleção */}
              {tipoImpressao === 'resina' ? (
                <CalculadoraResina onCalculoCompleto={handleCalculoResinaCompleto} />
              ) : (
                <CalculadoraFilamento onCalculoCompleto={handleCalculoFilamentoCompleto} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Valores e Informações Adicionais */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Valores e Informações do Orçamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1">
                  Valor do Serviço (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorServico}
                  onChange={(e) => setValorServico(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1">
                  Valor do Frete (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={valorFrete}
                  onChange={(e) => setValorFrete(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1">
                  Prazo de Entrega
                </label>
                <input
                  type="text"
                  value={prazoEntrega}
                  onChange={(e) => setPrazoEntrega(e.target.value)}
                  placeholder="Ex: 5 dias úteis"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1">
                  Observações
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais sobre o orçamento..."
                  rows={4}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Valor Total:</span>
                  <span className="text-green-600">
                    R$ {(valorServico + valorFrete).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes Técnicos */}
        <Card>
          <CardHeader>
            <CardTitle>Detalhes Técnicos do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Informações do Pedido */}
              <div className="grid grid-cols-2 gap-4">
                {orcamento.detalhes.material && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Material</label>
                    <p className="text-gray-900">{orcamento.detalhes.material}</p>
                  </div>
                )}
                {orcamento.detalhes.cor && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Cor</label>
                    <p className="text-gray-900">{orcamento.detalhes.cor}</p>
                  </div>
                )}
                {orcamento.detalhes.quantidade && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Quantidade</label>
                    <p className="text-gray-900">{orcamento.detalhes.quantidade}</p>
                  </div>
                )}
                {orcamento.detalhes.infill && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preenchimento</label>
                    <p className="text-gray-900">{orcamento.detalhes.infill}</p>
                  </div>
                )}
              </div>

              {/* Arquivo 3D */}
              {orcamento.detalhes.arquivo && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Arquivo 3D</label>
                  <div className="flex items-center gap-4">
                    {/* Preview da imagem se for imagem */}
                    {orcamento.detalhes.arquivo.startsWith('data:image') && (
                      <img 
                        src={orcamento.detalhes.arquivo} 
                        alt="Preview" 
                        className="w-48 h-48 object-contain border rounded-lg"
                      />
                    )}
                    
                    {/* Botão de download */}
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = orcamento.detalhes.arquivo;
                        link.download = `arquivo_${orcamento.id}.${orcamento.detalhes.arquivo.includes('stl') ? 'stl' : 'obj'}`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Baixar Arquivo
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Nome: {orcamento.detalhes.nomeArquivo || 'arquivo_3d'}
                  </p>
                </div>
              )}

              {/* Mostrar JSON completo em modo colapsado */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Ver dados técnicos completos (JSON)
                </summary>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm mt-2">
                  {JSON.stringify(orcamento.detalhes, null, 2)}
                </pre>
              </details>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

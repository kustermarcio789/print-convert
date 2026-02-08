import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Calculator } from 'lucide-react';
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
          <Button
            onClick={handleGerarPDF}
            disabled={gerandoPDF}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {gerandoPDF ? 'Gerando PDF...' : 'Gerar PDF'}
          </Button>
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
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(orcamento.detalhes, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

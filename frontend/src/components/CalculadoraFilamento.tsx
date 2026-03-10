import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';

interface CalculadoraFilamentoProps {
  onCalculoCompleto?: (resultado: ResultadoCalculoFilamento) => void;
}

export interface ResultadoCalculoFilamento {
  custoMaterial: number;
  custoEnergia: number;
  custoManutencao: number;
  custoMaquina: number;
  custoFalha: number;
  custoAcabamento: number;
  custoTotal: number;
  precoVenda: number;
  pesoGramas: number;
}

const materiais = [
  { value: 'abs', label: 'ABS', densidade: 1.04 },
  { value: 'abs_cf', label: 'ABS CF', densidade: 1.10 },
  { value: 'pla', label: 'PLA', densidade: 1.24 },
  { value: 'pla_wood', label: 'PLA Wood', densidade: 1.20 },
  { value: 'pla_cf', label: 'PLA CF', densidade: 1.25 },
  { value: 'petg', label: 'PETG', densidade: 1.27 },
  { value: 'petg_cf', label: 'PETG CF', densidade: 1.29 },
  { value: 'pet_cf', label: 'PET CF', densidade: 1.35 },
  { value: 'nylon', label: 'Nylon', densidade: 1.15 },
  { value: 'pa', label: 'PA', densidade: 1.15 },
  { value: 'pc', label: 'PC', densidade: 1.20 },
  { value: 'pa_cf', label: 'PA CF', densidade: 1.18 },
  { value: 'tpu', label: 'TPU', densidade: 1.21 },
];

export default function CalculadoraFilamento({ onCalculoCompleto }: CalculadoraFilamentoProps) {
  // Material
  const [materialSelecionado, setMaterialSelecionado] = useState<string>('pla');
  const [precoKg, setPrecoKg] = useState<number>(0);
  const [densidade, setDensidade] = useState<number>(1.24);
  
  // Peça
  const [pesoGramas, setPesoGramas] = useState<number>(0);
  const [tempoMinutos, setTempoMinutos] = useState<number>(0);

  // ROI (Custo de Máquina)
  const [valorMaquina, setValorMaquina] = useState<number>(3000);
  const [mesesPagar, setMesesPagar] = useState<number>(12);
  const [diasUso, setDiasUso] = useState<number>(25);
  const [horasUso, setHorasUso] = useState<number>(8);

  // Energia & Taxas
  const [custoKwh, setCustoKwh] = useState<number>(0.60);
  const [potenciaWatts, setPotenciaWatts] = useState<number>(360);
  const [manutencaoPct, setManutencaoPct] = useState<number>(10);
  const [falhasPct, setFalhasPct] = useState<number>(10);
  const [acabamentoPct, setAcabamentoPct] = useState<number>(10);
  const [fixacao, setFixacao] = useState<number>(0.20);
  const [lucroPct, setLucroPct] = useState<number>(200);

  // Resultados
  const [resultado, setResultado] = useState<ResultadoCalculoFilamento>({
    custoMaterial: 0,
    custoEnergia: 0,
    custoManutencao: 0,
    custoMaquina: 0,
    custoFalha: 0,
    custoAcabamento: 0,
    custoTotal: 0,
    precoVenda: 0,
    pesoGramas: 0
  });

  const [depreciacaoHora, setDepreciacaoHora] = useState<number>(0);

  useEffect(() => {
    calcular();
  }, [
    materialSelecionado, precoKg, densidade, pesoGramas, tempoMinutos,
    valorMaquina, mesesPagar, diasUso, horasUso,
    custoKwh, potenciaWatts, manutencaoPct, falhasPct, acabamentoPct, fixacao, lucroPct
  ]);

  const handleMaterialChange = (value: string) => {
    setMaterialSelecionado(value);
    const material = materiais.find(m => m.value === value);
    if (material) {
      setDensidade(material.densidade);
    }
  };

  const calcular = () => {
    // Calcular depreciação por hora (ROI)
    const horasTotaisVidaUtil = mesesPagar * diasUso * horasUso;
    const depHora = horasTotaisVidaUtil > 0 ? valorMaquina / horasTotaisVidaUtil : 0;
    setDepreciacaoHora(depHora);

    // Custos base
    const custoMat = (pesoGramas / 1000) * precoKg;
    const tempoHoras = tempoMinutos / 60;
    const custoEnergia = (potenciaWatts / 1000) * tempoHoras * custoKwh;

    // Manutenção baseada em Material + Energia
    const custoManutencao = (custoMat + custoEnergia) * (manutencaoPct / 100);

    // Custo da máquina
    const custoMaquina = depHora * tempoHoras;

    // Taxa de falha
    const custoFalha = custoMat * (falhasPct / 100);

    // Acabamento
    const custoAcabamento = custoMat * (acabamentoPct / 100);

    // Total
    const custoTotal = custoMat + custoEnergia + custoManutencao + custoMaquina + custoFalha + custoAcabamento + fixacao;
    const precoVenda = custoTotal * (1 + lucroPct / 100);

    const novoResultado = {
      custoMaterial: custoMat,
      custoEnergia,
      custoManutencao,
      custoMaquina,
      custoFalha,
      custoAcabamento: custoAcabamento + fixacao,
      custoTotal,
      precoVenda,
      pesoGramas
    };

    setResultado(novoResultado);

    if (onCalculoCompleto) {
      onCalculoCompleto(novoResultado);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Calculadora 3D Pro - Filamento</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda - Configurações */}
        <div className="space-y-6">
          {/* Configuração da Impressão */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-blue-600">⚙️ Configuração da Impressão</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Material</label>
                <select
                  value={materialSelecionado}
                  onChange={(e) => handleMaterialChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {materiais.map(mat => (
                    <option key={mat.value} value={mat.value}>{mat.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Preço/kg (R$)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={precoKg}
                    onChange={(e) => setPrecoKg(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Densidade (g/cm³)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={densidade}
                    onChange={(e) => setDensidade(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-blue-600 font-semibold mb-1">⚖️ Peso da Peça (gramas)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pesoGramas}
                  onChange={(e) => setPesoGramas(Number(e.target.value))}
                  className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Tempo (minutos)</label>
                <input
                  type="number"
                  min="0"
                  value={tempoMinutos}
                  onChange={(e) => setTempoMinutos(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Custo de Máquina (ROI) */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">🏗️ Custo de Máquina (ROI)</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Valor Máquina (R$)</label>
                <input
                  type="number"
                  min="0"
                  value={valorMaquina}
                  onChange={(e) => setValorMaquina(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Pagar em (Meses)</label>
                <input
                  type="number"
                  min="1"
                  value={mesesPagar}
                  onChange={(e) => setMesesPagar(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dias Uso/Mês</label>
                <input
                  type="number"
                  min="1"
                  value={diasUso}
                  onChange={(e) => setDiasUso(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Horas Uso/Dia</label>
                <input
                  type="number"
                  min="1"
                  value={horasUso}
                  onChange={(e) => setHorasUso(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <label className="block text-sm text-green-700 font-semibold mb-1">
                Depreciação Calculada (R$/Hora)
              </label>
              <input
                type="text"
                value={depreciacaoHora.toFixed(2)}
                className="w-full px-3 py-2 bg-gray-100 border rounded-lg"
                readOnly
              />
            </div>
          </div>

          {/* Energia & Taxas */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">⚡ Energia & Taxas</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Custo KWh (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={custoKwh}
                  onChange={(e) => setCustoKwh(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Potência (Watts)</label>
                <input
                  type="number"
                  min="0"
                  value={potenciaWatts}
                  onChange={(e) => setPotenciaWatts(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Manutenção (%)</label>
                <input
                  type="number"
                  min="0"
                  value={manutencaoPct}
                  onChange={(e) => setManutencaoPct(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <small className="text-xs text-gray-500">(Baseado em Mat. + Energia)</small>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Falhas (%)</label>
                <input
                  type="number"
                  min="0"
                  value={falhasPct}
                  onChange={(e) => setFalhasPct(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Acabamento (%)</label>
                <input
                  type="number"
                  min="0"
                  value={acabamentoPct}
                  onChange={(e) => setAcabamentoPct(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Fixação (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={fixacao}
                  onChange={(e) => setFixacao(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Lucro Desejado (%)</label>
              <input
                type="number"
                min="0"
                value={lucroPct}
                onChange={(e) => setLucroPct(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="space-y-6">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-3">📊 Resultado Financeiro</h3>
            
            <div className="bg-blue-50 p-6 rounded-lg text-center mb-4">
              <small className="text-gray-600 block mb-2">Preço Sugerido de Venda</small>
              <span className="text-4xl font-bold text-blue-600 block">
                R$ {resultado.precoVenda.toFixed(2)}
              </span>
              <hr className="my-3 border-gray-300" />
              <small className="text-gray-600 block mb-1">Custo Total de Produção</small>
              <span className="text-xl font-bold text-red-600">
                R$ {resultado.custoTotal.toFixed(2)}
              </span>
            </div>

            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b">
                  <td className="py-2">📦 Peso Informado</td>
                  <td className="py-2 text-right font-semibold">{resultado.pesoGramas.toFixed(2)} g</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">🧵 Custo Material</td>
                  <td className="py-2 text-right font-semibold">R$ {resultado.custoMaterial.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">⚡ Custo Energia</td>
                  <td className="py-2 text-right font-semibold">R$ {resultado.custoEnergia.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">🛠️ Manutenção ({manutencaoPct}%)</td>
                  <td className="py-2 text-right font-semibold">R$ {resultado.custoManutencao.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">🏚️ Custo Máquina (Depreciação)</td>
                  <td className="py-2 text-right font-semibold">R$ {resultado.custoMaquina.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">⚠️ Taxa de Risco/Falha</td>
                  <td className="py-2 text-right font-semibold">R$ {resultado.custoFalha.toFixed(2)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">✨ Acabamento + Fixação</td>
                  <td className="py-2 text-right font-semibold">R$ {resultado.custoAcabamento.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4 text-xs text-gray-500 text-center">
              A Manutenção é calculada como % sobre a soma de Material + Energia.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

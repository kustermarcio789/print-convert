import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign } from 'lucide-react';

interface CalculadoraResinaProps {
  onCalculoCompleto?: (resultado: ResultadoCalculo) => void;
}

export interface ResultadoCalculo {
  totalResina: number;
  totalEnergia: number;
  custoMaquina: number;
  custoLiquido: number;
  precoVenda: number;
  margemLucro: number;
}

export default function CalculadoraResina({ onCalculoCompleto }: CalculadoraResinaProps) {
  // Tempo de impressão
  const [horas, setHoras] = useState<number>(0);
  const [minutos, setMinutos] = useState<number>(0);
  const [segundos, setSegundos] = useState<number>(0);

  // Quantidade de resina
  const [valorResinaLitro, setValorResinaLitro] = useState<number>(0);
  const [quantidadeML, setQuantidadeML] = useState<number>(0);

  // Custo máquina
  const [valorMaquinario, setValorMaquinario] = useState<number>(2000);
  const [vidaUtil, setVidaUtil] = useState<number>(2000);
  const [consumoWatts, setConsumoWatts] = useState<number>(72);

  // Custos extras
  const [custoLimpeza, setCustoLimpeza] = useState<number>(0);

  // Energia
  const [custoKwh, setCustoKwh] = useState<number>(0.89);

  // Margem de lucro
  const [margemLucro, setMargemLucro] = useState<number>(40);

  // Resultados
  const [resultado, setResultado] = useState<ResultadoCalculo>({
    totalResina: 0,
    totalEnergia: 0,
    custoMaquina: 0,
    custoLiquido: 0,
    precoVenda: 0,
    margemLucro: 40
  });

  useEffect(() => {
    calcular();
  }, [
    horas, minutos, segundos,
    valorResinaLitro, quantidadeML,
    valorMaquinario, vidaUtil, consumoWatts,
    custoLimpeza, custoKwh, margemLucro
  ]);

  const calcular = () => {
    // Converter tempo total para horas
    const tempoTotalHoras = horas + (minutos / 60) + (segundos / 3600);

    // Calcular total de resina
    const totalResina = (valorResinaLitro * quantidadeML) / 1000;

    // Calcular total de energia
    const totalEnergia = (tempoTotalHoras * consumoWatts * custoKwh) / 1000;

    // Calcular custo da máquina
    const custoMaquinaPorHora = valorMaquinario / vidaUtil;
    const custoMaquina = custoMaquinaPorHora * tempoTotalHoras;

    // Calcular custo líquido
    const custoLiquido = totalResina + totalEnergia + custoMaquina + custoLimpeza;

    // Calcular preço de venda
    const precoVenda = custoLiquido * (1 + margemLucro / 100);

    const novoResultado = {
      totalResina,
      totalEnergia,
      custoMaquina,
      custoLiquido,
      precoVenda,
      margemLucro
    };

    setResultado(novoResultado);

    if (onCalculoCompleto) {
      onCalculoCompleto(novoResultado);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">Calculadora de Impressão 3D - Resina</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Tempo de Impressão */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Tempo de Impressão</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Horas</label>
              <input
                type="number"
                min="0"
                value={horas}
                onChange={(e) => setHoras(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Minutos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutos}
                onChange={(e) => setMinutos(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Segundos</label>
              <input
                type="number"
                min="0"
                max="59"
                value={segundos}
                onChange={(e) => setSegundos(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Quantidade de Resina */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Quantidade de Resina</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Valor (R$/L)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={valorResinaLitro}
                onChange={(e) => setValorResinaLitro(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="R$ 0,00"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Quantidade (ml)</label>
              <input
                type="number"
                min="0"
                value={quantidadeML}
                onChange={(e) => setQuantidadeML(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="0 ml"
              />
            </div>
          </div>
        </div>

        {/* Custo Máquina */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Custo Máquina</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Maquinário (R$)</label>
              <input
                type="number"
                min="0"
                value={valorMaquinario}
                onChange={(e) => setValorMaquinario(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Vida útil (h)</label>
              <input
                type="number"
                min="1"
                value={vidaUtil}
                onChange={(e) => setVidaUtil(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Consumo (W)</label>
              <input
                type="number"
                min="0"
                value={consumoWatts}
                onChange={(e) => setConsumoWatts(Number(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Custos Extras */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Custos Extras</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Limpeza e modelagem (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={custoLimpeza}
              onChange={(e) => setCustoLimpeza(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        {/* Energia Elétrica */}
        <div className="border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Energia Elétrica</h3>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Custo por kWh (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={custoKwh}
              onChange={(e) => setCustoKwh(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-6 border-t pt-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Resultados
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Resina</p>
            <p className="text-xl font-bold text-blue-600">
              R$ {resultado.totalResina.toFixed(2)}
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Energia</p>
            <p className="text-xl font-bold text-yellow-600">
              R$ {resultado.totalEnergia.toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Custo Máquina</p>
            <p className="text-xl font-bold text-purple-600">
              R$ {resultado.custoMaquina.toFixed(2)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Custo Líquido</p>
            <p className="text-xl font-bold text-red-600">
              R$ {resultado.custoLiquido.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Preço de Venda</p>
            <p className="text-xl font-bold text-green-600">
              R$ {resultado.precoVenda.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm text-gray-600 mb-1">Margem de Lucro (%)</label>
          <input
            type="number"
            min="0"
            max="1000"
            value={margemLucro}
            onChange={(e) => setMargemLucro(Number(e.target.value))}
            className="w-full md:w-48 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>
    </div>
  );
}

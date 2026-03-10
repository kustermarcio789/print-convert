import { useState, useEffect } from 'react';
import { Calculator, Save, Info, Layers, Droplets } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

// ============ MATERIAIS FDM ============
const FILAMENT_MATERIALS = [
  { value: 'pla', label: 'PLA', density: 1.24 },
  { value: 'petg', label: 'PETG', density: 1.27 },
  { value: 'abs', label: 'ABS', density: 1.04 },
  { value: 'abs_cf', label: 'ABS CF', density: 1.10 },
  { value: 'pla_wood', label: 'PLA Wood', density: 1.20 },
  { value: 'pla_cf', label: 'PLA CF', density: 1.25 },
  { value: 'petg_cf', label: 'PETG CF', density: 1.29 },
  { value: 'pet_cf', label: 'PET CF', density: 1.35 },
  { value: 'nylon', label: 'Nylon', density: 1.15 },
  { value: 'pa', label: 'PA', density: 1.15 },
  { value: 'pc', label: 'PC', density: 1.20 },
  { value: 'pa_cf', label: 'PA CF', density: 1.18 },
  { value: 'tpu', label: 'TPU', density: 1.21 },
  { value: 'tritan', label: 'Tritan', density: 1.22 },
];

// ============ COMPONENTE CALCULADORA FDM ============
function CalculadoraFDM() {
  const [material, setMaterial] = useState('pla');
  const [density, setDensity] = useState(1.24);
  const [pricePerKg, setPricePerKg] = useState(0);
  const [weight, setWeight] = useState(0);
  const [timeMinutes, setTimeMinutes] = useState(0);

  const [machineValue, setMachineValue] = useState(3000);
  const [monthsToPay, setMonthsToPay] = useState(12);
  const [daysPerMonth, setDaysPerMonth] = useState(25);
  const [hoursPerDay, setHoursPerDay] = useState(8);

  const [kwhCost, setKwhCost] = useState(0.60);
  const [watts, setWatts] = useState(360);
  const [maintenancePercent, setMaintenancePercent] = useState(10);
  const [failurePercent, setFailurePercent] = useState(10);
  const [finishingPercent, setFinishingPercent] = useState(10);
  const [fixationCost, setFixationCost] = useState(0.20);
  const [profitPercent, setProfitPercent] = useState(200);

  const [results, setResults] = useState({
    depreciation: 0, materialCost: 0, energyCost: 0, maintenanceCost: 0,
    machineCost: 0, failureCost: 0, otherCosts: 0, totalCost: 0, salePrice: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('calc_fdm_config');
    if (saved) {
      const c = JSON.parse(saved);
      if (c.machineValue) setMachineValue(c.machineValue);
      if (c.monthsToPay) setMonthsToPay(c.monthsToPay);
      if (c.daysPerMonth) setDaysPerMonth(c.daysPerMonth);
      if (c.hoursPerDay) setHoursPerDay(c.hoursPerDay);
      if (c.kwhCost) setKwhCost(c.kwhCost);
      if (c.watts) setWatts(c.watts);
      if (c.maintenancePercent !== undefined) setMaintenancePercent(c.maintenancePercent);
      if (c.failurePercent !== undefined) setFailurePercent(c.failurePercent);
      if (c.finishingPercent !== undefined) setFinishingPercent(c.finishingPercent);
      if (c.fixationCost !== undefined) setFixationCost(c.fixationCost);
      if (c.profitPercent !== undefined) setProfitPercent(c.profitPercent);
    }
  }, []);

  useEffect(() => {
    const totalHours = monthsToPay * daysPerMonth * hoursPerDay;
    const depreciation = totalHours > 0 ? machineValue / totalHours : 0;
    const hours = timeMinutes / 60;

    const matCost = (weight / 1000) * pricePerKg;
    const enCost = (watts / 1000) * hours * kwhCost;
    const mntCost = (matCost + enCost) * (maintenancePercent / 100);
    const machCost = depreciation * hours;
    const failCost = (matCost + enCost + mntCost + machCost) * (failurePercent / 100);
    const baseCost = matCost + enCost + mntCost + machCost + failCost;
    const finishCost = baseCost * (finishingPercent / 100);
    const otherCost = finishCost + fixationCost;
    const total = matCost + enCost + mntCost + machCost + failCost + otherCost;
    const sale = total + (total * (profitPercent / 100));

    setResults({
      depreciation, materialCost: matCost, energyCost: enCost, maintenanceCost: mntCost,
      machineCost: machCost, failureCost: failCost, otherCosts: otherCost, totalCost: total, salePrice: sale
    });
  }, [weight, pricePerKg, timeMinutes, kwhCost, watts, maintenancePercent, failurePercent, finishingPercent, fixationCost, profitPercent, machineValue, monthsToPay, daysPerMonth, hoursPerDay]);

  const handleMaterialChange = (val: string) => {
    setMaterial(val);
    const m = FILAMENT_MATERIALS.find(m => m.value === val);
    if (m) setDensity(m.density);
  };

  const saveConfig = () => {
    localStorage.setItem('calc_fdm_config', JSON.stringify({
      machineValue, monthsToPay, daysPerMonth, hoursPerDay, kwhCost, watts,
      maintenancePercent, failurePercent, finishingPercent, fixationCost, profitPercent
    }));
    alert('Configurações FDM salvas com sucesso!');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Coluna Esquerda */}
      <div className="space-y-6">
        {/* Configuração da Impressão */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">⚙️</span>
            Configuração da Impressão
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
              <select value={material} onChange={(e) => handleMaterialChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                {FILAMENT_MATERIALS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço/kg (R$)</label>
                <input type="number" value={pricePerKg || ''} onChange={(e) => setPricePerKg(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Densidade (g/cm³)</label>
                <input type="number" value={density} readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-600 mb-1">⚖️ Peso da Peça (gramas)</label>
              <input type="number" value={weight || ''} onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-medium" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tempo de Impressão (minutos)</label>
              <input type="number" value={timeMinutes || ''} onChange={(e) => setTimeMinutes(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="0" />
            </div>
          </div>
        </div>

        {/* ROI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">🏗️</span>
            Custo de Máquina (ROI)
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Máquina (R$)</label>
              <input type="number" value={machineValue} onChange={(e) => setMachineValue(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pagar em (Meses)</label>
              <input type="number" value={monthsToPay} onChange={(e) => setMonthsToPay(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dias Uso/Mês</label>
              <input type="number" value={daysPerMonth} onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas Uso/Dia</label>
              <input type="number" value={hoursPerDay} onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <label className="block text-sm font-semibold text-green-700 mb-1">Depreciação Calculada (R$/Hora)</label>
            <div className="text-2xl font-bold text-green-600">R$ {results.depreciation.toFixed(2)}</div>
          </div>
        </div>

        {/* Energia & Taxas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-sm">⚡</span>
            Energia & Taxas
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custo KWh (R$)</label>
                <input type="number" value={kwhCost} onChange={(e) => setKwhCost(Number(e.target.value))} step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Potência (Watts)</label>
                <input type="number" value={watts} onChange={(e) => setWatts(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manutenção (%)</label>
                <input type="number" value={maintenancePercent} onChange={(e) => setMaintenancePercent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-500 mt-1">Baseado em Mat. + Energia</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Falhas (%)</label>
                <input type="number" value={failurePercent} onChange={(e) => setFailurePercent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acabamento (%)</label>
                <input type="number" value={finishingPercent} onChange={(e) => setFinishingPercent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fixação (R$)</label>
                <input type="number" value={fixationCost} onChange={(e) => setFixationCost(Number(e.target.value))} step="0.01"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lucro Desejado (%)</label>
              <input type="number" value={profitPercent} onChange={(e) => setProfitPercent(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <button onClick={saveConfig}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
            <Save className="h-5 w-5" /> Salvar Configurações
          </button>
        </div>
      </div>

      {/* Coluna Direita - Resultados */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-blue-600 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📊</span>
            Resultado Financeiro
          </h3>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 text-center mb-6">
            <p className="text-sm text-gray-600 mb-2 font-medium">Preço Sugerido de Venda</p>
            <p className="text-3xl sm:text-5xl font-bold text-blue-600 mb-4">R$ {results.salePrice.toFixed(2)}</p>
            <div className="w-16 h-px bg-blue-300 mx-auto my-4" />
            <p className="text-sm text-gray-600 mb-1">Custo Total de Produção</p>
            <p className="text-2xl font-bold text-red-500">R$ {results.totalCost.toFixed(2)}</p>
            {results.totalCost > 0 && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                Lucro: R$ {(results.salePrice - results.totalCost).toFixed(2)} ({profitPercent}%)
              </p>
            )}
          </div>

          <div className="space-y-0">
            {[
              { icon: '📦', label: 'Peso Informado', value: `${weight} g`, isPrice: false },
              { icon: '🧵', label: 'Custo Material', value: results.materialCost, isPrice: true },
              { icon: '⚡', label: 'Custo Energia', value: results.energyCost, isPrice: true },
              { icon: '🛠️', label: `Manutenção (${maintenancePercent}%)`, value: results.maintenanceCost, isPrice: true },
              { icon: '🏚️', label: 'Custo Máquina (Depreciação)', value: results.machineCost, isPrice: true },
              { icon: '⚠️', label: 'Taxa de Risco/Falha', value: results.failureCost, isPrice: true },
              { icon: '✨', label: 'Acabamento + Fixação', value: results.otherCosts, isPrice: true },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                <span className="text-gray-700 flex items-center gap-2">
                  <span>{item.icon}</span> {item.label}
                </span>
                <span className="font-semibold text-gray-900">
                  {item.isPrice ? `R$ ${(item.value as number).toFixed(2)}` : item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
              <p>A Manutenção é calculada como {maintenancePercent}% sobre Material + Energia. O lucro de {profitPercent}% é aplicado sobre o custo total de produção.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ COMPONENTE CALCULADORA RESINA ============
function CalculadoraResina() {
  const [horas, setHoras] = useState(0);
  const [minutos, setMinutos] = useState(0);
  const [segundos, setSegundos] = useState(0);
  const [valorResinaLitro, setValorResinaLitro] = useState(0);
  const [quantidadeML, setQuantidadeML] = useState(0);
  const [valorMaquinario, setValorMaquinario] = useState(2000);
  const [vidaUtil, setVidaUtil] = useState(2000);
  const [consumoWatts, setConsumoWatts] = useState(72);
  const [custoLimpeza, setCustoLimpeza] = useState(0);
  const [custoKwh, setCustoKwh] = useState(0.89);
  const [margemLucro, setMargemLucro] = useState(40);

  const [resultado, setResultado] = useState({
    totalResina: 0, totalEnergia: 0, custoMaquina: 0, custoLiquido: 0, precoVenda: 0
  });

  useEffect(() => {
    const saved = localStorage.getItem('calc_resina_config');
    if (saved) {
      const c = JSON.parse(saved);
      if (c.valorMaquinario) setValorMaquinario(c.valorMaquinario);
      if (c.vidaUtil) setVidaUtil(c.vidaUtil);
      if (c.consumoWatts) setConsumoWatts(c.consumoWatts);
      if (c.custoKwh) setCustoKwh(c.custoKwh);
      if (c.margemLucro !== undefined) setMargemLucro(c.margemLucro);
    }
  }, []);

  useEffect(() => {
    const tempoTotalHoras = horas + (minutos / 60) + (segundos / 3600);
    const totalResina = (valorResinaLitro * quantidadeML) / 1000;
    const totalEnergia = (tempoTotalHoras * consumoWatts * custoKwh) / 1000;
    const custoMaquinaPorHora = vidaUtil > 0 ? valorMaquinario / vidaUtil : 0;
    const custoMaquina = custoMaquinaPorHora * tempoTotalHoras;
    const custoLiquido = totalResina + totalEnergia + custoMaquina + custoLimpeza;
    const precoVenda = custoLiquido * (1 + margemLucro / 100);

    setResultado({ totalResina, totalEnergia, custoMaquina, custoLiquido, precoVenda });
  }, [horas, minutos, segundos, valorResinaLitro, quantidadeML, valorMaquinario, vidaUtil, consumoWatts, custoLimpeza, custoKwh, margemLucro]);

  const saveConfig = () => {
    localStorage.setItem('calc_resina_config', JSON.stringify({
      valorMaquinario, vidaUtil, consumoWatts, custoKwh, margemLucro
    }));
    alert('Configurações de Resina salvas com sucesso!');
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Coluna Esquerda */}
      <div className="space-y-6">
        {/* Tempo de Impressão */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm">⏱️</span>
            Tempo de Impressão
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas</label>
              <input type="number" min="0" value={horas || ''} onChange={(e) => setHoras(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Minutos</label>
              <input type="number" min="0" max="59" value={minutos || ''} onChange={(e) => setMinutos(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Segundos</label>
              <input type="number" min="0" max="59" value={segundos || ''} onChange={(e) => setSegundos(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Quantidade de Resina */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-purple-600 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm">🧪</span>
            Quantidade de Resina
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Litro (R$)</label>
              <input type="number" min="0" step="0.01" value={valorResinaLitro || ''} onChange={(e) => setValorResinaLitro(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade (ml)</label>
              <input type="number" min="0" value={quantidadeML || ''} onChange={(e) => setQuantidadeML(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="0" />
            </div>
          </div>
        </div>

        {/* Custo Máquina */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-sm">🏗️</span>
            Custo da Máquina
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Maquinário (R$)</label>
              <input type="number" min="0" value={valorMaquinario} onChange={(e) => setValorMaquinario(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vida Útil (horas)</label>
              <input type="number" min="1" value={vidaUtil} onChange={(e) => setVidaUtil(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Consumo (Watts)</label>
              <input type="number" min="0" value={consumoWatts} onChange={(e) => setConsumoWatts(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Custo KWh (R$)</label>
              <input type="number" min="0" step="0.01" value={custoKwh} onChange={(e) => setCustoKwh(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>

        {/* Custos Extras */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-sm">💰</span>
            Custos Extras & Lucro
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limpeza e Modelagem (R$)</label>
              <input type="number" min="0" step="0.01" value={custoLimpeza || ''} onChange={(e) => setCustoLimpeza(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Margem de Lucro (%)</label>
              <input type="number" min="0" value={margemLucro} onChange={(e) => setMargemLucro(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <button onClick={saveConfig}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium">
            <Save className="h-5 w-5" /> Salvar Configurações
          </button>
        </div>
      </div>

      {/* Coluna Direita - Resultados */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-purple-600 mb-6 flex items-center gap-2">
            <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-sm">📊</span>
            Resultado Financeiro
          </h3>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-8 text-center mb-6">
            <p className="text-sm text-gray-600 mb-2 font-medium">Preço Sugerido de Venda</p>
            <p className="text-3xl sm:text-5xl font-bold text-purple-600 mb-4">R$ {resultado.precoVenda.toFixed(2)}</p>
            <div className="w-16 h-px bg-purple-300 mx-auto my-4" />
            <p className="text-sm text-gray-600 mb-1">Custo Líquido de Produção</p>
            <p className="text-2xl font-bold text-red-500">R$ {resultado.custoLiquido.toFixed(2)}</p>
            {resultado.custoLiquido > 0 && (
              <p className="text-sm text-green-600 mt-2 font-medium">
                Lucro: R$ {(resultado.precoVenda - resultado.custoLiquido).toFixed(2)} ({margemLucro}%)
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-600 mb-1">Total Resina</p>
              <p className="text-xl font-bold text-blue-600">R$ {resultado.totalResina.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-600 mb-1">Total Energia</p>
              <p className="text-xl font-bold text-yellow-600">R$ {resultado.totalEnergia.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-600 mb-1">Custo Máquina</p>
              <p className="text-xl font-bold text-purple-600">R$ {resultado.custoMaquina.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center">
              <p className="text-xs text-gray-600 mb-1">Limpeza/Modelagem</p>
              <p className="text-xl font-bold text-green-600">R$ {custoLimpeza.toFixed(2)}</p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0 text-purple-500" />
              <p>O custo da máquina é calculado dividindo o valor do maquinário pela vida útil em horas. A margem de {margemLucro}% é aplicada sobre o custo líquido total.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PÁGINA PRINCIPAL ============
export default function Calculator3DPage() {
  const [activeTab, setActiveTab] = useState<'fdm' | 'resina'>('fdm');

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Calculator className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">Ferramenta Gratuita</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Calculadora 3D
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Calcule o custo real e o preço de venda das suas impressões em <strong>filamento (FDM)</strong> e <strong>resina (SLA/DLP)</strong>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 -mt-6">
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('fdm')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
                activeTab === 'fdm'
                  ? 'bg-blue-600 text-white shadow-blue-600/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Layers className="h-6 w-6" />
              Filamento (FDM)
            </button>
            <button
              onClick={() => setActiveTab('resina')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg ${
                activeTab === 'resina'
                  ? 'bg-purple-600 text-white shadow-purple-600/30'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Droplets className="h-6 w-6" />
              Resina (SLA/DLP)
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 pb-16">
          {activeTab === 'fdm' ? <CalculadoraFDM /> : <CalculadoraResina />}

          {/* Dicas */}
          <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Como usar a calculadora</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Configure sua máquina</h4>
                  <p className="text-sm text-gray-600">Informe o valor da impressora, vida útil e consumo de energia. Esses dados são salvos para uso futuro.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Informe os dados da peça</h4>
                  <p className="text-sm text-gray-600">Peso em gramas (FDM) ou ml de resina, tempo de impressão e preço do material por kg/litro.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Veja o resultado</h4>
                  <p className="text-sm text-gray-600">O preço sugerido de venda é calculado automaticamente com base nos custos + margem de lucro desejada.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

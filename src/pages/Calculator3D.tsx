import React, { useState, useEffect } from 'react';
import { Calculator, Save, Info } from 'lucide-react';

// Presets de materiais (baseado na calculadora fornecida)
const MATERIAL_PRESETS = {
  abs: { name: 'ABS', price: 0, density: 1.04 },
  abs_cf: { name: 'ABS CF', price: 0, density: 1.10 },
  pla: { name: 'PLA', price: 0, density: 1.24 },
  pla_wood: { name: 'PLA Wood', price: 0, density: 1.28 },
  pla_cf: { name: 'PLA CF', price: 0, density: 1.30 },
  petg: { name: 'PETG', price: 0, density: 1.27 },
  petg_cf: { name: 'PETG CF', price: 0, density: 1.35 },
  pet_cf: { name: 'PET CF', price: 0, density: 1.38 },
  nylon: { name: 'Nylon', price: 0, density: 1.14 },
  pa: { name: 'PA', price: 0, density: 1.14 },
  pc: { name: 'PC', price: 0, density: 1.20 },
  pa_cf: { name: 'PA CF', price: 0, density: 1.18 },
  tpu: { name: 'TPU', price: 0, density: 1.21 }
};

export default function Calculator3D() {
  // Estado do material
  const [material, setMaterial] = useState('custom');
  const [pricePerKg, setPricePerKg] = useState(0);
  const [density, setDensity] = useState(0);

  // Estado da impressão
  const [weight, setWeight] = useState(0);
  const [timeMinutes, setTimeMinutes] = useState(0);

  // Estado da máquina (ROI)
  const [machineValue, setMachineValue] = useState(3000);
  const [monthsToPay, setMonthsToPay] = useState(12);
  const [daysPerMonth, setDaysPerMonth] = useState(25);
  const [hoursPerDay, setHoursPerDay] = useState(8);

  // Estado de energia e taxas
  const [kwhCost, setKwhCost] = useState(0.60);
  const [watts, setWatts] = useState(360);
  const [maintenancePercent, setMaintenancePercent] = useState(10);
  const [failurePercent, setFailurePercent] = useState(10);
  const [finishingPercent, setFinishingPercent] = useState(10);
  const [fixationCost, setFixationCost] = useState(0.20);
  const [profitPercent, setProfitPercent] = useState(200);

  // Resultados calculados
  const [depreciationPerHour, setDepreciationPerHour] = useState(0);
  const [materialCost, setMaterialCost] = useState(0);
  const [energyCost, setEnergyCost] = useState(0);
  const [maintenanceCost, setMaintenanceCost] = useState(0);
  const [machineCost, setMachineCost] = useState(0);
  const [failureCost, setFailureCost] = useState(0);
  const [otherCosts, setOtherCosts] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [salePrice, setSalePrice] = useState(0);

  // Carregar configurações salvas
  useEffect(() => {
    const savedConfig = localStorage.getItem('calculator_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setMachineValue(config.machineValue || 3000);
      setMonthsToPay(config.monthsToPay || 12);
      setDaysPerMonth(config.daysPerMonth || 25);
      setHoursPerDay(config.hoursPerDay || 8);
      setKwhCost(config.kwhCost || 0.60);
      setWatts(config.watts || 360);
      setMaintenancePercent(config.maintenancePercent || 10);
      setFailurePercent(config.failurePercent || 10);
      setFinishingPercent(config.finishingPercent || 10);
      setFixationCost(config.fixationCost || 0.20);
      setProfitPercent(config.profitPercent || 200);
    }

    const savedMaterials = localStorage.getItem('material_prices');
    if (savedMaterials) {
      const materials = JSON.parse(savedMaterials);
      Object.keys(MATERIAL_PRESETS).forEach(key => {
        if (materials[key]) {
          MATERIAL_PRESETS[key as keyof typeof MATERIAL_PRESETS].price = materials[key];
        }
      });
    }
  }, []);

  // Calcular depreciação por hora
  useEffect(() => {
    const totalHours = monthsToPay * daysPerMonth * hoursPerDay;
    const depreciation = totalHours > 0 ? machineValue / totalHours : 0;
    setDepreciationPerHour(depreciation);
  }, [machineValue, monthsToPay, daysPerMonth, hoursPerDay]);

  // Calcular custos
  useEffect(() => {
    // Custo de material
    const matCost = (weight / 1000) * pricePerKg;
    setMaterialCost(matCost);

    // Custo de energia
    const hours = timeMinutes / 60;
    const kwh = (watts / 1000) * hours;
    const enCost = kwh * kwhCost;
    setEnergyCost(enCost);

    // Custo de manutenção (% sobre material + energia)
    const mntCost = (matCost + enCost) * (maintenancePercent / 100);
    setMaintenanceCost(mntCost);

    // Custo de máquina (depreciação)
    const machCost = depreciationPerHour * hours;
    setMachineCost(machCost);

    // Taxa de falha
    const failCost = (matCost + enCost + mntCost + machCost) * (failurePercent / 100);
    setFailureCost(failCost);

    // Acabamento + Fixação
    const baseCost = matCost + enCost + mntCost + machCost + failCost;
    const finishCost = baseCost * (finishingPercent / 100);
    const otherCost = finishCost + fixationCost;
    setOtherCosts(otherCost);

    // Custo total
    const total = matCost + enCost + mntCost + machCost + failCost + otherCost;
    setTotalCost(total);

    // Preço de venda (custo + lucro)
    const sale = total + (total * (profitPercent / 100));
    setSalePrice(sale);
  }, [weight, pricePerKg, timeMinutes, kwhCost, watts, maintenancePercent, failurePercent, finishingPercent, fixationCost, profitPercent, depreciationPerHour]);

  // Mudar material
  const handleMaterialChange = (mat: string) => {
    setMaterial(mat);
    if (mat !== 'custom' && MATERIAL_PRESETS[mat as keyof typeof MATERIAL_PRESETS]) {
      const preset = MATERIAL_PRESETS[mat as keyof typeof MATERIAL_PRESETS];
      setPricePerKg(preset.price);
      setDensity(preset.density);
    }
  };

  // Salvar preço de material
  const saveMaterialPrice = () => {
    if (material !== 'custom') {
      const savedMaterials = JSON.parse(localStorage.getItem('material_prices') || '{}');
      savedMaterials[material] = pricePerKg;
      localStorage.setItem('material_prices', JSON.stringify(savedMaterials));
      alert('Preço do material salvo!');
    }
  };

  // Salvar configurações gerais
  const saveGeneralConfig = () => {
    const config = {
      machineValue,
      monthsToPay,
      daysPerMonth,
      hoursPerDay,
      kwhCost,
      watts,
      maintenancePercent,
      failurePercent,
      finishingPercent,
      fixationCost,
      profitPercent
    };
    localStorage.setItem('calculator_config', JSON.stringify(config));
    alert('Configurações salvas!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-width-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Calculator className="h-10 w-10 text-blue-600" />
            Calculadora de Impressão 3D
          </h1>
          <p className="text-gray-600">Calcule o custo e preço de venda de suas impressões em filamento</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Configuração */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-gray-200 pb-2">
                ⚙️ Configuração da Impressão
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                  <select
                    value={material}
                    onChange={(e) => handleMaterialChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="custom">-- Selecione --</option>
                    {Object.entries(MATERIAL_PRESETS).map(([key, value]) => (
                      <option key={key} value={key}>{value.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço/kg (R$)</label>
                    <input
                      type="number"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                    {material !== 'custom' && (
                      <button
                        onClick={saveMaterialPrice}
                        className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                        Salvar Material
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Densidade (g/cm³)</label>
                    <input
                      type="number"
                      value={density}
                      onChange={(e) => setDensity(Number(e.target.value))}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">(Apenas referência)</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-blue-600 mb-1">⚖️ Peso da Peça (gramas)</label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    step="0.01"
                    className="w-full px-3 py-3 border-2 border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-lg"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo (minutos)</label>
                  <input
                    type="number"
                    value={timeMinutes}
                    onChange={(e) => setTimeMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            <hr className="my-6" />

            <div>
              <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-gray-200 pb-2">
                🏗️ Custo de Máquina (ROI)
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor Máquina (R$)</label>
                  <input
                    type="number"
                    value={machineValue}
                    onChange={(e) => setMachineValue(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pagar em (Meses)</label>
                  <input
                    type="number"
                    value={monthsToPay}
                    onChange={(e) => setMonthsToPay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dias Uso/Mês</label>
                  <input
                    type="number"
                    value={daysPerMonth}
                    onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horas Uso/Dia</label>
                  <input
                    type="number"
                    value={hoursPerDay}
                    onChange={(e) => setHoursPerDay(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
                <label className="block text-sm font-medium text-green-700 mb-1">Depreciação Calculada (R$/Hora)</label>
                <input
                  type="text"
                  value={depreciationPerHour.toFixed(2)}
                  className="w-full px-3 py-2 border border-green-300 rounded-md bg-white text-gray-600"
                  readOnly
                />
              </div>
            </div>

            <hr className="my-6" />

            <div>
              <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-gray-200 pb-2">
                ⚡ Energia & Taxas
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo KWh (R$)</label>
                    <input
                      type="number"
                      value={kwhCost}
                      onChange={(e) => setKwhCost(Number(e.target.value))}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Potência (Watts)</label>
                    <input
                      type="number"
                      value={watts}
                      onChange={(e) => setWatts(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Manutenção (%)</label>
                    <input
                      type="number"
                      value={maintenancePercent}
                      onChange={(e) => setMaintenancePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">(Baseado em Mat. + Energia)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Falhas (%)</label>
                    <input
                      type="number"
                      value={failurePercent}
                      onChange={(e) => setFailurePercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Acabamento (%)</label>
                    <input
                      type="number"
                      value={finishingPercent}
                      onChange={(e) => setFinishingPercent(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fixação (R$)</label>
                    <input
                      type="number"
                      value={fixationCost}
                      onChange={(e) => setFixationCost(Number(e.target.value))}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lucro Desejado (%)</label>
                  <input
                    type="number"
                    value={profitPercent}
                    onChange={(e) => setProfitPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={saveGeneralConfig}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-800"
              >
                <Save className="h-5 w-5" />
                Salvar Configurações
              </button>
            </div>
          </div>

          {/* Coluna Direita - Resultados */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-blue-600 mb-4 border-b-2 border-gray-200 pb-2">
              📊 Resultado Financeiro
            </h2>

            <div className="bg-blue-50 rounded-lg p-6 text-center mb-6">
              <p className="text-sm text-gray-600 mb-2">Preço Sugerido de Venda</p>
              <p className="text-5xl font-bold text-blue-600 mb-4">
                R$ {salePrice.toFixed(2)}
              </p>
              <hr className="w-1/2 mx-auto opacity-30 my-4" />
              <p className="text-sm text-gray-600 mb-1">Custo Total de Produção</p>
              <p className="text-2xl font-bold text-red-600">
                R$ {totalCost.toFixed(2)}
              </p>
            </div>

            <table className="w-full">
              <tbody className="text-sm">
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">📦 Peso Informado</td>
                  <td className="py-3 text-right font-medium">{weight} g</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">🧵 Custo Material</td>
                  <td className="py-3 text-right font-medium">R$ {materialCost.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">⚡ Custo Energia</td>
                  <td className="py-3 text-right font-medium">R$ {energyCost.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">🛠️ Manutenção ({maintenancePercent}%)</td>
                  <td className="py-3 text-right font-medium">R$ {maintenanceCost.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">🏚️ Custo Máquina (Depreciação)</td>
                  <td className="py-3 text-right font-medium">R$ {machineCost.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">⚠️ Taxa de Risco/Falha</td>
                  <td className="py-3 text-right font-medium">R$ {failureCost.toFixed(2)}</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 text-gray-700">✨ Acabamento + Fixação</td>
                  <td className="py-3 text-right font-medium">R$ {otherCosts.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>
                  A Manutenção é calculada como {maintenancePercent}% sobre a soma de Material + Energia.
                  O lucro de {profitPercent}% é aplicado sobre o custo total de produção.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

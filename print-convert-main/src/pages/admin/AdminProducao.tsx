import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, AlertCircle, Box, Factory, Search, Plus, Trash2, Edit,
  Calculator, Save, X, ChevronDown, ChevronUp, Layers, Droplets, TrendingUp,
  Package, DollarSign, Zap, Wrench, BarChart3, Eye, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

// ============ MATERIAIS ============
const FILAMENT_MATERIALS = [
  { value: 'pla', label: 'PLA', density: 1.24 },
  { value: 'petg', label: 'PETG', density: 1.27 },
  { value: 'abs', label: 'ABS', density: 1.04 },
  { value: 'abs_cf', label: 'ABS CF', density: 1.10 },
  { value: 'pla_cf', label: 'PLA CF', density: 1.25 },
  { value: 'petg_cf', label: 'PETG CF', density: 1.29 },
  { value: 'nylon', label: 'Nylon', density: 1.15 },
  { value: 'tpu', label: 'TPU', density: 1.21 },
  { value: 'pc', label: 'PC', density: 1.20 },
  { value: 'pa_cf', label: 'PA CF', density: 1.18 },
];

const RESIN_TYPES = [
  { value: 'standard', label: 'Resina Standard' },
  { value: 'abs_like', label: 'Resina ABS-Like' },
  { value: 'water_wash', label: 'Water Washable' },
  { value: 'flexible', label: 'Flexível (Elastic)' },
  { value: 'castable', label: 'Castable (Fundição)' },
  { value: '8k', label: 'Resina 8K Premium' },
  { value: '12k', label: 'Resina 12K Ultra' },
];

// ============ INTERFACES ============
interface ProducaoRecord {
  id: string;
  nome_peca: string;
  cliente: string;
  tipo: 'fdm' | 'resina';
  material: string;
  quantidade: number;
  peso_gramas: number;
  tempo_minutos: number;
  custo_material: number;
  custo_energia: number;
  custo_maquina: number;
  custo_total: number;
  preco_venda: number;
  lucro: number;
  status: 'pendente' | 'em_producao' | 'concluida' | 'cancelada';
  data_criacao: string;
  data_conclusao?: string;
  observacoes?: string;
  impressora_usada?: string;
}

interface CalcFDM {
  material: string;
  pricePerKg: number;
  weight: number;
  timeMinutes: number;
  machineValue: number;
  monthsToPay: number;
  daysPerMonth: number;
  hoursPerDay: number;
  kwhCost: number;
  watts: number;
  maintenancePercent: number;
  failurePercent: number;
  finishingPercent: number;
  fixationCost: number;
  profitPercent: number;
}

interface CalcResina {
  horas: number;
  minutos: number;
  segundos: number;
  valorResinaLitro: number;
  quantidadeML: number;
  valorMaquinario: number;
  vidaUtil: number;
  consumoWatts: number;
  custoLimpeza: number;
  custoKwh: number;
  margemLucro: number;
}

// ============ CALCULADORA FDM ============
function CalculadoraFDM({ onSave }: { onSave: (data: Partial<ProducaoRecord>) => void }) {
  const [calc, setCalc] = useState<CalcFDM>({
    material: 'pla', pricePerKg: 80, weight: 0, timeMinutes: 0,
    machineValue: 3000, monthsToPay: 12, daysPerMonth: 25, hoursPerDay: 8,
    kwhCost: 0.75, watts: 360, maintenancePercent: 10, failurePercent: 10,
    finishingPercent: 10, fixationCost: 0.20, profitPercent: 200
  });
  const [nomePeca, setNomePeca] = useState('');
  const [cliente, setCliente] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [impressora, setImpressora] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('calc_fdm_config');
    if (saved) {
      const c = JSON.parse(saved);
      setCalc(prev => ({ ...prev, ...c }));
    }
  }, []);

  const density = FILAMENT_MATERIALS.find(m => m.value === calc.material)?.density || 1.24;
  const totalHours = calc.monthsToPay * calc.daysPerMonth * calc.hoursPerDay;
  const depreciation = totalHours > 0 ? calc.machineValue / totalHours : 0;
  const hours = calc.timeMinutes / 60;
  const matCost = (calc.weight / 1000) * calc.pricePerKg;
  const enCost = (calc.watts / 1000) * hours * calc.kwhCost;
  const mntCost = (matCost + enCost) * (calc.maintenancePercent / 100);
  const machCost = depreciation * hours;
  const failCost = (matCost + enCost + mntCost + machCost) * (calc.failurePercent / 100);
  const baseCost = matCost + enCost + mntCost + machCost + failCost;
  const finishCost = baseCost * (calc.finishingPercent / 100);
  const otherCost = finishCost + calc.fixationCost;
  const totalCost = matCost + enCost + mntCost + machCost + failCost + otherCost;
  const salePrice = totalCost + (totalCost * (calc.profitPercent / 100));
  const lucro = salePrice - totalCost;

  const set = (field: keyof CalcFDM, value: number | string) =>
    setCalc(prev => ({ ...prev, [field]: value }));

  const saveConfig = () => {
    localStorage.setItem('calc_fdm_config', JSON.stringify(calc));
    alert('Configurações FDM salvas!');
  };

  const handleSave = () => {
    if (!nomePeca) { alert('Informe o nome da peça'); return; }
    onSave({
      nome_peca: nomePeca, cliente, tipo: 'fdm',
      material: FILAMENT_MATERIALS.find(m => m.value === calc.material)?.label || calc.material,
      quantidade, peso_gramas: calc.weight, tempo_minutos: calc.timeMinutes,
      custo_material: matCost * quantidade, custo_energia: enCost * quantidade,
      custo_maquina: machCost * quantidade, custo_total: totalCost * quantidade,
      preco_venda: salePrice * quantidade, lucro: lucro * quantidade,
      impressora_usada: impressora,
    });
    setNomePeca(''); setCliente(''); setQuantidade(1);
  };

  return (
    <div className="space-y-6">
      {/* Identificação */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-blue-500" /> Identificação da Peça
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nome da Peça *</label>
            <Input value={nomePeca} onChange={e => setNomePeca(e.target.value)} placeholder="Ex: Suporte câmera Voron" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Cliente</label>
            <Input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Quantidade</label>
            <Input type="number" min="1" value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Impressora Usada</label>
            {(() => {
              const saved = localStorage.getItem('admin_impressoras_3d');
              const impressoras = saved ? JSON.parse(saved).filter((i: any) => i.status === 'ativa' && i.tipo === 'FDM') : [];
              return impressoras.length > 0 ? (
                <select value={impressora} onChange={e => setImpressora(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                  <option value="">Selecione a impressora...</option>
                  {impressoras.map((imp: any) => <option key={imp.id} value={`${imp.apelido} (${imp.marca} ${imp.modelo})`}>{imp.apelido} - {imp.marca} {imp.modelo}</option>)}
                </select>
              ) : <Input value={impressora} onChange={e => setImpressora(e.target.value)} placeholder="Ex: Sovol SV08 MAX" />;
            })()}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Coluna Esquerda */}
        <div className="space-y-4">
          {/* Configuração da Impressão */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Configuração da Impressão
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Material</label>
                  <select value={calc.material} onChange={e => set('material', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-blue-500">
                    {FILAMENT_MATERIALS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Preço/kg (R$)</label>
                  <Input type="number" value={calc.pricePerKg || ''} onChange={e => set('pricePerKg', Number(e.target.value))} placeholder="80" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-blue-500 mb-1">⚖️ Peso da Peça (gramas)</label>
                <Input type="number" value={calc.weight || ''} onChange={e => set('weight', Number(e.target.value))} placeholder="0" className="border-blue-300 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Tempo de Impressão (minutos)</label>
                <Input type="number" value={calc.timeMinutes || ''} onChange={e => set('timeMinutes', Number(e.target.value))} placeholder="0" />
              </div>
              <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">
                Densidade: {density} g/cm³ | Tempo: {Math.floor(calc.timeMinutes / 60)}h {calc.timeMinutes % 60}min
              </div>
            </div>
          </div>

          {/* ROI Máquina */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-green-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Custo de Máquina (ROI)
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor Máquina (R$)</label>
                <Input type="number" value={calc.machineValue} onChange={e => set('machineValue', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Pagar em (Meses)</label>
                <Input type="number" value={calc.monthsToPay} onChange={e => set('monthsToPay', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Dias Uso/Mês</label>
                <Input type="number" value={calc.daysPerMonth} onChange={e => set('daysPerMonth', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Horas Uso/Dia</label>
                <Input type="number" value={calc.hoursPerDay} onChange={e => set('hoursPerDay', Number(e.target.value))} />
              </div>
            </div>
            <div className="mt-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground">Depreciação por Hora</p>
              <p className="text-xl font-bold text-green-500">R$ {depreciation.toFixed(3)}</p>
            </div>
          </div>

          {/* Energia & Taxas */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-yellow-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Energia & Taxas
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Custo KWh (R$)</label>
                <Input type="number" step="0.01" value={calc.kwhCost} onChange={e => set('kwhCost', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Potência (Watts)</label>
                <Input type="number" value={calc.watts} onChange={e => set('watts', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Manutenção (%)</label>
                <Input type="number" value={calc.maintenancePercent} onChange={e => set('maintenancePercent', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Falhas (%)</label>
                <Input type="number" value={calc.failurePercent} onChange={e => set('failurePercent', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Acabamento (%)</label>
                <Input type="number" value={calc.finishingPercent} onChange={e => set('finishingPercent', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Fixação (R$)</label>
                <Input type="number" step="0.01" value={calc.fixationCost} onChange={e => set('fixationCost', Number(e.target.value))} />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Lucro Desejado (%)</label>
              <Input type="number" value={calc.profitPercent} onChange={e => set('profitPercent', Number(e.target.value))} className="border-green-300 focus:ring-green-500" />
            </div>
            <button onClick={saveConfig} className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 text-sm font-medium transition-colors">
              <Save className="w-4 h-4" /> Salvar Configurações Padrão
            </button>
          </div>
        </div>

        {/* Coluna Direita - Resultados */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-500" /> Resultado Financeiro
            </h3>

            {quantidade > 1 && (
              <div className="bg-blue-500/10 rounded-lg p-3 mb-4 text-center">
                <p className="text-xs text-muted-foreground">Calculando para {quantidade} peças</p>
              </div>
            )}

            <div className="text-center mb-6 bg-card rounded-xl p-5 border border-border">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Preço de Venda</p>
              <p className="text-4xl font-black text-blue-500">R$ {(salePrice * quantidade).toFixed(2)}</p>
              {quantidade > 1 && <p className="text-xs text-muted-foreground mt-1">R$ {salePrice.toFixed(2)} por unidade</p>}
              <div className="w-12 h-px bg-border mx-auto my-3" />
              <p className="text-xs text-muted-foreground">Custo Total de Produção</p>
              <p className="text-2xl font-bold text-red-500">R$ {(totalCost * quantidade).toFixed(2)}</p>
              {totalCost > 0 && (
                <p className="text-sm text-green-500 mt-1 font-semibold">
                  Lucro: R$ {(lucro * quantidade).toFixed(2)} ({calc.profitPercent}%)
                </p>
              )}
            </div>

            <div className="space-y-0 bg-card rounded-xl border border-border overflow-hidden">
              {[
                { icon: '🧵', label: 'Custo Material', value: matCost },
                { icon: '⚡', label: 'Custo Energia', value: enCost },
                { icon: '🛠️', label: `Manutenção (${calc.maintenancePercent}%)`, value: mntCost },
                { icon: '🏗️', label: 'Depreciação Máquina', value: machCost },
                { icon: '⚠️', label: `Risco/Falha (${calc.failurePercent}%)`, value: failCost },
                { icon: '✨', label: 'Acabamento + Fixação', value: otherCost },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2.5 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    R$ {(item.value * quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={handleSave}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 font-bold text-sm transition-colors">
              <Save className="w-4 h-4" /> Registrar na Produção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ CALCULADORA RESINA ============
function CalculadoraResina({ onSave }: { onSave: (data: Partial<ProducaoRecord>) => void }) {
  const [calc, setCalc] = useState<CalcResina>({
    horas: 0, minutos: 0, segundos: 0,
    valorResinaLitro: 120, quantidadeML: 0,
    valorMaquinario: 3700, vidaUtil: 2000,
    consumoWatts: 72, custoLimpeza: 2,
    custoKwh: 0.75, margemLucro: 100
  });
  const [tipoResina, setTipoResina] = useState('standard');
  const [nomePeca, setNomePeca] = useState('');
  const [cliente, setCliente] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [impressora, setImpressora] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('calc_resina_config');
    if (saved) {
      const c = JSON.parse(saved);
      setCalc(prev => ({ ...prev, ...c }));
    }
  }, []);

  const tempoTotalHoras = calc.horas + (calc.minutos / 60) + (calc.segundos / 3600);
  const totalResina = (calc.valorResinaLitro * calc.quantidadeML) / 1000;
  const totalEnergia = (tempoTotalHoras * calc.consumoWatts * calc.custoKwh) / 1000;
  const custoMaquinaPorHora = calc.vidaUtil > 0 ? calc.valorMaquinario / calc.vidaUtil : 0;
  const custoMaquina = custoMaquinaPorHora * tempoTotalHoras;
  const custoLiquido = totalResina + totalEnergia + custoMaquina + calc.custoLimpeza;
  const precoVenda = custoLiquido * (1 + calc.margemLucro / 100);
  const lucro = precoVenda - custoLiquido;

  const set = (field: keyof CalcResina, value: number) =>
    setCalc(prev => ({ ...prev, [field]: value }));

  const saveConfig = () => {
    localStorage.setItem('calc_resina_config', JSON.stringify(calc));
    alert('Configurações de Resina salvas!');
  };

  const handleSave = () => {
    if (!nomePeca) { alert('Informe o nome da peça'); return; }
    const tempoMin = Math.round(tempoTotalHoras * 60);
    onSave({
      nome_peca: nomePeca, cliente, tipo: 'resina',
      material: RESIN_TYPES.find(r => r.value === tipoResina)?.label || tipoResina,
      quantidade, peso_gramas: calc.quantidadeML,
      tempo_minutos: tempoMin,
      custo_material: totalResina * quantidade,
      custo_energia: totalEnergia * quantidade,
      custo_maquina: custoMaquina * quantidade,
      custo_total: custoLiquido * quantidade,
      preco_venda: precoVenda * quantidade,
      lucro: lucro * quantidade,
      impressora_usada: impressora,
    });
    setNomePeca(''); setCliente(''); setQuantidade(1);
  };

  return (
    <div className="space-y-6">
      {/* Identificação */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-500" /> Identificação da Peça
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Nome da Peça *</label>
            <Input value={nomePeca} onChange={e => setNomePeca(e.target.value)} placeholder="Ex: Miniatura dragão 75mm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Cliente</label>
            <Input value={cliente} onChange={e => setCliente(e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo de Resina</label>
            <select value={tipoResina} onChange={e => setTipoResina(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-purple-500">
              {RESIN_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Quantidade</label>
            <Input type="number" min="1" value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Impressora Usada</label>
            <Input value={impressora} onChange={e => setImpressora(e.target.value)} placeholder="Ex: Elegoo Saturn 4 Ultra 12K" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Tempo */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-purple-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Tempo de Impressão
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Horas</label>
                <Input type="number" min="0" value={calc.horas || ''} onChange={e => set('horas', Number(e.target.value))} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Minutos</label>
                <Input type="number" min="0" max="59" value={calc.minutos || ''} onChange={e => set('minutos', Number(e.target.value))} placeholder="0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Segundos</label>
                <Input type="number" min="0" max="59" value={calc.segundos || ''} onChange={e => set('segundos', Number(e.target.value))} placeholder="0" />
              </div>
            </div>
            <div className="mt-3 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2 text-center">
              Total: {calc.horas}h {calc.minutos}min {calc.segundos}s = {tempoTotalHoras.toFixed(2)} horas
            </div>
          </div>

          {/* Resina */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-purple-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Droplets className="w-4 h-4" /> Quantidade de Resina
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor por Litro (R$)</label>
                <Input type="number" min="0" step="0.01" value={calc.valorResinaLitro || ''} onChange={e => set('valorResinaLitro', Number(e.target.value))} placeholder="120" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Quantidade (ml)</label>
                <Input type="number" min="0" value={calc.quantidadeML || ''} onChange={e => set('quantidadeML', Number(e.target.value))} placeholder="0" />
              </div>
            </div>
          </div>

          {/* Máquina */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-bold text-green-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Custo da Máquina
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Valor Maquinário (R$)</label>
                <Input type="number" min="0" value={calc.valorMaquinario} onChange={e => set('valorMaquinario', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Vida Útil (horas)</label>
                <Input type="number" min="0" value={calc.vidaUtil} onChange={e => set('vidaUtil', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Consumo (Watts)</label>
                <Input type="number" min="0" value={calc.consumoWatts} onChange={e => set('consumoWatts', Number(e.target.value))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Custo KWh (R$)</label>
                <Input type="number" min="0" step="0.01" value={calc.custoKwh} onChange={e => set('custoKwh', Number(e.target.value))} />
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Custo Limpeza/Lavagem (R$)</label>
              <Input type="number" min="0" step="0.01" value={calc.custoLimpeza} onChange={e => set('custoLimpeza', Number(e.target.value))} />
            </div>
            <div className="mt-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Margem de Lucro (%)</label>
              <Input type="number" min="0" value={calc.margemLucro} onChange={e => set('margemLucro', Number(e.target.value))} className="border-green-300 focus:ring-green-500" />
            </div>
            <button onClick={saveConfig} className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 text-sm font-medium transition-colors">
              <Save className="w-4 h-4" /> Salvar Configurações Padrão
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> Resultado Financeiro
            </h3>

            <div className="text-center mb-6 bg-card rounded-xl p-5 border border-border">
              <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Preço de Venda</p>
              <p className="text-4xl font-black text-purple-500">R$ {(precoVenda * quantidade).toFixed(2)}</p>
              {quantidade > 1 && <p className="text-xs text-muted-foreground mt-1">R$ {precoVenda.toFixed(2)} por unidade</p>}
              <div className="w-12 h-px bg-border mx-auto my-3" />
              <p className="text-xs text-muted-foreground">Custo Total de Produção</p>
              <p className="text-2xl font-bold text-red-500">R$ {(custoLiquido * quantidade).toFixed(2)}</p>
              {custoLiquido > 0 && (
                <p className="text-sm text-green-500 mt-1 font-semibold">
                  Lucro: R$ {(lucro * quantidade).toFixed(2)} ({calc.margemLucro}%)
                </p>
              )}
            </div>

            <div className="space-y-0 bg-card rounded-xl border border-border overflow-hidden">
              {[
                { icon: '🧪', label: 'Custo Resina', value: totalResina },
                { icon: '⚡', label: 'Custo Energia', value: totalEnergia },
                { icon: '🏗️', label: 'Depreciação Máquina', value: custoMaquina },
                { icon: '🧴', label: 'Limpeza/Lavagem', value: calc.custoLimpeza },
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center px-4 py-2.5 border-b border-border last:border-0">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    R$ {(item.value * quantidade).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <button onClick={handleSave}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold text-sm transition-colors">
              <Save className="w-4 h-4" /> Registrar na Produção
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ COMPONENTE PRINCIPAL ============
export default function AdminProducao() {
  const [tab, setTab] = useState<'lista' | 'nova_fdm' | 'nova_resina'>('lista');
  const [producoes, setProducoes] = useState<ProducaoRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_producoes');
    if (saved) setProducoes(JSON.parse(saved));
  }, []);

  const saveProducoes = (data: ProducaoRecord[]) => {
    setProducoes(data);
    localStorage.setItem('admin_producoes', JSON.stringify(data));
  };

  const handleSaveProducao = (data: Partial<ProducaoRecord>) => {
    // Verificar estoque de material
    const estoqueData = localStorage.getItem('estoque_materiais');
    const estoque = estoqueData ? JSON.parse(estoqueData) : [];
    const materialNome = (data.material || '').toLowerCase();
    const itemEstoque = estoque.find((e: any) => e.nome.toLowerCase().includes(materialNome));
    if (itemEstoque && itemEstoque.quantidade <= 0) {
      alert(`Material "${itemEstoque.nome}" está com estoque zerado! Adicione estoque antes de produzir.`);
      return;
    }

    const newRecord: ProducaoRecord = {
      id: `prod_${Date.now()}`,
      nome_peca: data.nome_peca || '',
      cliente: data.cliente || '',
      tipo: data.tipo || 'fdm',
      material: data.material || '',
      quantidade: data.quantidade || 1,
      peso_gramas: data.peso_gramas || 0,
      tempo_minutos: data.tempo_minutos || 0,
      custo_material: data.custo_material || 0,
      custo_energia: data.custo_energia || 0,
      custo_maquina: data.custo_maquina || 0,
      custo_total: data.custo_total || 0,
      preco_venda: data.preco_venda || 0,
      lucro: data.lucro || 0,
      status: 'pendente',
      data_criacao: new Date().toISOString(),
      impressora_usada: data.impressora_usada || '',
    };

    // Dar baixa no estoque
    if (itemEstoque && data.peso_gramas) {
      const novaQtd = Math.max(0, itemEstoque.quantidade - (data.peso_gramas * (data.quantidade || 1)));
      const novoStatus = novaQtd <= 0 ? 'critico' : novaQtd <= itemEstoque.estoqueMinimo ? 'baixo' : 'normal';
      const estoqueAtualizado = estoque.map((e: any) => e.id === itemEstoque.id ? {
        ...e, quantidade: novaQtd, status: novoStatus,
        movimentacoes: [...(e.movimentacoes || []), { data: new Date().toISOString(), tipo: 'saida', qtd: data.peso_gramas * (data.quantidade || 1), obs: `Produção: ${data.nome_peca}` }]
      } : e);
      localStorage.setItem('estoque_materiais', JSON.stringify(estoqueAtualizado));
    }

    // Adicionar horas à impressora
    if (data.impressora_usada && data.tempo_minutos) {
      const impData = localStorage.getItem('admin_impressoras_3d');
      if (impData) {
        const impressoras = JSON.parse(impData);
        const horasAdd = (data.tempo_minutos * (data.quantidade || 1)) / 60;
        const impAtualizada = impressoras.map((imp: any) => {
          if (data.impressora_usada?.includes(imp.apelido)) {
            return { ...imp, horasTrabalhadas: (imp.horasTrabalhadas || 0) + horasAdd };
          }
          return imp;
        });
        localStorage.setItem('admin_impressoras_3d', JSON.stringify(impAtualizada));
      }
    }

    const updated = [newRecord, ...producoes];
    saveProducoes(updated);
    setTab('lista');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este registro de produção?')) {
      saveProducoes(producoes.filter(p => p.id !== id));
    }
  };

  const handleStatusChange = (id: string, status: ProducaoRecord['status']) => {
    const updated = producoes.map(p => p.id === id ? {
      ...p, status,
      data_conclusao: status === 'concluida' ? new Date().toISOString() : p.data_conclusao
    } : p);
    saveProducoes(updated);
    setEditingStatus(null);
  };

  const filtered = producoes.filter(p => {
    const matchSearch = p.nome_peca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.material.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'todos' || p.status === filterStatus;
    const matchTipo = filterTipo === 'todos' || p.tipo === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  const stats = {
    total: producoes.length,
    pendente: producoes.filter(p => p.status === 'pendente').length,
    em_producao: producoes.filter(p => p.status === 'em_producao').length,
    concluida: producoes.filter(p => p.status === 'concluida').length,
    faturamento: producoes.filter(p => p.status === 'concluida').reduce((sum, p) => sum + p.preco_venda, 0),
    lucro_total: producoes.filter(p => p.status === 'concluida').reduce((sum, p) => sum + p.lucro, 0),
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
      pendente: { label: 'Pendente', cls: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', icon: <Clock className="w-3 h-3" /> },
      em_producao: { label: 'Em Produção', cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: <Factory className="w-3 h-3" /> },
      concluida: { label: 'Concluída', cls: 'bg-green-500/10 text-green-600 border-green-500/20', icon: <CheckCircle className="w-3 h-3" /> },
      cancelada: { label: 'Cancelada', cls: 'bg-red-500/10 text-red-600 border-red-500/20', icon: <AlertCircle className="w-3 h-3" /> },
    };
    const s = map[status] || map.pendente;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${s.cls}`}>
        {s.icon} {s.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Produção" />
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total', value: stats.total, icon: <Box className="w-4 h-4" />, color: 'text-foreground' },
              { label: 'Pendentes', value: stats.pendente, icon: <Clock className="w-4 h-4" />, color: 'text-yellow-500' },
              { label: 'Em Produção', value: stats.em_producao, icon: <Factory className="w-4 h-4" />, color: 'text-blue-500' },
              { label: 'Concluídas', value: stats.concluida, icon: <CheckCircle className="w-4 h-4" />, color: 'text-green-500' },
              { label: 'Faturamento', value: `R$ ${stats.faturamento.toFixed(0)}`, icon: <DollarSign className="w-4 h-4" />, color: 'text-primary' },
              { label: 'Lucro Total', value: `R$ ${stats.lucro_total.toFixed(0)}`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-green-500' },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4">
                <div className={`flex items-center gap-2 ${s.color} mb-1`}>{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            {[
              { key: 'lista', label: 'Lista de Produção', icon: <Factory className="w-4 h-4" /> },
              { key: 'nova_fdm', label: '+ Nova FDM', icon: <Layers className="w-4 h-4" /> },
              { key: 'nova_resina', label: '+ Nova Resina', icon: <Droplets className="w-4 h-4" /> },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key as typeof tab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Conteúdo */}
          <AnimatePresence mode="wait">
            {tab === 'lista' && (
              <motion.div key="lista" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar por peça, cliente ou material..." value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                    <option value="todos">Todos os Status</option>
                    <option value="pendente">Pendente</option>
                    <option value="em_producao">Em Produção</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                  <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                    <option value="todos">FDM + Resina</option>
                    <option value="fdm">Apenas FDM</option>
                    <option value="resina">Apenas Resina</option>
                  </select>
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
                    <Factory className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <p className="text-muted-foreground font-medium">Nenhum registro encontrado.</p>
                    <p className="text-sm text-muted-foreground mt-1">Use as abas acima para registrar uma nova produção com cálculo de custo.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((p, idx) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                        <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4 flex-1">
                              <div className={`p-2.5 rounded-lg ${p.tipo === 'fdm' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                                {p.tipo === 'fdm' ? <Layers className={`w-5 h-5 text-blue-500`} /> : <Droplets className="w-5 h-5 text-purple-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h3 className="font-semibold text-foreground">{p.nome_peca}</h3>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.tipo === 'fdm' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                    {p.tipo.toUpperCase()}
                                  </span>
                                  {getStatusBadge(p.status)}
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                                  {p.cliente && <span>👤 {p.cliente}</span>}
                                  <span>🧵 {p.material}</span>
                                  <span>📦 Qtd: {p.quantidade}</span>
                                  {p.impressora_usada && <span>🖨️ {p.impressora_usada}</span>}
                                  <span>⚖️ {p.peso_gramas}g</span>
                                  <span>⏱️ {Math.floor(p.tempo_minutos / 60)}h{p.tempo_minutos % 60}min</span>
                                  <span>📅 {new Date(p.data_criacao).toLocaleDateString('pt-BR')}</span>
                                  {p.data_conclusao && <span>✅ {new Date(p.data_conclusao).toLocaleDateString('pt-BR')}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Custo</p>
                                <p className="font-bold text-red-500">R$ {p.custo_total.toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Venda</p>
                                <p className="font-bold text-primary">R$ {p.preco_venda.toFixed(2)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Lucro</p>
                                <p className="font-bold text-green-500">R$ {p.lucro.toFixed(2)}</p>
                              </div>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border flex-wrap">
                            <span className="text-xs text-muted-foreground mr-auto">Alterar status:</span>
                            {(['pendente', 'em_producao', 'concluida', 'cancelada'] as const).map(s => (
                              <button key={s} onClick={() => handleStatusChange(p.id, s)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                  p.status === s ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                                }`}>
                                {s === 'pendente' ? 'Pendente' : s === 'em_producao' ? 'Em Produção' : s === 'concluida' ? 'Concluída' : 'Cancelada'}
                              </button>
                            ))}
                            <button onClick={() => handleDelete(p.id)}
                              className="ml-2 p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'nova_fdm' && (
              <motion.div key="nova_fdm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">Calculadora FDM — Preencha os dados da peça e clique em "Registrar na Produção" para salvar com todos os custos calculados.</p>
                </div>
                <CalculadoraFDM onSave={handleSaveProducao} />
              </motion.div>
            )}

            {tab === 'nova_resina' && (
              <motion.div key="nova_resina" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">Calculadora Resina — Preencha os dados da peça e clique em "Registrar na Produção" para salvar com todos os custos calculados.</p>
                </div>
                <CalculadoraResina onSave={handleSaveProducao} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

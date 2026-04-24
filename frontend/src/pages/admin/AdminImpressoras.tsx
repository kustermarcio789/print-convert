import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer, Plus, Trash2, Edit, Save, X, Clock, Wrench, AlertTriangle,
  CheckCircle, DollarSign, Calendar, Zap, TrendingUp, Package, ChevronDown,
  ChevronUp, Bell, Settings, BarChart3, Info, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import PainelImpressorasConectadas from '@/components/admin/impressora/PainelImpressorasConectadas';

// ============ INTERFACES ============
interface Manutencao {
  id: string;
  data: string;
  tipo: 'preventiva' | 'corretiva' | 'upgrade';
  descricao: string;
  custo: number;
  componentes: string;
  tecnico: string;
  proximaManutencao?: string;
  horasNaManutencao?: number;
}

interface Impressora {
  id: string;
  nome: string;
  marca: string;
  modelo: string;
  tipo: 'fdm' | 'resina';
  status: 'ativa' | 'manutencao' | 'inativa' | 'defeito';
  dataCompra: string;
  valorCompra: number;
  potenciaWatts: number;
  volumeImpressao: string;
  firmware: string;
  horasTotais: number;
  horasDesdeUltimaManutencao: number;
  intervaloManutencao: number; // horas
  foto?: string;
  observacoes: string;
  manutencoes: Manutencao[];
  custoTotalManutencao: number;
  ultimaManutencao?: string;
  proximaManutencao?: string;
}

const IMPRESSORAS_PADRAO: Impressora[] = [
  {
    id: 'imp_1', nome: 'Sovol SV08 MAX', marca: 'Sovol', modelo: 'SV08 MAX',
    tipo: 'fdm', status: 'ativa', dataCompra: '', valorCompra: 15000,
    potenciaWatts: 500, volumeImpressao: '500×500×500mm', firmware: 'Klipper',
    horasTotais: 0, horasDesdeUltimaManutencao: 0, intervaloManutencao: 200,
    foto: '', observacoes: '', manutencoes: [], custoTotalManutencao: 0,
  },
];

// ============ MODAL NOVA IMPRESSORA ============
function ModalImpressora({
  impressora, onSave, onClose
}: {
  impressora?: Impressora | null;
  onSave: (data: Impressora) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Impressora>(impressora || {
    id: `imp_${Date.now()}`,
    nome: '', marca: '', modelo: '', tipo: 'fdm', status: 'ativa',
    dataCompra: '', valorCompra: 0, potenciaWatts: 0, volumeImpressao: '',
    firmware: 'Klipper', horasTotais: 0, horasDesdeUltimaManutencao: 0,
    intervaloManutencao: 200, foto: '', observacoes: '',
    manutencoes: [], custoTotalManutencao: 0,
  });

  const set = (field: keyof Impressora, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => set('foto', ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            {impressora ? 'Editar Impressora' : 'Nova Impressora'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Foto */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/30 overflow-hidden flex-shrink-0">
              {form.foto ? (
                <img src={form.foto} alt="Impressora" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Foto da Impressora</label>
              <input type="file" accept="image/*" onChange={handleFoto}
                className="text-xs text-muted-foreground file:mr-2 file:px-3 file:py-1 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-xs file:cursor-pointer" />
            </div>
          </div>

          {/* Identificação */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">Nome / Apelido *</label>
              <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Voron 2.4 350mm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Marca</label>
              <Input value={form.marca} onChange={e => set('marca', e.target.value)} placeholder="Ex: Sovol, Elegoo" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Modelo</label>
              <Input value={form.modelo} onChange={e => set('modelo', e.target.value)} placeholder="Ex: SV08 MAX" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="fdm">FDM (Filamento)</option>
                <option value="resina">Resina (SLA/MSLA)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="ativa">Ativa</option>
                <option value="manutencao">Em Manutenção</option>
                <option value="inativa">Inativa</option>
                <option value="defeito">Com Defeito</option>
              </select>
            </div>
          </div>

          {/* Especificações */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Volume de Impressão</label>
              <Input value={form.volumeImpressao} onChange={e => set('volumeImpressao', e.target.value)} placeholder="Ex: 350×350×350mm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Firmware</label>
              <Input value={form.firmware} onChange={e => set('firmware', e.target.value)} placeholder="Klipper, Marlin..." />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Potência (Watts)</label>
              <Input type="number" value={form.potenciaWatts || ''} onChange={e => set('potenciaWatts', Number(e.target.value))} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Data de Compra</label>
              <Input type="date" value={form.dataCompra} onChange={e => set('dataCompra', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Valor de Compra (R$)</label>
              <Input type="number" value={form.valorCompra || ''} onChange={e => set('valorCompra', Number(e.target.value))} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Horas Totais Trabalhadas</label>
              <Input type="number" value={form.horasTotais || ''} onChange={e => set('horasTotais', Number(e.target.value))} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Horas desde Última Manutenção</label>
              <Input type="number" value={form.horasDesdeUltimaManutencao || ''} onChange={e => set('horasDesdeUltimaManutencao', Number(e.target.value))} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Intervalo de Manutenção (horas)</label>
              <Input type="number" value={form.intervaloManutencao || ''} onChange={e => set('intervaloManutencao', Number(e.target.value))} placeholder="200" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Observações</label>
            <textarea value={form.observacoes} onChange={e => set('observacoes', e.target.value)}
              rows={3} placeholder="Modificações, upgrades instalados, notas..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground resize-none focus:ring-2 focus:ring-primary" />
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => {
            if (!form.nome) { alert('Informe o nome da impressora'); return; }
            onSave(form);
          }} className="flex-1 gap-2">
            <Save className="w-4 h-4" /> Salvar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ============ MODAL MANUTENÇÃO ============
function ModalManutencao({
  impressoraId, onSave, onClose
}: {
  impressoraId: string;
  onSave: (manutencao: Manutencao) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Manutencao>({
    id: `mnt_${Date.now()}`,
    data: new Date().toISOString().split('T')[0],
    tipo: 'preventiva', descricao: '', custo: 0,
    componentes: '', tecnico: '', proximaManutencao: '', horasNaManutencao: 0,
  });

  const set = (field: keyof Manutencao, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Wrench className="w-5 h-5 text-orange-500" /> Registrar Manutenção
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Data da Manutenção</label>
              <Input type="date" value={form.data} onChange={e => set('data', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Tipo</label>
              <select value={form.tipo} onChange={e => set('tipo', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
                <option value="upgrade">Upgrade / Melhoria</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Descrição do Serviço *</label>
            <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)}
              rows={3} placeholder="Descreva o que foi feito..."
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground resize-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Componentes Trocados/Usados</label>
            <Input value={form.componentes} onChange={e => set('componentes', e.target.value)}
              placeholder="Ex: Bico 0.4mm, correia GT2, termistor NTC..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Custo Total (R$)</label>
              <Input type="number" step="0.01" value={form.custo || ''} onChange={e => set('custo', Number(e.target.value))} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Horas na Manutenção</label>
              <Input type="number" step="0.5" value={form.horasNaManutencao || ''} onChange={e => set('horasNaManutencao', Number(e.target.value))} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Técnico Responsável</label>
              <Input value={form.tecnico} onChange={e => set('tecnico', e.target.value)} placeholder="Nome do técnico" />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">Próxima Manutenção (data)</label>
              <Input type="date" value={form.proximaManutencao} onChange={e => set('proximaManutencao', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-border">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={() => {
            if (!form.descricao) { alert('Informe a descrição'); return; }
            onSave(form);
          }} className="flex-1 gap-2 bg-orange-500 hover:bg-orange-600">
            <Save className="w-4 h-4" /> Salvar Manutenção
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ============ CARD IMPRESSORA ============
function CardImpressora({
  impressora, onEdit, onDelete, onAddManutencao, onUpdateHoras
}: {
  impressora: Impressora;
  onEdit: () => void;
  onDelete: () => void;
  onAddManutencao: () => void;
  onUpdateHoras: (horas: number) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [addingHoras, setAddingHoras] = useState(false);
  const [horasAdd, setHorasAdd] = useState(0);

  const percentManutencao = impressora.intervaloManutencao > 0
    ? Math.min(100, (impressora.horasDesdeUltimaManutencao / impressora.intervaloManutencao) * 100)
    : 0;

  const precisaManutencao = percentManutencao >= 80;
  const urgente = percentManutencao >= 100;

  const statusColors: Record<string, string> = {
    ativa: 'bg-green-500/10 text-green-500 border-green-500/20',
    manutencao: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    inativa: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
    defeito: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const statusLabels: Record<string, string> = {
    ativa: 'Ativa', manutencao: 'Em Manutenção', inativa: 'Inativa', defeito: 'Com Defeito'
  };

  const tipoColors: Record<string, string> = {
    fdm: 'bg-blue-500/10 text-blue-500',
    resina: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <div className={`bg-card border rounded-xl overflow-hidden transition-all ${
      urgente ? 'border-red-500/50' : precisaManutencao ? 'border-orange-500/50' : 'border-border'
    }`}>
      {/* Alerta */}
      {urgente && (
        <div className="bg-red-500/10 border-b border-red-500/20 px-4 py-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-red-500">MANUTENÇÃO URGENTE — Limite de {impressora.intervaloManutencao}h atingido!</span>
        </div>
      )}
      {!urgente && precisaManutencao && (
        <div className="bg-orange-500/10 border-b border-orange-500/20 px-4 py-2 flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-orange-500">Manutenção preventiva recomendada em breve ({Math.round(percentManutencao)}% do intervalo)</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Foto */}
          <div className="w-16 h-16 rounded-xl bg-secondary/50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {impressora.foto ? (
              <img src={impressora.foto} alt={impressora.nome} className="w-full h-full object-cover" />
            ) : (
              <Printer className={`w-8 h-8 ${impressora.tipo === 'fdm' ? 'text-blue-500' : 'text-purple-500'}`} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-foreground">{impressora.nome}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColors[impressora.tipo]}`}>
                {impressora.tipo.toUpperCase()}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${statusColors[impressora.status]}`}>
                {statusLabels[impressora.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{impressora.marca} {impressora.modelo}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
              {impressora.volumeImpressao && <span>📐 {impressora.volumeImpressao}</span>}
              {impressora.firmware && <span>⚙️ {impressora.firmware}</span>}
              {impressora.potenciaWatts > 0 && <span>⚡ {impressora.potenciaWatts}W</span>}
              {impressora.dataCompra && <span>📅 Compra: {new Date(impressora.dataCompra).toLocaleDateString('pt-BR')}</span>}
              {impressora.valorCompra > 0 && <span>💰 R$ {impressora.valorCompra.toLocaleString('pt-BR')}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            <button onClick={onEdit} className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground">
              <Edit className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-muted-foreground hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horas e Manutenção */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Horas Totais</p>
            <p className="text-xl font-bold text-foreground">{impressora.horasTotais.toFixed(0)}h</p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Desde Manutenção</p>
            <p className={`text-xl font-bold ${urgente ? 'text-red-500' : precisaManutencao ? 'text-orange-500' : 'text-foreground'}`}>
              {impressora.horasDesdeUltimaManutencao.toFixed(0)}h
            </p>
          </div>
          <div className="bg-secondary/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Custo Manutenção</p>
            <p className="text-xl font-bold text-orange-500">R$ {impressora.custoTotalManutencao.toFixed(0)}</p>
          </div>
        </div>

        {/* Barra de progresso manutenção */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Intervalo de manutenção ({impressora.intervaloManutencao}h)</span>
            <span>{Math.round(percentManutencao)}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${
              urgente ? 'bg-red-500' : percentManutencao >= 80 ? 'bg-orange-500' : 'bg-green-500'
            }`} style={{ width: `${Math.min(100, percentManutencao)}%` }} />
          </div>
        </div>

        {/* Adicionar horas */}
        {addingHoras ? (
          <div className="mt-3 flex gap-2">
            <Input type="number" step="0.5" min="0" value={horasAdd || ''} onChange={e => setHorasAdd(Number(e.target.value))}
              placeholder="Horas a adicionar" className="flex-1" />
            <Button size="sm" onClick={() => { onUpdateHoras(horasAdd); setHorasAdd(0); setAddingHoras(false); }}>
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setAddingHoras(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            <button onClick={() => setAddingHoras(true)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-medium text-foreground transition-colors">
              <Clock className="w-3.5 h-3.5" /> + Adicionar Horas
            </button>
            <button onClick={onAddManutencao}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/10 hover:bg-orange-500/20 rounded-lg text-xs font-medium text-orange-500 transition-colors border border-orange-500/20">
              <Wrench className="w-3.5 h-3.5" /> Registrar Manutenção
            </button>
          </div>
        )}

        {/* Histórico de manutenções */}
        {impressora.manutencoes.length > 0 && (
          <div className="mt-3">
            <button onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 rounded-lg text-xs font-medium text-foreground hover:bg-secondary transition-colors">
              <span className="flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5 text-orange-500" />
                Histórico de Manutenções ({impressora.manutencoes.length})
              </span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-2 space-y-2">
                    {[...impressora.manutencoes].reverse().map(m => (
                      <div key={m.id} className="bg-secondary/30 rounded-lg p-3 border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            m.tipo === 'preventiva' ? 'bg-blue-500/10 text-blue-500' :
                            m.tipo === 'corretiva' ? 'bg-red-500/10 text-red-500' :
                            'bg-green-500/10 text-green-500'
                          }`}>
                            {m.tipo === 'preventiva' ? 'Preventiva' : m.tipo === 'corretiva' ? 'Corretiva' : 'Upgrade'}
                          </span>
                          <span className="text-xs text-muted-foreground">{new Date(m.data).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <p className="text-sm text-foreground font-medium">{m.descricao}</p>
                        {m.componentes && (
                          <p className="text-xs text-muted-foreground mt-1">🔧 {m.componentes}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {m.custo > 0 && <span className="text-orange-500 font-medium">💰 R$ {m.custo.toFixed(2)}</span>}
                          {m.tecnico && <span>👤 {m.tecnico}</span>}
                          {m.horasNaManutencao && m.horasNaManutencao > 0 && <span>⏱️ {m.horasNaManutencao}h</span>}
                          {m.proximaManutencao && <span>📅 Próxima: {new Date(m.proximaManutencao).toLocaleDateString('pt-BR')}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ COMPONENTE PRINCIPAL ============
export default function AdminImpressoras() {
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [modalImpressora, setModalImpressora] = useState<Impressora | null | undefined>(undefined);
  const [modalManutencaoId, setModalManutencaoId] = useState<string | null>(null);
  const [filterTipo, setFilterTipo] = useState<'todos' | 'fdm' | 'resina'>('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  useEffect(() => {
    const saved = localStorage.getItem('admin_impressoras');
    if (saved) setImpressoras(JSON.parse(saved));
  }, []);

  const save = (data: Impressora[]) => {
    setImpressoras(data);
    localStorage.setItem('admin_impressoras', JSON.stringify(data));
  };

  const handleSaveImpressora = (imp: Impressora) => {
    const existing = impressoras.find(i => i.id === imp.id);
    if (existing) {
      save(impressoras.map(i => i.id === imp.id ? imp : i));
    } else {
      save([...impressoras, imp]);
    }
    setModalImpressora(undefined);
  };

  const handleDeleteImpressora = (id: string) => {
    if (window.confirm('Excluir esta impressora?')) {
      save(impressoras.filter(i => i.id !== id));
    }
  };

  const handleAddManutencao = (impressoraId: string, manutencao: Manutencao) => {
    save(impressoras.map(imp => {
      if (imp.id !== impressoraId) return imp;
      return {
        ...imp,
        manutencoes: [...imp.manutencoes, manutencao],
        custoTotalManutencao: imp.custoTotalManutencao + manutencao.custo,
        horasDesdeUltimaManutencao: 0,
        ultimaManutencao: manutencao.data,
        proximaManutencao: manutencao.proximaManutencao,
      };
    }));
    setModalManutencaoId(null);
  };

  const handleUpdateHoras = (impressoraId: string, horas: number) => {
    save(impressoras.map(imp => {
      if (imp.id !== impressoraId) return imp;
      return {
        ...imp,
        horasTotais: imp.horasTotais + horas,
        horasDesdeUltimaManutencao: imp.horasDesdeUltimaManutencao + horas,
      };
    }));
  };

  const filtered = impressoras.filter(imp => {
    const matchTipo = filterTipo === 'todos' || imp.tipo === filterTipo;
    const matchStatus = filterStatus === 'todos' || imp.status === filterStatus;
    return matchTipo && matchStatus;
  });

  const stats = {
    total: impressoras.length,
    ativas: impressoras.filter(i => i.status === 'ativa').length,
    fdm: impressoras.filter(i => i.tipo === 'fdm').length,
    resina: impressoras.filter(i => i.tipo === 'resina').length,
    precisamManutencao: impressoras.filter(i => i.intervaloManutencao > 0 && (i.horasDesdeUltimaManutencao / i.intervaloManutencao) >= 0.8).length,
    horasTotais: impressoras.reduce((sum, i) => sum + i.horasTotais, 0),
    custoManutencao: impressoras.reduce((sum, i) => sum + i.custoTotalManutencao, 0),
    valorTotal: impressoras.reduce((sum, i) => sum + i.valorCompra, 0),
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <AdminHeader title="Minhas Impressoras" />
        <div className="p-6 max-w-7xl mx-auto space-y-6">

          {/* Painel ao vivo (telemetria + controle) */}
          <PainelImpressorasConectadas />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Total', value: stats.total, color: 'text-foreground', icon: <Printer className="w-4 h-4" /> },
              { label: 'Ativas', value: stats.ativas, color: 'text-green-500', icon: <CheckCircle className="w-4 h-4" /> },
              { label: 'FDM', value: stats.fdm, color: 'text-blue-500', icon: <Settings className="w-4 h-4" /> },
              { label: 'Resina', value: stats.resina, color: 'text-purple-500', icon: <Package className="w-4 h-4" /> },
              { label: 'Manutenção', value: stats.precisamManutencao, color: stats.precisamManutencao > 0 ? 'text-orange-500' : 'text-foreground', icon: <AlertTriangle className="w-4 h-4" /> },
              { label: 'Horas Totais', value: `${stats.horasTotais.toFixed(0)}h`, color: 'text-primary', icon: <Clock className="w-4 h-4" /> },
              { label: 'Custo Mnt.', value: `R$${stats.custoManutencao.toFixed(0)}`, color: 'text-orange-500', icon: <Wrench className="w-4 h-4" /> },
              { label: 'Valor Frota', value: `R$${(stats.valorTotal / 1000).toFixed(0)}k`, color: 'text-primary', icon: <DollarSign className="w-4 h-4" /> },
            ].map((s, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-3">
                <div className={`flex items-center gap-1.5 ${s.color} mb-1`}>{s.icon}<span className="text-xs font-medium">{s.label}</span></div>
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Header com filtros e botão */}
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            <div className="flex gap-2">
              {(['todos', 'fdm', 'resina'] as const).map(t => (
                <button key={t} onClick={() => setFilterTipo(t)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterTipo === t ? 'bg-primary text-white' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}>
                  {t === 'todos' ? 'Todas' : t === 'fdm' ? 'FDM' : 'Resina'}
                </button>
              ))}
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground">
                <option value="todos">Todos os Status</option>
                <option value="ativa">Ativa</option>
                <option value="manutencao">Em Manutenção</option>
                <option value="inativa">Inativa</option>
                <option value="defeito">Com Defeito</option>
              </select>
            </div>
            <Button onClick={() => setModalImpressora(null)} className="gap-2">
              <Plus className="w-4 h-4" /> Nova Impressora
            </Button>
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-card border border-dashed border-border rounded-xl">
              <Printer className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <p className="text-muted-foreground font-medium">Nenhuma impressora cadastrada.</p>
              <p className="text-sm text-muted-foreground mt-1">Clique em "Nova Impressora" para começar.</p>
              <Button onClick={() => setModalImpressora(null)} className="mt-4 gap-2">
                <Plus className="w-4 h-4" /> Cadastrar Primeira Impressora
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filtered.map(imp => (
                <CardImpressora
                  key={imp.id}
                  impressora={imp}
                  onEdit={() => setModalImpressora(imp)}
                  onDelete={() => handleDeleteImpressora(imp.id)}
                  onAddManutencao={() => setModalManutencaoId(imp.id)}
                  onUpdateHoras={(h) => handleUpdateHoras(imp.id, h)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modais */}
      <AnimatePresence>
        {modalImpressora !== undefined && (
          <ModalImpressora
            impressora={modalImpressora}
            onSave={handleSaveImpressora}
            onClose={() => setModalImpressora(undefined)}
          />
        )}
        {modalManutencaoId && (
          <ModalManutencao
            impressoraId={modalManutencaoId}
            onSave={(m) => handleAddManutencao(modalManutencaoId, m)}
            onClose={() => setModalManutencaoId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

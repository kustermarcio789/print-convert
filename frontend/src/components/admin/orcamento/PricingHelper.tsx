import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  PrinterDevice,
  PrinterPricing,
  getPricing,
  listarImpressorasConectadas,
} from '@/lib/printerControl';

interface Props {
  /** Quando o usuário aceita o preço calculado, dispara com o unitário */
  onApply: (valor_unitario: number) => void;
  /** Quantidade já no item, pra mostrar total */
  quantidade?: number;
}

/**
 * Helper de precificação que vive dentro do card de item no orçamento.
 * Usuário escolhe impressora + tempo + filamento → preço unitário automático.
 * "Aplicar" preenche valor_unitario no item.
 */
export default function PricingHelper({ onApply, quantidade = 1 }: Props) {
  const [open, setOpen] = useState(false);
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [printerId, setPrinterId] = useState<string>('');
  const [pricing, setPricing] = useState<PrinterPricing | null>(null);
  const [tempo, setTempo] = useState<number>(2);
  const [filamento, setFilamento] = useState<number>(50);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || printers.length > 0) return;
    listarImpressorasConectadas().then((d) => {
      setPrinters(d);
      if (d.length > 0) setPrinterId(d[0].id);
    });
  }, [open]);

  useEffect(() => {
    if (!printerId) return;
    setLoading(true);
    getPricing(printerId).then((p) => {
      setPricing(p);
      setLoading(false);
    });
  }, [printerId]);

  const calc = useMemo(() => {
    if (!pricing) return null;
    const t = Math.max(tempo, pricing.tempo_minimo_horas || 0);
    const co = t * pricing.custo_hora;
    const cf = (filamento / 1000) * pricing.custo_filamento_kg;
    const cs = pricing.custo_setup;
    const ct = co + cf + cs;
    const mv = ct * (pricing.margem_percentual / 100);
    return {
      operacao: co,
      filamento: cf,
      setup: cs,
      custo: ct,
      margem: mv,
      preco: ct + mv,
    };
  }, [pricing, tempo, filamento]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-2"
      >
        <Calculator className="w-3.5 h-3.5" />
        Calcular preço pela impressora
      </button>
    );
  }

  return (
    <div className="mt-2 border border-blue-200 bg-blue-50/40 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
          <Calculator className="w-4 h-4" /> Calculadora de preço
        </div>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500 hover:text-gray-900">
          fechar
        </button>
      </div>

      {printers.length === 0 ? (
        <div className="text-xs text-gray-600">
          Nenhuma impressora cadastrada na frota. Cadastre primeiro em <code>/admin/impressoras</code>.
        </div>
      ) : (
        <>
          <div>
            <Label>Impressora</Label>
            <select
              value={printerId}
              onChange={(e) => setPrinterId(e.target.value)}
              className="border rounded p-2 text-sm w-full"
            >
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} — {p.modelo}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Tempo de impressão (h)</Label>
              <Input type="number" step="0.1" value={tempo} onChange={(e) => setTempo(parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Filamento (g)</Label>
              <Input type="number" value={filamento} onChange={(e) => setFilamento(parseFloat(e.target.value) || 0)} />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3 h-3 animate-spin" /> carregando precificação...
            </div>
          ) : pricing ? calc && (
            <div className="bg-white rounded p-3 text-xs space-y-1 border">
              <div className="flex justify-between"><span>Operação ({Math.max(tempo, pricing.tempo_minimo_horas).toFixed(2)}h × R${pricing.custo_hora}/h):</span><span>R$ {calc.operacao.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Filamento ({filamento}g × R${pricing.custo_filamento_kg}/kg):</span><span>R$ {calc.filamento.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Setup:</span><span>R$ {calc.setup.toFixed(2)}</span></div>
              <div className="flex justify-between border-t pt-1"><span>Custo:</span><span>R$ {calc.custo.toFixed(2)}</span></div>
              <div className="flex justify-between text-blue-600"><span>Margem ({pricing.margem_percentual}%):</span><span>R$ {calc.margem.toFixed(2)}</span></div>
              <div className="flex justify-between font-semibold text-green-700 border-t pt-1">
                <span>Preço unitário:</span><span>R$ {calc.preco.toFixed(2)}</span>
              </div>
              {quantidade > 1 && (
                <div className="flex justify-between font-semibold">
                  <span>Total ({quantidade}x):</span><span>R$ {(calc.preco * quantidade).toFixed(2)}</span>
                </div>
              )}
              <Button
                size="sm"
                className="w-full mt-2"
                onClick={() => onApply(parseFloat(calc.preco.toFixed(2)))}
              >
                Aplicar como valor unitário
              </Button>
            </div>
          ) : (
            <div className="text-xs text-gray-600">
              Essa impressora ainda não tem precificação configurada. Vá em
              <code> /admin/impressoras → Detalhes → Precificação</code> pra cadastrar custo/hora,
              custo/kg e margem.
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-medium text-gray-600">{children}</div>;
}

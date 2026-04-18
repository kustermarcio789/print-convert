import { useState } from 'react';
import { MapPin, Truck, Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { EnderecoCorreios as EnderecoType, DadosEnvio, ModalidadeEnvio } from '@/types/orcamento';

interface Props {
  endereco: EnderecoType;
  envio: DadosEnvio;
  onChangeEndereco: (endereco: EnderecoType) => void;
  onChangeEnvio: (envio: DadosEnvio) => void;
}

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
const MODALIDADES: ModalidadeEnvio[] = ['SEDEX', 'PAC', 'Transportadora', 'Retirada', 'Motoboy'];

function maskCEP(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export default function EnderecoCorreios({ endereco, envio, onChangeEndereco, onChangeEnvio }: Props) {
  const { toast } = useToast();
  const [buscandoCEP, setBuscandoCEP] = useState(false);

  const update = (patch: Partial<EnderecoType>) => {
    onChangeEndereco({ ...endereco, ...patch });
  };
  const updateEnvio = (patch: Partial<DadosEnvio>) => {
    onChangeEnvio({ ...envio, ...patch });
  };

  const handleBuscarCEP = async () => {
    const cep = (endereco.cep || '').replace(/\D/g, '');
    if (cep.length !== 8) {
      toast({ title: 'CEP inválido', description: 'Digite um CEP com 8 dígitos.', variant: 'destructive' });
      return;
    }
    setBuscandoCEP(true);
    try {
      const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await resp.json();
      if (data.erro) {
        toast({ title: 'CEP não encontrado', variant: 'destructive' });
        return;
      }
      update({
        logradouro: data.logradouro || endereco.logradouro,
        bairro: data.bairro || endereco.bairro,
        cidade: data.localidade || endereco.cidade,
        estado: data.uf || endereco.estado,
      });
      toast({ title: 'Endereço preenchido', description: `${data.localidade}/${data.uf}` });
    } catch (err: any) {
      toast({ title: 'Erro ao buscar CEP', description: err.message, variant: 'destructive' });
    } finally {
      setBuscandoCEP(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Endereço de entrega */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Endereço de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">CEP *</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={endereco.cep || ''}
                  onChange={(e) => update({ cep: maskCEP(e.target.value) })}
                  placeholder="00000-000"
                  maxLength={9}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBuscarCEP}
                  disabled={buscandoCEP || !(endereco.cep || '').match(/^\d{5}-\d{3}$/)}
                  title="Buscar endereço via CEP"
                >
                  {buscandoCEP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Logradouro</Label>
              <Input
                value={endereco.logradouro || ''}
                onChange={(e) => update({ logradouro: e.target.value })}
                placeholder="Rua, avenida, travessa..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs">Número</Label>
              <Input
                value={endereco.numero || ''}
                onChange={(e) => update({ numero: e.target.value })}
                placeholder="123"
                className="mt-1"
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-xs">Complemento</Label>
              <Input
                value={endereco.complemento || ''}
                onChange={(e) => update({ complemento: e.target.value })}
                placeholder="Apto, bloco, sala..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Bairro</Label>
              <Input
                value={endereco.bairro || ''}
                onChange={(e) => update({ bairro: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label className="text-xs">Cidade</Label>
              <Input
                value={endereco.cidade || ''}
                onChange={(e) => update({ cidade: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">UF</Label>
              <Select value={endereco.estado || ''} onValueChange={(v) => update({ estado: v })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {UFS.map(uf => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Ponto de referência</Label>
            <Input
              value={endereco.ponto_referencia || ''}
              onChange={(e) => update({ ponto_referencia: e.target.value })}
              placeholder="Próximo ao mercado, ao lado do posto..."
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dados de envio / correios */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-600" />
            Dados do Envio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Modalidade</Label>
              <Select value={envio.modalidade || ''} onValueChange={(v) => updateEnvio({ modalidade: v as ModalidadeEnvio })}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {MODALIDADES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Valor do frete (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={envio.valor_frete ?? ''}
                onChange={(e) => updateEnvio({ valor_frete: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="0,00"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Prazo (dias)</Label>
              <Input
                type="number"
                value={envio.prazo_dias ?? ''}
                onChange={(e) => updateEnvio({ prazo_dias: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="7"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Transportadora</Label>
              <Input
                value={envio.transportadora || ''}
                onChange={(e) => updateEnvio({ transportadora: e.target.value })}
                placeholder="Correios, Jadlog, Loggi..."
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Código de rastreio (se já enviado)</Label>
              <Input
                value={envio.codigo_rastreio || ''}
                onChange={(e) => updateEnvio({ codigo_rastreio: e.target.value })}
                placeholder="Preencher após envio"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

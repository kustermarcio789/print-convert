export interface EmpresaData {
  nomeFantasia: string;
  razaoSocial: string;
  cnpj: string;
  cpfProprietario: string;
  proprietario: string;
  tipoEmpresa: 'MEI' | 'ME' | 'EPP' | 'LTDA' | 'Outro';
  atividadePrincipalCnae: string;
  atividadePrincipal: string;
  dataAbertura: string;
  situacaoCadastral: string;

  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
  };

  contato: {
    telefone: string;
    email: string;
    site: string;
    whatsapp?: string;
  };

  logoUrl: string;
  logoPath: string;

  textoLegalRodape: string;
}

export const EMPRESA: EmpresaData = {
  nomeFantasia: '3DKPRINT',
  razaoSocial: '62.440.010 JOSE MARCIO KUSTER DE AZEVEDO',
  cnpj: '62.440.010/0001-03',
  cpfProprietario: '069.374.349-28',
  proprietario: 'José Marcio Kuster de Azevedo',
  tipoEmpresa: 'MEI',
  atividadePrincipalCnae: '4751-2/01',
  atividadePrincipal: 'Comércio varejista especializado de equipamentos e suprimentos de informática',
  dataAbertura: '28/08/2025',
  situacaoCadastral: 'ATIVA',

  endereco: {
    cep: '86400-000',
    logradouro: '10ª Rua Santo Antonio',
    numero: '147',
    bairro: 'Vila Santana',
    cidade: 'Jacarezinho',
    uf: 'PR',
  },

  contato: {
    telefone: '+55 (43) 99174-1518',
    whatsapp: '+55 43 99174-1518',
    email: '3dk.print.br@gmail.com',
    site: 'www.3dkprint.com.br',
  },

  logoUrl: 'https://www.3dkprint.com.br/logo-3dkprint.png',
  logoPath: '/logo-3dkprint.png',

  textoLegalRodape:
    'Microempreendedor Individual — CNPJ 62.440.010/0001-03 • ' +
    'Situação ATIVA • CNAE 4751-2/01',
};

export function enderecoFormatado(): string {
  const e = EMPRESA.endereco;
  return `${e.logradouro}, ${e.numero} — ${e.bairro}, ${e.cidade}/${e.uf} — CEP ${e.cep}`;
}

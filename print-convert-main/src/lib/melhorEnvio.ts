/**
 * Integração com API Melhor Envio
 * Cálculo de frete para produtos e orçamentos
 */

const MELHOR_ENVIO_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiY2E2OGE5NGRlMWJjZTYwNWViOTgzNzVlNTBlN2UzZjZhZWMzNDkwZWEyMDgyYTlhOWIzMmVmZTA5NzdlYzFjMmZiMGFkMTY1ZWU3Mjk1NmEiLCJpYXQiOjE3NzA1ODU0NDcuOTMxMzc0LCJuYmYiOjE3NzA1ODU0NDcuOTMxMzc2LCJleHAiOjE4MDIxMjE0NDcuOTIwNTI2LCJzdWIiOiI4OTllNWYzNS03ODVmLTQ3M2YtOWU0OC04MjQ0MjgxODY0NDAiLCJzY29wZXMiOlsiY2FydC1yZWFkIiwiY2FydC13cml0ZSIsImNvbXBhbmllcy1yZWFkIiwiY29tcGFuaWVzLXdyaXRlIiwiY291cG9ucy1yZWFkIiwiY291cG9ucy13cml0ZSIsIm5vdGlmaWNhdGlvbnMtcmVhZCIsIm9yZGVycy1yZWFkIiwicHJvZHVjdHMtcmVhZCIsInByb2R1Y3RzLWRlc3Ryb3kiLCJwcm9kdWN0cy13cml0ZSIsInB1cmNoYXNlcy1yZWFkIiwic2hpcHBpbmctY2FsY3VsYXRlIiwic2hpcHBpbmctY2FuY2VsIiwic2hpcHBpbmctY2hlY2tvdXQiLCJzaGlwcGluZy1jb21wYW5pZXMiLCJzaGlwcGluZy1nZW5lcmF0ZSIsInNoaXBwaW5nLXByZXZpZXciLCJzaGlwcGluZy1wcmludCIsInNoaXBwaW5nLXNoYXJlIiwic2hpcHBpbmctdHJhY2tpbmciLCJlY29tbWVyY2Utc2hpcHBpbmciLCJ0cmFuc2FjdGlvbnMtcmVhZCIsInVzZXJzLXJlYWQiLCJ1c2Vycy13cml0ZSIsIndlYmhvb2tzLXJlYWQiLCJ3ZWJob29rcy13cml0ZSIsIndlYmhvb2tzLWRlbGV0ZSIsInRkZWFsZXItd2ViaG9vayJdfQ.Dh2DS7Hf1kszDAbmmXGGUKTpzXRG2fpuqsoHhdYWlhB7CU3xL3WQVPQNDi2sM4TygB24dK5OUWz-0PPFmYVFwfdcgfXdWwARJngomAV-yAx9Mcx8eOfLbZ0b-gElxW6161zZnD-WxCQ3-fa3S_hJuDk_lPckx-AOxT5jc62epv2jcVK80ssU3jNMC3WmbtrvMNoF_N3qzGD9f7l0m3nGjkyYMVchu277ZVliuHdGngw5m2zyLv_Y_42HkGR7A42LR0XeJajwEs-cjQoiAx0uJ523VCX4bpdAOCg6Lss4bqkKIYzkbRJ-jdHksrxDILq1B3H2CYAzgS5vnd8mzW6TevB6Nt_x_CdTWlXq6PxcxnJs--4SulCQzSTw1bY6BRkQ6-B3LTEhq1yk5c6n8uzS5v4oAunmccn9jlwsoiK8cBdJe6nVnHEJnct0x63WR6CO2OTFmU1NVvQ3BotyRjUWkektHdmoU2BFTMdKrRZbIuMxV3695Htp5cNFN1wraR8-NgyXsbc7pmbvSPon19jR7qpd5m1VhsA74QZHbSBL0HuA1xyyl0BJUQ7jLreJswZE8Eq7TbWVyAzZFnFe7HybgS76dgSHGCRQNNYuYPiagJX877ERT4583CKnLlUH_-G4m41VSeLcdcbNrlV7twlp28YnMUtoXTE7LTeArXIwugI';

const API_BASE_URL = 'https://melhorenvio.com.br/api/v2/me';

export interface ShippingAddress {
  postal_code: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state_abbr?: string;
  country_id?: string;
}

export interface ShippingPackage {
  weight: number; // em kg
  width: number; // em cm
  height: number; // em cm
  length: number; // em cm
  insurance_value?: number;
}

export interface ShippingQuote {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  price: number;
  discount: number;
  currency: string;
  delivery_time: number;
  delivery_range: {
    min: number;
    max: number;
  };
  custom_delivery_time?: number;
  custom_delivery_range?: {
    min: number;
    max: number;
  };
  packages: any[];
  additional_services: {
    receipt: boolean;
    own_hand: boolean;
    collect: boolean;
  };
  error?: string;
}

export interface ShippingCalculateRequest {
  from: ShippingAddress;
  to: ShippingAddress;
  package: ShippingPackage;
  options?: {
    receipt?: boolean;
    own_hand?: boolean;
    insurance_value?: number;
  };
}

/**
 * Calcula frete usando API Melhor Envio
 */
export async function calculateShipping(request: ShippingCalculateRequest): Promise<{
  success: boolean;
  quotes?: ShippingQuote[];
  error?: string;
}> {
  try {
    const payload = {
      from: {
        postal_code: request.from.postal_code
      },
      to: {
        postal_code: request.to.postal_code
      },
      package: {
        weight: request.package.weight,
        width: request.package.width,
        height: request.package.height,
        length: request.package.length,
        insurance_value: request.package.insurance_value || 0
      },
      options: {
        receipt: request.options?.receipt || false,
        own_hand: request.options?.own_hand || false,
        insurance_value: request.options?.insurance_value || 0
      }
    };

    const response = await fetch(`${API_BASE_URL}/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
        'User-Agent': '3DKPRINT (contato@3dkprint.com.br)'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao calcular frete');
    }

    const quotes: ShippingQuote[] = await response.json();

    return {
      success: true,
      quotes: quotes.filter(q => !q.error) // Filtrar apenas cotações válidas
    };
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao calcular frete'
    };
  }
}

/**
 * Busca endereço pelo CEP
 */
export async function getAddressByPostalCode(postalCode: string): Promise<{
  success: boolean;
  address?: {
    postal_code: string;
    address: string;
    district: string;
    city: string;
    state_abbr: string;
    country_id: string;
  };
  error?: string;
}> {
  try {
    const cleanPostalCode = postalCode.replace(/\D/g, '');
    
    const response = await fetch(`https://viacep.com.br/ws/${cleanPostalCode}/json/`);
    
    if (!response.ok) {
      throw new Error('CEP não encontrado');
    }

    const data = await response.json();

    if (data.erro) {
      throw new Error('CEP inválido');
    }

    return {
      success: true,
      address: {
        postal_code: data.cep,
        address: data.logradouro,
        district: data.bairro,
        city: data.localidade,
        state_abbr: data.uf,
        country_id: 'BR'
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar CEP'
    };
  }
}

/**
 * Formata valor de frete
 */
export function formatShippingPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

/**
 * Formata prazo de entrega
 */
export function formatDeliveryTime(days: number): string {
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  return `${days} dias úteis`;
}

/**
 * Calcula dimensões de uma peça 3D (estimativa)
 */
export function estimatePackageDimensions(weight: number): ShippingPackage {
  // Estimativa baseada em peso (kg)
  // Para peças 3D, geralmente são leves mas volumosas
  
  if (weight <= 0.1) {
    return { weight: 0.3, width: 10, height: 10, length: 10 }; // Pacote mínimo
  } else if (weight <= 0.5) {
    return { weight: 0.5, width: 15, height: 15, length: 15 };
  } else if (weight <= 1) {
    return { weight: 1, width: 20, height: 20, length: 20 };
  } else if (weight <= 2) {
    return { weight: 2, width: 25, height: 25, length: 25 };
  } else {
    return { weight: Math.ceil(weight), width: 30, height: 30, length: 30 };
  }
}

/**
 * CEP da 3DKPRINT (Ourinhos/SP)
 */
export const COMPANY_POSTAL_CODE = '19900-000'; // Ourinhos/SP

/**
 * Calcula frete para um produto
 */
export async function calculateProductShipping(
  productWeight: number,
  destinationPostalCode: string
): Promise<{
  success: boolean;
  quotes?: ShippingQuote[];
  error?: string;
}> {
  const packageDimensions = estimatePackageDimensions(productWeight);
  
  return calculateShipping({
    from: { postal_code: COMPANY_POSTAL_CODE },
    to: { postal_code: destinationPostalCode },
    package: packageDimensions
  });
}

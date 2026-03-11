import React, { createContext, useContext, useEffect, useState } from 'react';
import { initMercadoPago } from '@mercadopago/sdk-react';

// Credenciais de teste fornecidas
const MERCADO_PAGO_PUBLIC_KEY = 'TEST-4f42b5c0-4e27-4874-ab6e-5b00bede0c6e';

interface MercadoPagoContextType {
  isReady: boolean;
  publicKey: string;
}

const MercadoPagoContext = createContext<MercadoPagoContextType>({
  isReady: false,
  publicKey: MERCADO_PAGO_PUBLIC_KEY,
});

export function MercadoPagoProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      initMercadoPago(MERCADO_PAGO_PUBLIC_KEY, {
        locale: 'pt-BR',
      });
      setIsReady(true);
      console.log('Mercado Pago SDK inicializado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar Mercado Pago:', error);
    }
  }, []);

  return (
    <MercadoPagoContext.Provider value={{ isReady, publicKey: MERCADO_PAGO_PUBLIC_KEY }}>
      {children}
    </MercadoPagoContext.Provider>
  );
}

export function useMercadoPago() {
  return useContext(MercadoPagoContext);
}

export { MERCADO_PAGO_PUBLIC_KEY };

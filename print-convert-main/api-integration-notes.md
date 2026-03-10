# API Integration Notes

## SuperFrete API
- **Endpoint Produção**: https://api.superfrete.com/api/v0/calculator
- **Auth**: Bearer token no header Authorization
- **Header obrigatório**: User-Agent: 3DKPRINT (3dk.print.br@gmail.com)
- **Body**:
```json
{
  "from": { "postal_code": "CEP_ORIGEM" },
  "to": { "postal_code": "CEP_DESTINO" },
  "services": "1,2,17",
  "options": {
    "own_hand": false,
    "receipt": false,
    "insurance_value": 0,
    "use_insurance_value": false
  },
  "package": {
    "height": 40,
    "width": 40,
    "length": 50,
    "weight": 10
  }
}
```
- **Services**: 1=PAC, 2=SEDEX, 17=Mini Envios, 3=Jadlog, 31=Loggi

## Mercado Pago (Teste)
- **Public Key**: TEST-a0a8db55-4729-47a7-bb0f-4d8c1ac04b58
- **Access Token**: TEST-7156697657303179-030303-0e03f85cc529668997ea75f7bcbf3dc3-287681490

## SuperFrete Token
- Token JWT fornecido pelo usuário (produção)

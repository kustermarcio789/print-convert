# Informações da Calculadora de Impressão 3D

## Calculadora de Resina (baseada na imagem)

### Campos de Entrada:

1. **Tempo de Impressão**
   - Hora (0-999)
   - Minutos (0-59)
   - Segundos (0-59)

2. **Quantidade de Resina**
   - Valor (R$/L) - preço por litro da resina
   - Quantidade (ml) - quantidade usada em mililitros

3. **Custo Máquina**
   - Maquinário (R$) - valor padrão: 2000
   - Vida útil (h) - horas de vida útil, padrão: 2000
   - Consumo (W) - consumo em watts, padrão: 72

4. **Custos Extras**
   - Limpeza e modelagem (R$) - custos adicionais

5. **Energia Elétrica**
   - Custo por kwh (R$) - padrão: 0,89

### Cálculos:

1. **Total Resina** = (Valor R$/L * Quantidade ml) / 1000
2. **Total Energia** = (Tempo em horas * Consumo W * Custo kwh) / 1000
3. **Custo Máquina por Hora** = Maquinário / Vida útil
4. **Custo Máquina Total** = Custo Máquina por Hora * Tempo em horas
5. **Custo Líquido** = Total Resina + Total Energia + Custo Máquina Total + Limpeza e modelagem
6. **Preço de Venda** = Custo Líquido * (1 + Margem de lucro / 100)

### Resultados:
- Total Resina
- Total Energia
- Custo líquido
- Margem de lucro (%) - padrão: 40%
- Preço de venda (R$)

## Calculadora de Filamento (baseada no Calculadora3d.html)

Precisa ser implementada com base no arquivo HTML fornecido.

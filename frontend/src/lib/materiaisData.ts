// Inicializar materiais de exemplo no localStorage

export function inicializarMateriaisExemplo() {
  const materiaisExistentes = localStorage.getItem('estoque_materiais');
  
  if (!materiaisExistentes) {
    const materiaisIniciais = [
      {
        id: 'MAT-001',
        nome: 'ABS Verde',
        fornecedor: '3DVALE',
        tipo: 'filamento',
        quantidade: 1000, // 1kg em gramas
        unidade: 'g',
        precoCompra: 100.00,
        precoVenda: 250.00,
        estoqueMinimo: 200,
        status: 'normal'
      },
      {
        id: 'MAT-002',
        nome: 'PLA Preto',
        fornecedor: '3DVALE',
        tipo: 'filamento',
        quantidade: 1500,
        unidade: 'g',
        precoCompra: 80.00,
        precoVenda: 200.00,
        estoqueMinimo: 300,
        status: 'normal'
      },
      {
        id: 'MAT-003',
        nome: 'PETG Branco',
        fornecedor: '3DVALE',
        tipo: 'filamento',
        quantidade: 800,
        unidade: 'g',
        precoCompra: 120.00,
        precoVenda: 280.00,
        estoqueMinimo: 250,
        status: 'normal'
      },
      {
        id: 'MAT-004',
        nome: 'Resina Standard Cinza',
        fornecedor: 'Anycubic',
        tipo: 'resina',
        quantidade: 500, // 500ml
        unidade: 'ml',
        precoCompra: 150.00,
        precoVenda: 350.00,
        estoqueMinimo: 100,
        status: 'normal'
      },
      {
        id: 'MAT-005',
        nome: 'PLA Azul',
        fornecedor: '3DVALE',
        tipo: 'filamento',
        quantidade: 150, // Estoque baixo para demonstrar alerta
        unidade: 'g',
        precoCompra: 80.00,
        precoVenda: 200.00,
        estoqueMinimo: 300,
        status: 'baixo'
      },
      {
        id: 'MAT-006',
        nome: 'TPU Flexível Vermelho',
        fornecedor: 'Flashforge',
        tipo: 'filamento',
        quantidade: 0, // Estoque crítico para demonstrar alerta
        unidade: 'g',
        precoCompra: 180.00,
        precoVenda: 400.00,
        estoqueMinimo: 200,
        status: 'critico'
      },
      {
        id: 'MAT-007',
        nome: 'Nylon Natural',
        fornecedor: 'Taulman',
        tipo: 'filamento',
        quantidade: 1200,
        unidade: 'g',
        precoCompra: 200.00,
        precoVenda: 450.00,
        estoqueMinimo: 250,
        status: 'normal'
      },
      {
        id: 'MAT-008',
        nome: 'Resina Transparente',
        fornecedor: 'Elegoo',
        tipo: 'resina',
        quantidade: 300,
        unidade: 'ml',
        precoCompra: 180.00,
        precoVenda: 400.00,
        estoqueMinimo: 150,
        status: 'normal'
      }
    ];

    localStorage.setItem('estoque_materiais', JSON.stringify(materiaisIniciais));
    console.log('Materiais de exemplo inicializados com sucesso!');
  }
}

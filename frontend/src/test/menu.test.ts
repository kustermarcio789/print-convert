import { describe, it, expect } from 'vitest';
import { menuItems } from '../components/admin/Sidebar';

describe('Menu de Navegação Admin', () => {
  it('deve conter todos os itens de menu esperados', () => {
    const expectedIds = [
      'dashboard', 'orcamentos', 'prestadores', 'usuarios', 
      'produtos', 'vendas', 'estoque', 'produtos-site', 
      'producao', 'relatorios'
    ];
    
    const menuIds = menuItems.map(item => item.id);
    
    expectedIds.forEach(id => {
      expect(menuIds).toContain(id);
    });
  });

  it('deve ter caminhos de rota válidos começando com /admin', () => {
    menuItems.forEach(item => {
      expect(item.path).toMatch(/^\/admin/);
    });
  });
});

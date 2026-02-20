import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-blue-600">3DKPRINT</Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/produtos" className="text-sm font-medium hover:text-blue-600">Produtos</Link>
          <Link to="/servicos" className="text-sm font-medium hover:text-blue-600">Serviços</Link>
          <Link to="/orcamento" className="text-sm font-medium hover:text-blue-600">Orçamento</Link>
          <Link to="/portfolio" className="text-sm font-medium hover:text-blue-600">Portfólio</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/admin/login">
            <Button variant="ghost" size="sm">Admin</Button>
          </Link>
          <Link to="/orcamento">
            <Button size="sm">Fazer Orçamento</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

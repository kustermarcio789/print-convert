import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">3DKPRINT</h3>
            <p className="text-gray-400 text-sm">
              Sua parceira em impressão 3D profissional, modelagem e manutenção.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/produtos" className="hover:text-white">Produtos</Link></li>
              <li><Link to="/servicos" className="hover:text-white">Serviços</Link></li>
              <li><Link to="/orcamento" className="hover:text-white">Orçamento</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Contato</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>3dk.print@gmail.com</li>
              <li>(43) 9174-1518</li>
              <li>Jacarezinho - PR</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Admin</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/admin/login" className="hover:text-white">Painel Administrativo</Link></li>
              <li><Link to="/cadastro-prestador" className="hover:text-white">Seja um Prestador</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          © 2026 3DKPRINT. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

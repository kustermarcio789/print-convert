import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, Search, ChevronDown, Printer, PenTool, Paintbrush, Wrench, Upload, UserPlus, Users, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const brands = [
  { name: 'Creality', href: '/marcas/creality' },
  { name: 'Bambu Lab', href: '/marcas/bambu-lab' },
  { name: 'Prusa', href: '/marcas/prusa' },
  { name: 'Anycubic', href: '/marcas/anycubic' },
  { name: 'Voron', href: '/marcas/voron' },
  { name: 'Elegoo', href: '/marcas/elegoo' },
  { name: 'Artillery', href: '/marcas/artillery' },
  { name: 'Flashforge', href: '/marcas/flashforge' },
];

const serviceItems = [
  { name: 'Impressão 3D', href: '/servicos#impressao', icon: Printer, desc: 'FDM, SLA e mais' },
  { name: 'Modelagem 3D', href: '/servicos#modelagem', icon: PenTool, desc: 'Fusion 360, Blender' },
  { name: 'Pintura Premium', href: '/servicos#pintura', icon: Paintbrush, desc: 'Acabamento profissional' },
  { name: 'Manutenção', href: '/servicos#manutencao', icon: Wrench, desc: 'Conserto e calibração' },
  { name: 'Enviar Arquivo', href: '/enviar-arquivo', icon: Upload, desc: 'STL, OBJ, 3MF...' },
  { name: 'Encontrar Prestador', href: '/prestadores', icon: Users, desc: 'Marketplace de serviços' },
];

const accountItems = [
  { name: 'Entrar', href: '/login', icon: User, desc: 'Acesse sua conta' },
  { name: 'Cadastro Cliente', href: '/cadastro', icon: UserPlus, desc: 'Crie sua conta grátis' },
  { name: 'Cadastro Prestador', href: '/cadastro-prestador', icon: Store, desc: 'Ofereça seus serviços' },
];

const mainNavigation = [
  { name: 'Início', href: '/' },
  { name: 'Marcas', href: '/marcas', hasDropdown: true, dropdownType: 'brands' },
  { name: 'Produtos', href: '/produtos' },
  { name: 'Serviços', href: '/servicos', hasDropdown: true, dropdownType: 'services' },
  { name: 'Orçamento', href: '/orcamento' },
  { name: 'Portfólio', href: '/portfolio' },
];

function DropdownMenu({ type, onClose }: { type: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (type === 'brands') {
    return (
      <div ref={ref} className="absolute top-full left-0 mt-1 w-72 bg-background border border-border rounded-xl shadow-xl p-4 animate-fade-in z-50">
        <div className="mb-3">
          <Link to="/marcas" onClick={onClose} className="text-sm font-semibold text-accent hover:underline">
            Ver todas as marcas
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to={brand.href}
              onClick={onClose}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'services') {
    return (
      <div ref={ref} className="absolute top-full left-0 mt-1 w-80 bg-background border border-border rounded-xl shadow-xl p-4 animate-fade-in z-50">
        <div className="space-y-1">
          {serviceItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <item.icon className="w-4 h-4 text-accent" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const toggleDropdown = (type: string) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container-custom flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">3DK</span>
            <span className="text-2xl font-bold text-accent">PRINT</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex lg:items-center lg:space-x-1">
          {mainNavigation.map((item) => (
            <div key={item.name} className="relative">
              {item.hasDropdown ? (
                <button
                  onClick={() => toggleDropdown(item.dropdownType!)}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                    isActive(item.href)
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.name}
                  <ChevronDown className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    activeDropdown === item.dropdownType && "rotate-180"
                  )} />
                </button>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                    isActive(item.href)
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {item.name}
                </Link>
              )}
              {item.hasDropdown && activeDropdown === item.dropdownType && (
                <DropdownMenu type={item.dropdownType!} onClose={() => setActiveDropdown(null)} />
              )}
            </div>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex lg:items-center lg:space-x-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          
          {/* Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('account')}
              className="flex items-center gap-1 p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors"
            >
              <User className="h-5 w-5" />
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform",
                activeDropdown === 'account' && "rotate-180"
              )} />
            </button>
            {activeDropdown === 'account' && (
              <div className="absolute top-full right-0 mt-1 w-64 bg-background border border-border rounded-xl shadow-xl p-3 animate-fade-in z-50">
                {accountItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <item.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/orcamento">
            <Button className="ml-2 bg-accent text-accent-foreground hover:bg-accent/90">
              Fazer Orçamento
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <ShoppingCart className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-fade-in max-h-[80vh] overflow-y-auto">
          <div className="container-custom py-4 space-y-1">
            {/* Início */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                isActive('/') ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Início
            </Link>

            {/* Marcas */}
            <div>
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'marcas' ? null : 'marcas')}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors",
                  isActive('/marcas') ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Marcas
                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileExpanded === 'marcas' && "rotate-180")} />
              </button>
              {mobileExpanded === 'marcas' && (
                <div className="pl-4 space-y-1 mt-1">
                  <Link to="/marcas" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-sm font-semibold text-accent">
                    Ver todas as marcas
                  </Link>
                  {brands.map((brand) => (
                    <Link
                      key={brand.name}
                      to={brand.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {brand.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Produtos */}
            <Link
              to="/produtos"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                isActive('/produtos') ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Produtos
            </Link>

            {/* Serviços */}
            <div>
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'servicos' ? null : 'servicos')}
                className={cn(
                  "flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors",
                  isActive('/servicos') ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                Serviços
                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileExpanded === 'servicos' && "rotate-180")} />
              </button>
              {mobileExpanded === 'servicos' && (
                <div className="pl-4 space-y-1 mt-1">
                  {serviceItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <item.icon className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Orçamento */}
            <Link
              to="/orcamento"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                isActive('/orcamento') ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Orçamento
            </Link>

            {/* Portfólio */}
            <Link
              to="/portfolio"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "block px-4 py-3 text-base font-medium rounded-lg transition-colors",
                isActive('/portfolio') ? "text-accent bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              Portfólio
            </Link>

            {/* Conta */}
            <div>
              <button
                onClick={() => setMobileExpanded(mobileExpanded === 'conta' ? null : 'conta')}
                className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Minha Conta
                <ChevronDown className={cn("h-4 w-4 transition-transform", mobileExpanded === 'conta' && "rotate-180")} />
              </button>
              {mobileExpanded === 'conta' && (
                <div className="pl-4 space-y-1 mt-1">
                  {accountItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      <item.icon className="w-4 h-4 text-accent" />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4">
              <Link to="/orcamento" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Fazer Orçamento
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

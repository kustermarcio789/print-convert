import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  label: string;
  href?: string;
  children?: MenuItem[];
}

interface MobileMenuProps {
  menuItems: MenuItem[];
  logo?: React.ReactNode;
}

export default function MobileMenu({ menuItems, logo }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  const closeMenu = () => {
    setIsOpen(false);
    setExpandedItems(new Set());
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.label);
    const paddingLeft = level * 16;

    return (
      <div key={item.label}>
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.label)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-100 transition-colors"
            style={{ paddingLeft: `${paddingLeft + 16}px` }}
          >
            <span className="font-medium">{item.label}</span>
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
        ) : (
          <Link
            to={item.href || '#'}
            onClick={closeMenu}
            className="block px-4 py-3 hover:bg-gray-100 transition-colors"
            style={{ paddingLeft: `${paddingLeft + 16}px` }}
          >
            <span className="font-medium">{item.label}</span>
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="bg-gray-50">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Botão do Menu Mobile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleMenu}
        className="md:hidden"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Menu Lateral */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabeçalho do Menu */}
        <div className="flex items-center justify-between p-4 border-b">
          {logo || <span className="text-xl font-bold">Menu</span>}
          <Button
            variant="ghost"
            size="sm"
            onClick={closeMenu}
            aria-label="Fechar menu"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Itens do Menu */}
        <nav className="overflow-y-auto h-[calc(100%-73px)]">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
    </>
  );
}

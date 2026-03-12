import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Search, ExternalLink, Menu } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  onMobileMenuToggle?: () => void;
}

export default function AdminHeader({ title, onMobileMenuToggle }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 lg:px-8 h-16">
        <div className="flex items-center gap-4">
          <button onClick={onMobileMenuToggle} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
            />
          </div>

          <Link
            to="/"
            target="_blank"
            className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Site
          </Link>

          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold">
              AD
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-gray-700">Admin</p>
              <p className="text-[10px] text-gray-400">Master</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

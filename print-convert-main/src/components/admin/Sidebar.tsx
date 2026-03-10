import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ClipboardList, Package, Users, TrendingUp,
  Settings, LogOut, Box, Database, ShoppingCart, BarChart3,
  FileText, PieChart, Factory, FilePlus, ChevronDown, ChevronRight,
  Printer, ExternalLink, Tag, Image, Wrench, Mail, UserCog, Shield, X, Menu
} from 'lucide-react';

export const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', color: 'text-blue-400', bg: 'bg-blue-500/20', section: 'principal' },
  { id: 'produtos', label: 'Produtos', icon: Package, path: '/admin/produtos', color: 'text-green-400', bg: 'bg-green-500/20', section: 'cadastros' },
  { id: 'marcas', label: 'Marcas & Modelos', icon: Tag, path: '/admin/marcas', color: 'text-rose-400', bg: 'bg-rose-500/20', section: 'cadastros' },
];

const sections = [
  { id: 'principal', label: 'PRINCIPAL' },
  { id: 'cadastros', label: 'CADASTROS' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('admin_role') || 'master';
  const permissionsStr = localStorage.getItem('admin_permissions');
  const permissions = permissionsStr ? (permissionsStr === 'all' ? ['all'] : JSON.parse(permissionsStr)) : ['all'];
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_role');
    localStorage.removeItem('admin_permissions');
    navigate('/admin/login');
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(s => s !== sectionId) 
        : [...prev, sectionId]
    );
  };

  const allowedMenuItems = menuItems.filter(item => 
    permissions.includes('all') || permissions.includes(item.id)
  );

  const sidebarContent = (
    <>
      {/* Logo / Header */}
      <div className="p-5 border-b border-gray-800/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">3DKPRINT</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">Painel Admin</p>
          </div>
        </div>
        {/* Botão fechar - só aparece no mobile drawer */}
        <button 
          onClick={() => setMobileOpen(false)} 
          className="md:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Info */}
      <div className="px-5 py-3 border-b border-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-200 truncate">Administrador</p>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Online • {userRole}
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 mt-2 px-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {sections.map(section => {
          const sectionItems = allowedMenuItems.filter(item => item.section === section.id);
          if (sectionItems.length === 0) return null;
          const isCollapsed = collapsedSections.includes(section.id);

          return (
            <div key={section.id} className="mb-1">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-[0.15em] hover:text-gray-400 transition-colors"
              >
                {section.label}
                {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {sectionItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          isActive 
                          ? `bg-blue-600/20 text-blue-400 shadow-sm border border-blue-500/20` 
                          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                        }`}
                      >
                        <span className={`p-1.5 rounded-lg transition-all ${
                          isActive ? item.bg : 'bg-transparent group-hover:bg-white/5'
                        }`}>
                          <Icon size={16} className={isActive ? item.color : ''} />
                        </span>
                        <span className="truncate">{item.label}</span>
                        {isActive && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800/50 space-y-1">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors"
        >
          <ExternalLink size={16} />
          Ver Site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={16} />
          Sair do Painel
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Botão hamburger fixo no mobile - aparece quando sidebar está escondida */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 p-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-gray-800 transition-colors"
        style={{ display: mobileOpen ? 'none' : undefined }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop Sidebar - sempre visível em md+ */}
      <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 hidden md:flex flex-col min-h-screen shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar - overlay drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 z-50 md:hidden flex flex-col shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

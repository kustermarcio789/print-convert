import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
  const userRole = localStorage.getItem('admin_role') || '';
  
  return (
    <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-4">
          <Link to="/" target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Ver Site <ExternalLink size={14} />
          </Link>
          <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
            {userRole === 'master' ? 'MA' : 'ST'}
          </div>
        </div>
      </div>
    </header>
  );
}

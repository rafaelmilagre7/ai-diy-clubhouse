
import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarLogoProps {
  sidebarOpen: boolean;
}

export const SidebarLogo: React.FC<SidebarLogoProps> = ({ sidebarOpen }) => {
  return (
    <div className="flex items-center justify-center py-6 border-b border-gray-700">
      <Link to="/dashboard" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-viverblue rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">V</span>
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="text-white font-bold text-lg">Viver de IA</h1>
            <p className="text-gray-400 text-xs">Club</p>
          </div>
        )}
      </Link>
    </div>
  );
};

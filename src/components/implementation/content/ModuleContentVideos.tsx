
import React from 'react';
import { Module } from '@/lib/supabase';

interface ModuleContentVideosProps {
  module: Module;
}

// Exportação nomeada para compatibilidade
export const ModuleContentVideos: React.FC<ModuleContentVideosProps> = ({ module }) => {
  return (
    <div className="p-4">
      <p className="text-gray-500">Vídeos do módulo em desenvolvimento...</p>
      {module && (
        <div className="mt-2 text-xs text-gray-400">
          Módulo: {module.title}
        </div>
      )}
    </div>
  );
};

// Manter exportação default para compatibilidade
export default ModuleContentVideos;

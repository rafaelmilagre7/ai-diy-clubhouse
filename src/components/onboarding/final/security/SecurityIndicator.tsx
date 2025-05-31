
import React from 'react';
import { Shield, CheckCircle, Lock, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SecurityIndicatorProps {
  isSecure?: boolean;
  showDetails?: boolean;
}

export const SecurityIndicator: React.FC<SecurityIndicatorProps> = ({ 
  isSecure = true, 
  showDetails = false 
}) => {
  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-400">
        <Shield className="w-4 h-4" />
        <span>Protegido por segurança avançada</span>
      </div>
    );
  }

  return (
    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-green-400" />
        <h3 className="font-medium text-green-400">Sistema de Segurança Ativo</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span>Proteção contra duplicatas</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
          <Lock className="w-4 h-4 text-green-400" />
          <span>Rate limiting ativo</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
          <Eye className="w-4 h-4 text-green-400" />
          <span>Verificação de integridade</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300">
          <Shield className="w-4 h-4 text-green-400" />
          <span>Backup automático</span>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-green-500/20">
        <Badge variant="outline" className="border-green-500/30 text-green-400">
          🛡️ Zero duplicates • 100% consistência
        </Badge>
      </div>
    </div>
  );
};

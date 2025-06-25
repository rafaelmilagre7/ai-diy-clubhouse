
import React from 'react';
import { Lock, Shield, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProtectedFieldIndicatorProps {
  fieldType: 'email' | 'name' | 'phone';
  isProtected: boolean;
  className?: string;
}

export const ProtectedFieldIndicator = ({ 
  fieldType, 
  isProtected, 
  className = '' 
}: ProtectedFieldIndicatorProps) => {
  if (!isProtected) return null;

  const getFieldInfo = () => {
    switch (fieldType) {
      case 'email':
        return {
          icon: Mail,
          label: 'E-mail do Convite',
          description: 'Protegido pelo sistema de convites'
        };
      case 'name':
        return {
          icon: Shield,
          label: 'Nome do Convite',
          description: 'Definido no convite original'
        };
      case 'phone':
        return {
          icon: Shield,
          label: 'Telefone do Convite',
          description: 'Número usado para envio do convite'
        };
      default:
        return {
          icon: Lock,
          label: 'Campo Protegido',
          description: 'Não pode ser alterado'
        };
    }
  };

  const { icon: Icon, label, description } = getFieldInfo();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant="secondary" className="text-xs bg-amber-500/20 text-amber-300 border-amber-500/30">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
      <span className="text-xs text-neutral-400">{description}</span>
    </div>
  );
};

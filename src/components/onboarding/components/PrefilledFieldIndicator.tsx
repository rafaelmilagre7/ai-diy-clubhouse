import React from 'react';
import { Check, Mail, Phone, User } from 'lucide-react';

interface PrefilledFieldIndicatorProps {
  fieldType: 'email' | 'phone' | 'name';
  isFromInvite: boolean;
}

const fieldIcons = {
  email: Mail,
  phone: Phone,
  name: User
};

const fieldLabels = {
  email: 'E-mail',
  phone: 'WhatsApp',
  name: 'Nome'
};

export const PrefilledFieldIndicator: React.FC<PrefilledFieldIndicatorProps> = ({
  fieldType,
  isFromInvite
}) => {
  if (!isFromInvite) return null;
  
  const Icon = fieldIcons[fieldType];
  const label = fieldLabels[fieldType];
  
  return (
    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
        <Check className="h-3 w-3" />
        Do convite
      </span>
      <p className="text-primary text-xs flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label} preenchido automaticamente do seu convite
      </p>
    </div>
  );
};
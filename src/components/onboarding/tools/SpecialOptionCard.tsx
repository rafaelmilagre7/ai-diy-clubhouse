import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface SpecialOptionCardProps {
  name: string;
  icon: string;
  isSelected: boolean;
  onToggle: (name: string) => void;
}

export const SpecialOptionCard: React.FC<SpecialOptionCardProps> = ({ 
  name, 
  icon, 
  isSelected, 
  onToggle 
}) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:border-primary/50 hover:shadow-md ${
        isSelected 
          ? 'border-2 border-primary bg-primary/10 shadow-lg' 
          : 'border border-border hover:bg-accent/50'
      }`}
      onClick={() => {
        console.log('[SPECIAL_CARD] 🎯 Clique em:', name);
        onToggle(name);
      }}
    >
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center">
            <span className="text-xs">{icon}</span>
          </div>
        </div>
        <span className="text-sm font-medium flex-1 text-left ml-2">
          {name}
        </span>
        <Checkbox
          checked={isSelected}
          onChange={() => {}} // Apenas visual
          className="pointer-events-none"
        />
      </CardContent>
    </Card>
  );
};
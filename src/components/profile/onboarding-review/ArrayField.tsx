
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ArrayFieldProps {
  label: string;
  items?: string[] | null;
}

export const ArrayField: React.FC<ArrayFieldProps> = ({ label, items }) => {
  const hasItems = items && items.length > 0;

  return (
    <div className="col-span-full">
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {label}
      </label>
      {hasItems ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="border-viverblue/30 text-viverblue"
            >
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-gray-500 italic">Nenhum item informado</span>
      )}
    </div>
  );
};

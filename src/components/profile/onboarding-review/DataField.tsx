
import React from 'react';

interface DataFieldProps {
  label: string;
  value?: string | number | null;
  link?: boolean;
  multiline?: boolean;
}

export const DataField: React.FC<DataFieldProps> = ({ 
  label, 
  value, 
  link = false, 
  multiline = false 
}) => {
  const displayValue = value || 'Não informado';
  const isEmpty = !value || value === '';

  const renderValue = () => {
    if (isEmpty) {
      return <span className="text-gray-500 italic">{displayValue}</span>;
    }

    if (link && value) {
      const href = value.toString().startsWith('http') ? value.toString() : `https://${value}`;
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-viverblue hover:text-viverblue-light underline"
        >
          {value}
        </a>
      );
    }

    if (multiline) {
      return (
        <div className="text-gray-200 whitespace-pre-wrap">
          {displayValue}
        </div>
      );
    }

    return <span className="text-gray-200">{displayValue}</span>;
  };

  return (
    <div className={multiline ? 'col-span-full' : ''}>
      <label className="block text-sm font-medium text-gray-400 mb-1">
        {label}
      </label>
      {renderValue()}
    </div>
  );
};

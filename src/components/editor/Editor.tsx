
import React from 'react';
import { ImageUpload } from '@/components/formacao/comum/ImageUpload';

interface EditorProps {
  value: any;
  onChange: (value: any) => void;
  moduleId?: string;
  type?: 'image' | 'order';
}

export const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  moduleId,
  type = 'image' 
}) => {
  React.useEffect(() => {
    // Se for do tipo 'order' e não houver valor definido ainda,
    // buscar a próxima posição disponível
    if (type === 'order' && moduleId && (value === undefined || value === null)) {
      const fetchNextOrderIndex = async () => {
        try {
          const { data, error } = await fetch('/api/lessons/next-order-index?moduleId=' + moduleId)
            .then(res => res.json());
          
          if (!error && data && typeof data.nextOrderIndex === 'number') {
            onChange(data.nextOrderIndex);
          } else {
            // Se houver erro ou resposta inválida, usar 0 como padrão
            onChange(0);
          }
        } catch (err) {
          console.error("Erro ao buscar próximo índice de ordem:", err);
          // Em caso de erro, usar 0 como padrão
          onChange(0);
        }
      };
      
      fetchNextOrderIndex();
    }
  }, [type, moduleId, value, onChange]);
  
  if (type === 'order') {
    // Para o tipo 'order', o componente é invisível e apenas gerencia o valor
    return null;
  }
  
  return (
    <div className="w-full">
      <ImageUpload
        value={typeof value === 'string' ? value : ''}
        onChange={onChange}
        bucketName="learning_covers" // Corrigido: usando bucket que existe no sistema
        folderPath="covers"
      />
    </div>
  );
};

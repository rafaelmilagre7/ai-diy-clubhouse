
import React from 'react';
import { Button } from '@/components/ui/button';
import { SaveIcon, ArrowLeftIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { difficultyLabels, getDifficultyColor } from '@/utils/difficultyUtils';

interface SolutionEditorHeaderProps {
  id?: string;
  saving: boolean;
  onSave: () => void;
  title?: string;
  difficulty?: string;
}

const SolutionEditorHeader: React.FC<SolutionEditorHeaderProps> = ({
  id,
  saving,
  onSave,
  title,
  difficulty
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(id ? '/admin/solutions' : '/admin')}
          className="mr-2"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {title ? title : id ? 'Editar Solução' : 'Nova Solução'}
          </h1>
          {difficulty && (
            <div className="flex items-center mt-1">
              <span
                className={`${getDifficultyColor(difficulty)} text-xs px-2 py-0.5 rounded-full`}
              >
                {difficultyLabels[difficulty]}
              </span>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={onSave}
        disabled={saving}
        className="min-w-[120px]"
      >
        {saving ? (
          <div className="flex items-center">
            <span className="animate-spin mr-2">◌</span>
            Salvando...
          </div>
        ) : (
          <>
            <SaveIcon className="mr-2 h-4 w-4" />
            {id ? 'Salvar Alterações' : 'Criar Solução'}
          </>
        )}
      </Button>
    </div>
  );
};

export default SolutionEditorHeader;


import React from 'react';
import { Button } from '@/components/ui/button';
import { SaveIcon, ArrowLeftIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SolutionEditorHeaderProps {
  id?: string;
  saving: boolean;
  onSave: () => void;
  title?: string;
  difficulty?: string;
  difficultyColor?: string;
  difficultyText?: string;
}

const SolutionEditorHeader: React.FC<SolutionEditorHeaderProps> = ({
  id,
  saving,
  onSave,
  title,
  difficulty,
  difficultyColor,
  difficultyText
}) => {
  const navigate = useNavigate();

  // Tradução fallback caso não seja fornecido o difficultyText
  const getDifficultyDisplayText = () => {
    if (difficultyText) return difficultyText;
    switch (difficulty) {
      case 'easy':
        return 'Fácil';
      case 'medium':
        return 'Normal';
      case 'advanced':
        return 'Avançado';
      default:
        return difficulty;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-lg shadow-sm bg-surface-elevated">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(id ? '/admin/solutions' : '/admin')} className="mr-2 text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {title ? title : id ? 'Editar Solução' : 'Nova Solução'}
          </h1>
          {difficulty && (
            <div className="flex items-center mt-1">
              <span className={`${difficultyColor || 'bg-muted'} text-primary-foreground text-xs px-2 py-0.5 rounded-full`}>
                {getDifficultyDisplayText()}
              </span>
            </div>
          )}
        </div>
      </div>

      <Button onClick={onSave} disabled={saving} className="min-w-[120px]">
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

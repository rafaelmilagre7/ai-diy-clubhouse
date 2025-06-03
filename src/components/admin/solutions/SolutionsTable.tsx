
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import { Solution } from '@/types/solutionTypes';
import { PublishStatus } from './PublishStatus';
import { SolutionDifficultyBadge } from './SolutionDifficultyBadge';
import { useNavigate } from 'react-router-dom';

interface SolutionsTableProps {
  solutions: Solution[];
  onDeleteClick: (id: string) => void;
}

export const SolutionsTable: React.FC<SolutionsTableProps> = ({
  solutions,
  onDeleteClick
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-700">
            <th className="text-left py-3 px-4 font-medium text-neutral-300">Título</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-300">Categoria</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-300">Dificuldade</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-300">Status</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-300">Criado em</th>
            <th className="text-left py-3 px-4 font-medium text-neutral-300">Ações</th>
          </tr>
        </thead>
        <tbody>
          {solutions.map((solution) => (
            <tr key={solution.id} className="border-b border-neutral-800 hover:bg-neutral-800/30">
              <td className="py-4 px-4">
                <div>
                  <div className="font-medium text-white text-left">{solution.title}</div>
                  <div className="text-sm text-neutral-400 text-left truncate max-w-xs">
                    {solution.description}
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <Badge variant="outline" className="text-left">
                  {solution.category}
                </Badge>
              </td>
              <td className="py-4 px-4">
                <SolutionDifficultyBadge difficulty={solution.difficulty} />
              </td>
              <td className="py-4 px-4">
                <PublishStatus published={solution.published} />
              </td>
              <td className="py-4 px-4 text-neutral-300 text-left">
                {formatDate(solution.created_at)}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/solutions/${solution.id}`)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/admin/solutions/${solution.id}`)}
                    className="text-neutral-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteClick(solution.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

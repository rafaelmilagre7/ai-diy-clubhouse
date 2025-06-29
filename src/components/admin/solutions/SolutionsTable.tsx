
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Solution } from '@/lib/supabase/types/legacy';
import { SolutionDifficultyBadge } from './SolutionDifficultyBadge';
import { TableActions } from './TableActions';
import { PublishStatus } from './PublishStatus';
import { formatDateDistance } from './utils/dateFormatter';

interface SolutionsTableProps {
  solutions: Solution[];
  onEdit: (id: string) => void;
  onDelete: (solutionId: string) => Promise<void>;
  onTogglePublish: (solutionId: string, newPublishedState: boolean) => Promise<void>;
  getCategoryDetails: (category: string) => { name: string; color: string; bgColor: string; icon: string; description: string; };
  onDeleteClick?: (id: string) => void;
}

export const SolutionsTable: React.FC<SolutionsTableProps> = ({ 
  solutions, 
  onEdit,
  onDelete,
  onTogglePublish,
  getCategoryDetails,
  onDeleteClick
}) => {
  const getCategoryText = (category: string) => {
    const details = getCategoryDetails(category);
    return details.name;
  };

  const handleTogglePublish = async (solutionId: string, currentPublished: boolean) => {
    await onTogglePublish(solutionId, !currentPublished);
  };

  return (
    <Table className="border-collapse">
      <TableHeader className="bg-[#151823]">
        <TableRow>
          <TableHead className="text-white font-medium">Título</TableHead>
          <TableHead className="text-white font-medium">Categoria</TableHead>
          <TableHead className="text-white font-medium">Dificuldade</TableHead>
          <TableHead className="text-white font-medium">Status</TableHead>
          <TableHead className="text-white font-medium">Criada em</TableHead>
          <TableHead className="text-right text-white font-medium">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solutions.map((solution) => (
          <TableRow key={solution.id} className="bg-[#1A1E2E] border-neutral-700">
            <TableCell className="font-medium text-white">{solution.title}</TableCell>
            <TableCell className="text-white">{getCategoryText(solution.category)}</TableCell>
            <TableCell>
              <SolutionDifficultyBadge difficulty={solution.difficulty} />
            </TableCell>
            <TableCell>
              <PublishStatus 
                published={solution.published}
                onToggle={() => handleTogglePublish(solution.id, solution.published)}
              />
            </TableCell>
            <TableCell className="text-white">{formatDateDistance(solution.created_at)}</TableCell>
            <TableCell className="text-right">
              <TableActions 
                solutionId={solution.id} 
                onEdit={() => onEdit(solution.id)}
                onDelete={() => onDelete(solution.id)}
                onDeleteClick={onDeleteClick}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

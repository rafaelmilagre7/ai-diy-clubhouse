
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Solution } from '@/types/solutionTypes';
import { SolutionDifficultyBadge } from './SolutionDifficultyBadge';
import { TableActions } from './TableActions';
import { PublishStatus } from './PublishStatus';
import { formatDateDistance } from './utils/dateFormatter';

interface SolutionsTableProps {
  solutions: Solution[];
  onDeleteClick: (id: string) => void;
}

export const SolutionsTable: React.FC<SolutionsTableProps> = ({ 
  solutions, 
  onDeleteClick 
}) => {
  const getCategoryText = (category: string) => {
    switch (category) {
      case 'revenue': return 'Aumento de Receita';
      case 'operational': return 'Otimização Operational';
      case 'strategy': return 'Gestão Estratégica';
      default: return category;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hover:text-viverblue transition-colors">Título</TableHead>
          <TableHead className="hover:text-viverblue transition-colors">Categoria</TableHead>
          <TableHead className="hover:text-viverblue transition-colors">Dificuldade</TableHead>
          <TableHead className="hover:text-viverblue transition-colors">Status</TableHead>
          <TableHead className="hover:text-viverblue transition-colors">Criada em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solutions.map((solution) => (
          <TableRow key={solution.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
            <TableCell className="font-medium text-neutral-900 dark:text-white">{solution.title}</TableCell>
            <TableCell className="text-neutral-800 dark:text-neutral-100">{getCategoryText(solution.category)}</TableCell>
            <TableCell>
              <SolutionDifficultyBadge difficulty={solution.difficulty} />
            </TableCell>
            <TableCell>
              <PublishStatus published={solution.published} />
            </TableCell>
            <TableCell className="text-neutral-800 dark:text-neutral-100">{formatDateDistance(solution.created_at)}</TableCell>
            <TableCell className="text-right">
              <TableActions 
                solutionId={solution.id} 
                onDeleteClick={onDeleteClick} 
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

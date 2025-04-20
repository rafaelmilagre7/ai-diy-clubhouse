
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
      case 'operational': return 'Otimização Operacional';
      case 'strategy': return 'Gestão Estratégica';
      default: return category;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Dificuldade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criada em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solutions.map((solution) => (
          <TableRow key={solution.id}>
            <TableCell className="font-medium">{solution.title}</TableCell>
            <TableCell>{getCategoryText(solution.category)}</TableCell>
            <TableCell>
              <SolutionDifficultyBadge difficulty={solution.difficulty} />
            </TableCell>
            <TableCell>
              <PublishStatus published={solution.published} />
            </TableCell>
            <TableCell>{formatDateDistance(solution.created_at)}</TableCell>
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


import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Solution } from '@/types/solutionTypes';
import { SolutionDifficultyBadge } from './SolutionDifficultyBadge';
import { TableActions } from './TableActions';
import { PublishStatus } from './PublishStatus';
import { Text } from '@/components/ui/text';
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
      case 'Receita': return 'Aumento de Receita';
      case 'Operacional': return 'Otimização Operacional';
      case 'Estratégia': return 'Gestão Estratégica';
      default: return category;
    }
  };

  return (
    <Table className="border-collapse">
      <TableHeader className="bg-surface">
        <TableRow>
          <TableHead>
            <Text variant="body-small" weight="medium" textColor="primary">Título</Text>
          </TableHead>
          <TableHead>
            <Text variant="body-small" weight="medium" textColor="primary">Categoria</Text>
          </TableHead>
          <TableHead>
            <Text variant="body-small" weight="medium" textColor="primary">Dificuldade</Text>
          </TableHead>
          <TableHead>
            <Text variant="body-small" weight="medium" textColor="primary">Status</Text>
          </TableHead>
          <TableHead>
            <Text variant="body-small" weight="medium" textColor="primary">Criada em</Text>
          </TableHead>
          <TableHead className="text-right">
            <Text variant="body-small" weight="medium" textColor="primary">Ações</Text>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {solutions.map((solution) => (
          <TableRow key={solution.id} className="bg-surface-elevated border-border">
            <TableCell>
              <Text variant="body-small" weight="medium" textColor="primary">
                {solution.title}
              </Text>
            </TableCell>
            <TableCell>
              <Text variant="body-small" textColor="secondary">
                {getCategoryText(solution.category)}
              </Text>
            </TableCell>
            <TableCell>
              <SolutionDifficultyBadge difficulty={solution.difficulty} />
            </TableCell>
            <TableCell>
              <PublishStatus published={solution.published} />
            </TableCell>
            <TableCell>
              <Text variant="body-small" textColor="secondary">
                {formatDateDistance(solution.created_at)}
              </Text>
            </TableCell>
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

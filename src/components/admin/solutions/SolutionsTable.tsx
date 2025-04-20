
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, BarChart2, Trash2, Eye } from 'lucide-react';
import { Solution } from '@/types/solutionTypes';
import { SolutionDifficultyBadge } from './SolutionDifficultyBadge';

interface SolutionsTableProps {
  solutions: Solution[];
  onDeleteClick: (id: string) => void;
}

export const SolutionsTable: React.FC<SolutionsTableProps> = ({ solutions, onDeleteClick }) => {
  const navigate = useNavigate();

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
              {solution.published ? (
                <Badge className="bg-green-100 text-green-800">Publicada</Badge>
              ) : (
                <Badge variant="outline">Rascunho</Badge>
              )}
            </TableCell>
            <TableCell>
              {formatDistanceToNow(new Date(solution.created_at), {
                addSuffix: true,
                locale: ptBR,
              })}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/solution/${solution.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/admin/solution/${solution.id}`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/admin/metrics/${solution.id}`)}
                >
                  <BarChart2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => onDeleteClick(solution.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

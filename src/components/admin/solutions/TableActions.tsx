
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, Edit, BarChart2, Trash2 } from 'lucide-react';

interface TableActionsProps {
  solutionId: string;
  onDeleteClick: (id: string) => void;
}

export const TableActions: React.FC<TableActionsProps> = ({
  solutionId,
  onDeleteClick,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate(`/solutions/${solutionId}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate(`/admin/solutions/${solutionId}`)}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate(`/admin/analytics/${solutionId}`)}
      >
        <BarChart2 className="h-4 w-4" />
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => onDeleteClick(solutionId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

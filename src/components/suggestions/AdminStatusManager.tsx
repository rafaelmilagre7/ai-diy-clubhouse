
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAdminSuggestions } from '@/hooks/suggestions/useAdminSuggestions';
import { toast } from 'sonner';

interface AdminStatusManagerProps {
  suggestionId: string;
  currentStatus: string;
  onStatusUpdate?: () => void;
}

const statusOptions = [
  { value: 'new', label: 'Nova', icon: AlertCircle, color: 'bg-blue-500' },
  { value: 'under_review', label: 'Em Análise', icon: Clock, color: 'bg-purple-500' },
  { value: 'in_development', label: 'Em Desenvolvimento', icon: Play, color: 'bg-amber-500' },
  { value: 'completed', label: 'Implementada', icon: CheckCircle, color: 'bg-green-500' },
  { value: 'declined', label: 'Recusada', icon: XCircle, color: 'bg-red-500' }
];

export const AdminStatusManager = ({ 
  suggestionId, 
  currentStatus, 
  onStatusUpdate 
}: AdminStatusManagerProps) => {
  const { updateSuggestionStatus, loading } = useAdminSuggestions();

  const handleStatusChange = async (newStatus: string) => {
    try {
      const success = await updateSuggestionStatus(suggestionId, newStatus);
      if (success && onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status da sugestão');
    }
  };

  const currentStatusConfig = statusOptions.find(s => s.value === currentStatus);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-300">Status atual:</span>
        {currentStatusConfig && (
          <Badge className={`${currentStatusConfig.color} text-white`}>
            <currentStatusConfig.icon className="h-3 w-3 mr-1" />
            {currentStatusConfig.label}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-300">Alterar status:</span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {statusOptions.map((status) => (
            <Button
              key={status.value}
              variant="outline"
              size="sm"
              className={`flex items-center gap-2 ${
                currentStatus === status.value 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'border-white/20 text-white hover:bg-white/10'
              }`}
              disabled={loading || currentStatus === status.value}
              onClick={() => handleStatusChange(status.value)}
            >
              <status.icon className="h-3 w-3" />
              <span className="text-xs">{status.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

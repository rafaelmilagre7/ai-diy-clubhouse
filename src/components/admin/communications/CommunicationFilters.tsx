
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CommunicationFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: string) => void;
}

export const CommunicationFilters = ({
  statusFilter,
  priorityFilter,
  onStatusChange,
  onPriorityChange
}: CommunicationFiltersProps) => {
  return (
    <div className="flex gap-4">
      <div className="space-y-2">
        <Label htmlFor="status-filter">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger id="status-filter" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="scheduled">Agendadas</SelectItem>
            <SelectItem value="sent">Enviadas</SelectItem>
            <SelectItem value="failed">Falharam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority-filter">Prioridade</Label>
        <Select value={priorityFilter} onValueChange={onPriorityChange}>
          <SelectTrigger id="priority-filter" className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="low">Baixa</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="urgent">Urgente</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

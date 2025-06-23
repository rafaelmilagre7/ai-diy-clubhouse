
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Users, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useCommunications } from '@/hooks/admin/useCommunications';
import { CommunicationEditor } from '@/components/admin/communications/CommunicationEditor';
import { CommunicationStats } from '@/components/admin/communications/CommunicationStats';
import { CommunicationsList } from '@/components/admin/communications/CommunicationsList';
import { CommunicationFilters } from '@/components/admin/communications/CommunicationFilters';
import { toast } from 'sonner';

const AdminCommunications = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [editingCommunication, setEditingCommunication] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  const { 
    communications, 
    isLoading, 
    createCommunication, 
    updateCommunication,
    deleteCommunication,
    sendCommunication 
  } = useCommunications();

  const handleCreateNew = () => {
    setEditingCommunication(null);
    setShowEditor(true);
  };

  const handleEdit = (communication) => {
    setEditingCommunication(communication);
    setShowEditor(true);
  };

  const handleSave = async (communicationData) => {
    try {
      if (editingCommunication) {
        await updateCommunication.mutateAsync({
          id: editingCommunication.id,
          ...communicationData
        });
      } else {
        await createCommunication.mutateAsync(communicationData);
      }
      setShowEditor(false);
      setEditingCommunication(null);
    } catch (error) {
      console.error('Erro ao salvar comunicação:', error);
    }
  };

  const handleSend = async (communicationId) => {
    try {
      await sendCommunication.mutateAsync(communicationId);
      toast.success('Comunicação enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar comunicação');
    }
  };

  const handleDelete = async (communicationId) => {
    if (window.confirm('Tem certeza que deseja deletar esta comunicação?')) {
      try {
        await deleteCommunication.mutateAsync(communicationId);
      } catch (error) {
        console.error('Erro ao deletar comunicação:', error);
      }
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comm.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || comm.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (showEditor) {
    return (
      <CommunicationEditor
        communication={editingCommunication}
        onSave={handleSave}
        onCancel={() => {
          setShowEditor(false);
          setEditingCommunication(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Comunicações</h1>
          <p className="text-muted-foreground">
            Gerencie comunicações e notificações do sistema
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Comunicação
        </Button>
      </div>

      {/* Estatísticas */}
      <CommunicationStats />

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar comunicações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <CommunicationFilters
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              onStatusChange={setStatusFilter}
              onPriorityChange={setPriorityFilter}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comunicações */}
      <CommunicationsList
        communications={filteredCommunications}
        isLoading={isLoading}
        onEdit={handleEdit}
        onSend={handleSend}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminCommunications;

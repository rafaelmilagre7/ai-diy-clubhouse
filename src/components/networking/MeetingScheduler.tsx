import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Video, Phone, MapPin, Plus, CheckCircle, XCircle, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNetworkingMeetings } from '@/hooks/useNetworkingMeetings';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import LoadingScreen from '@/components/common/LoadingScreen';

interface MeetingSchedulerProps {
  participantId: string;
  participantName: string;
  connectionId?: string;
}

export const MeetingScheduler = ({ participantId, participantName, connectionId }: MeetingSchedulerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: `Reunião com ${participantName}`,
    description: '',
    scheduled_for: '',
    duration_minutes: 30,
    meeting_type: 'video' as 'video' | 'phone' | 'in_person',
    meeting_link: '',
    location: ''
  });

  const { scheduleMeeting } = useNetworkingMeetings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await scheduleMeeting.mutateAsync({
        participant_id: participantId,
        connection_id: connectionId,
        ...formData
      });
      
      setIsOpen(false);
      setFormData({
        title: `Reunião com ${participantName}`,
        description: '',
        scheduled_for: '',
        duration_minutes: 30,
        meeting_type: 'video',
        meeting_link: '',
        location: ''
      });
    } catch (error) {
      console.error('Erro ao agendar reunião:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs">
          <Calendar className="h-3 w-3 mr-1" />
          Agendar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Agendar Reunião
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Pauta da reunião..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled_for">Data e Hora</Label>
              <Input
                id="scheduled_for"
                type="datetime-local"
                value={formData.scheduled_for}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduled_for: e.target.value }))}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            <div>
              <Label htmlFor="duration">Duração (min)</Label>
              <Select
                value={formData.duration_minutes.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration_minutes: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 min</SelectItem>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h 30min</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="meeting_type">Tipo de Reunião</Label>
            <Select
              value={formData.meeting_type}
              onValueChange={(value: 'video' | 'phone' | 'in_person') => 
                setFormData(prev => ({ ...prev, meeting_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Videochamada
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Telefone
                  </div>
                </SelectItem>
                <SelectItem value="in_person">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Presencial
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.meeting_type === 'video' && (
            <div>
              <Label htmlFor="meeting_link">Link da Reunião</Label>
              <Input
                id="meeting_link"
                value={formData.meeting_link}
                onChange={(e) => setFormData(prev => ({ ...prev, meeting_link: e.target.value }))}
                placeholder="https://meet.google.com/..."
              />
            </div>
          )}

          {formData.meeting_type === 'in_person' && (
            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Endereço do encontro..."
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="aurora-primary"
              disabled={scheduleMeeting.isPending}
              className="flex-1"
            >
              {scheduleMeeting.isPending ? 'Agendando...' : 'Agendar Reunião'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const MeetingsList = () => {
  const { upcomingMeetings, pastMeetings, isLoading, updateMeetingStatus, cancelMeeting } = useNetworkingMeetings();

  if (isLoading) {
    return <LoadingScreen message="Carregando reuniões..." />;
  }

  const getMeetingIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'phone': return Phone;
      case 'in_person': return MapPin;
      default: return Calendar;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'scheduled': 
        return { color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', label: 'Agendada' };
      case 'confirmed': 
        return { color: 'bg-green-500/10 text-green-400 border-green-500/30', label: 'Confirmada' };
      case 'cancelled': 
        return { color: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'Cancelada' };
      case 'completed': 
        return { color: 'bg-gray-500/10 text-gray-400 border-gray-500/30', label: 'Concluída' };
      default: 
        return { color: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/30', label: status };
    }
  };

  return (
    <div className="space-y-6">
      {upcomingMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Próximas Reuniões</h3>
          <div className="space-y-3">
            {upcomingMeetings.map((meeting, index) => {
              const Icon = getMeetingIcon(meeting.meeting_type);
              const statusConfig = getStatusConfig(meeting.status);
              const otherUser = meeting.organizer_id === meeting.organizer?.id 
                ? meeting.participant 
                : meeting.organizer;

              return (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-border bg-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-aurora-primary/10 rounded-lg">
                            <Icon className="h-4 w-4 text-aurora-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{meeting.title}</h4>
                            <p className="text-sm text-neutral-400">com {otherUser?.name}</p>
                          </div>
                        </div>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-neutral-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(meeting.scheduled_for), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {meeting.duration_minutes} minutos
                        </div>
                        {meeting.description && (
                          <p className="text-neutral-400 text-xs bg-neutral-800/50 p-2 rounded">
                            {meeting.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          onClick={() => updateMeetingStatus.mutate({ 
                            meetingId: meeting.id, 
                            status: 'confirmed' 
                          })}
                          disabled={meeting.status === 'confirmed'}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelMeeting.mutate(meeting.id)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {pastMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Reuniões Anteriores</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {pastMeetings.slice(0, 5).map((meeting, index) => {
              const statusConfig = getStatusConfig(meeting.status);
              const otherUser = meeting.organizer_id === meeting.organizer?.id 
                ? meeting.participant 
                : meeting.organizer;

              return (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-3 bg-neutral-900/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm text-white">{meeting.title}</p>
                    <p className="text-xs text-neutral-400">
                      {format(new Date(meeting.scheduled_for), "dd/MM/yyyy", { locale: ptBR })} • {otherUser?.name}
                    </p>
                  </div>
                  <Badge className={statusConfig.color} variant="outline">
                    {statusConfig.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcomingMeetings.length === 0 && pastMeetings.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">Nenhuma reunião agendada</h3>
          <p className="text-sm">Comece agendando reuniões com suas conexões!</p>
        </div>
      )}
    </div>
  );
};
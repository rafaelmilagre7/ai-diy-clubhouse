import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NotificationStat {
  type: string;
  category: string;
  priority: string;
  total: number;
  unread: number;
  last_24h: number;
  last_created: string;
}

export default function NotificationsStats() {
  const navigate = useNavigate();

  const { data: stats = [], isLoading } = useQuery({
    queryKey: ['notification-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications_stats')
        .select('*');
      
      if (error) throw error;
      return data as NotificationStat[];
    },
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      learning: 'bg-aurora-primary/10 text-aurora-primary border-aurora-primary/30',
      solutions: 'bg-aurora-secondary/10 text-aurora-secondary border-aurora-secondary/30',
      community: 'bg-gradient-primary/10 text-gradient-primary border-gradient-primary/30',
      suggestions: 'bg-status-info/10 text-status-info border-status-info/30',
      events: 'bg-status-warning/10 text-status-warning border-status-warning/30',
      certificates: 'bg-status-success/10 text-status-success border-status-success/30',
      system: 'bg-textSecondary/10 text-textSecondary border-textSecondary/30',
    };
    return colors[category] || 'bg-surface-elevated text-textPrimary border-border';
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      high: { variant: 'destructive', label: 'Alta' },
      normal: { variant: 'default', label: 'Normal' },
      low: { variant: 'secondary', label: 'Baixa' },
    };
    
    const config = variants[priority] || variants.normal;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      comment_liked: '👍',
      comment_replied: '💬',
      new_course: '🎓',
      new_lesson: '📚',
      new_module: '📂',
      new_solution: '💡',
      suggestion_status_change: '📋',
      official_suggestion_comment: '📢',
      topic_solved: '✅',
      community_reply: '💬',
      community_mention: '👤',
      event_reminder_24h: '📅',
      event_reminder_1h: '⏰',
      certificate_available: '🎖️',
      test: '🧪',
    };
    return icons[type] || '🔔';
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aurora-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="icon"
          className="hover:bg-surface-elevated"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-textPrimary">
            Estatísticas de Notificações
          </h1>
          <p className="text-textSecondary mt-1">
            Visualização detalhada de todas as notificações do sistema
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4">
        {stats.map((stat) => (
          <Card 
            key={`${stat.type}-${stat.category}`}
            className={cn(
              "bg-surface border transition-all duration-fast hover:shadow-elegant",
              "hover:border-aurora-primary/50"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getTypeIcon(stat.type)}</span>
                  <div>
                    <CardTitle className="text-lg text-textPrimary">
                      {stat.type.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(stat.category)}
                      >
                        {stat.category}
                      </Badge>
                      {getPriorityBadge(stat.priority)}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 rounded-lg bg-surface-elevated">
                  <div className="text-2xl font-bold text-aurora-primary">
                    {stat.total}
                  </div>
                  <div className="text-xs text-textSecondary mt-1">
                    Total
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-status-warning/10">
                  <div className="text-2xl font-bold text-status-warning">
                    {stat.unread}
                  </div>
                  <div className="text-xs text-textSecondary mt-1">
                    Não Lidas
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-aurora-secondary/10">
                  <div className="text-2xl font-bold text-aurora-secondary">
                    {stat.last_24h}
                  </div>
                  <div className="text-xs text-textSecondary mt-1">
                    Últimas 24h
                  </div>
                </div>
                
                <div className="p-3 rounded-lg bg-surface-elevated">
                  <div className="text-xs font-medium text-textSecondary">
                    Última em
                  </div>
                  <div className="text-xs text-textPrimary mt-1 font-mono">
                    {new Date(stat.last_created).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stats.length === 0 && (
        <Card className="bg-surface border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-textSecondary text-center">
              Nenhuma notificação foi criada ainda
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

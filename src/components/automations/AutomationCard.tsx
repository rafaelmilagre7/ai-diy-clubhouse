import { Play, Pause, Edit, Trash2, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AutomationCardProps {
  rule: {
    id: string;
    name: string;
    description: string;
    rule_type: string;
    is_active: boolean;
    conditions: any;
    actions: any[];
    priority: number;
    created_at: string;
    updated_at: string;
  };
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const AutomationCard = ({ rule, onToggle, onEdit, onDelete }: AutomationCardProps) => {
  const getRuleTypeLabel = (type: string) => {
    switch (type) {
      case 'webhook': return 'Webhook';
      case 'schedule': return 'Agendada';
      case 'manual': return 'Manual';
      default: return type;
    }
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'webhook': return 'bg-blue-100 text-blue-800';
      case 'schedule': return 'bg-green-100 text-green-800';
      case 'manual': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`transition-all hover:shadow-md ${
      rule.is_active ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50/50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {rule.is_active ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
              {rule.name}
            </CardTitle>
            <CardDescription className="line-clamp-2">
              {rule.description || 'Sem descrição'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getRuleTypeColor(rule.rule_type)}>
              {getRuleTypeLabel(rule.rule_type)}
            </Badge>
            <Badge variant="outline">
              Prioridade {rule.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Status: <span className={`font-medium ${
                rule.is_active ? 'text-green-600' : 'text-gray-500'
              }`}>
                {rule.is_active ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {rule.actions?.length || 0} ação(ões) configuradas
            </div>
          </div>

          {/* Dates */}
          <div className="text-xs text-muted-foreground flex justify-between">
            <span>
              Criada em {format(new Date(rule.created_at), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
            <span>
              Atualizada em {format(new Date(rule.updated_at), 'dd/MM/yyyy', { locale: ptBR })}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={rule.is_active ? "outline" : "default"}
                onClick={() => onToggle(rule.id, rule.is_active)}
              >
                {rule.is_active ? (
                  <>
                    <Pause className="mr-1 h-3 w-3" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="mr-1 h-3 w-3" />
                    Ativar
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(rule.id)}
              >
                <Edit className="mr-1 h-3 w-3" />
                Editar
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(rule.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
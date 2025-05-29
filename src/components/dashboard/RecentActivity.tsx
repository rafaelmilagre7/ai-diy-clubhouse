
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const RecentActivity = () => {
  // Mock data para atividades recentes
  const recentActivities = [
    {
      id: "1",
      type: "solution_start",
      title: "Iniciou implementação",
      description: "Chatbot de Atendimento",
      timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 min atrás
    },
    {
      id: "2", 
      type: "module_complete",
      title: "Concluiu módulo",
      description: "Configuração inicial",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2h atrás
    },
    {
      id: "3",
      type: "solution_view",
      title: "Visualizou solução",
      description: "Automação de Email Marketing",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4) // 4h atrás
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "solution_start":
        return <User className="h-4 w-4 text-green-500" />;
      case "module_complete":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "solution_view":
        return <Clock className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {activity.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(activity.timestamp, { 
                    addSuffix: true, 
                    locale: ptBR 
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

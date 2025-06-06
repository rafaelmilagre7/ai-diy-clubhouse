
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Eye, 
  Play, 
  CheckCircle, 
  Clock 
} from "lucide-react";

export const RecentActivity = () => {
  const activities = [
    {
      action: "Visualizou solução",
      item: "Assistente de IA no WhatsApp",
      time: "2 horas atrás",
      icon: Eye,
      color: "text-blue-500"
    },
    {
      action: "Iniciou implementação",
      item: "Chatbot para Vendas",
      time: "1 dia atrás",
      icon: Play,
      color: "text-green-500"
    },
    {
      action: "Completou módulo",
      item: "Automação de E-mails",
      time: "2 dias atrás",
      icon: CheckCircle,
      color: "text-purple-500"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`p-2 rounded-full bg-gray-800`}>
              <activity.icon className={`h-4 w-4 ${activity.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">
                {activity.action}
              </p>
              <p className="text-sm text-gray-400">
                {activity.item}
              </p>
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              {activity.time}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

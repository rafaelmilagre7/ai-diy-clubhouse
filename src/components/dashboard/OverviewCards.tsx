
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Zap, 
  CheckCircle, 
  Clock, 
  TrendingUp 
} from "lucide-react";

export const OverviewCards = () => {
  const cards = [
    {
      title: "Soluções Ativas",
      value: "3",
      description: "Projetos em andamento",
      icon: Zap,
      color: "text-blue-500"
    },
    {
      title: "Implementações Concluídas",
      value: "12",
      description: "Projetos finalizados",
      icon: CheckCircle,
      color: "text-green-500"
    },
    {
      title: "Tempo Médio",
      value: "2h 30m",
      description: "Por implementação",
      icon: Clock,
      color: "text-orange-500"
    },
    {
      title: "Progresso Geral",
      value: "75%",
      description: "Do seu plano",
      icon: TrendingUp,
      color: "text-purple-500"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <p className="text-xs text-gray-400">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

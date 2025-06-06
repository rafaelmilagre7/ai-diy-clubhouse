
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Zap, 
  BookOpen, 
  Users, 
  MessageSquare,
  Calendar
} from "lucide-react";

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Explorar Soluções",
      description: "Descubra novas soluções de IA",
      icon: Zap,
      onClick: () => navigate("/solutions"),
      color: "bg-viverblue"
    },
    {
      title: "Continuar Aprendizado",
      description: "Retome seus cursos em andamento",
      icon: BookOpen,
      onClick: () => navigate("/learning"),
      color: "bg-green-600"
    },
    {
      title: "Participar da Comunidade",
      description: "Conecte-se com outros membros",
      icon: Users,
      onClick: () => navigate("/comunidade"),
      color: "bg-purple-600"
    },
    {
      title: "Dar Sugestão",
      description: "Compartilhe suas ideias",
      icon: MessageSquare,
      onClick: () => navigate("/suggestions/new"),
      color: "bg-orange-600"
    },
    {
      title: "Ver Eventos",
      description: "Confira os próximos eventos",
      icon: Calendar,
      onClick: () => navigate("/events"),
      color: "bg-blue-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            className="w-full justify-start h-auto p-4 border-gray-700 hover:bg-gray-800"
            onClick={action.onClick}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded ${action.color}`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">{action.title}</p>
                <p className="text-sm text-gray-400">{action.description}</p>
              </div>
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
};

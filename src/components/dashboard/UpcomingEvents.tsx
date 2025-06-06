
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users 
} from "lucide-react";

export const UpcomingEvents = () => {
  const events = [
    {
      title: "Workshop: IA para Vendas",
      date: "15 de Jun",
      time: "14:00",
      participants: 24,
      type: "workshop"
    },
    {
      title: "Masterclass: Automação Avançada",
      date: "18 de Jun",
      time: "19:00",
      participants: 45,
      type: "masterclass"
    },
    {
      title: "Q&A Semanal",
      date: "20 de Jun",
      time: "20:00",
      participants: 12,
      type: "qa"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-white">Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border border-gray-700 rounded-lg p-4">
            <h4 className="font-medium text-white mb-2">{event.title}</h4>
            <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{event.participants} inscritos</span>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full border-gray-700 hover:bg-gray-800"
            >
              Participar
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

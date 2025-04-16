
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, FileText, Award, Calendar } from "lucide-react";

export const RecentActivity = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b">
            <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="font-medium">João Silva completou a implementação</p>
              <p className="text-sm text-muted-foreground">Assistente de vendas no Instagram</p>
              <p className="text-xs text-muted-foreground mt-1">Hoje às 14:32</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 pb-4 border-b">
            <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="font-medium">Nova solução publicada</p>
              <p className="text-sm text-muted-foreground">Automação de atendimento ao cliente em tempo real</p>
              <p className="text-xs text-muted-foreground mt-1">Ontem às 17:45</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4 pb-4 border-b">
            <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="font-medium">Maria Oliveira ganhou badge</p>
              <p className="text-sm text-muted-foreground">Especialista em Automação de Marketing</p>
              <p className="text-xs text-muted-foreground mt-1">2 dias atrás</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-viverblue/10 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-viverblue" />
            </div>
            <div>
              <p className="font-medium">Workshop agendado</p>
              <p className="text-sm text-muted-foreground">Implementação de IA Generativa em Vendas</p>
              <p className="text-xs text-muted-foreground mt-1">3 dias atrás</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

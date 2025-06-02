
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

const CommunityHome = () => {
  return (
    <div className="container py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 rounded-full bg-viverblue/10">
            <MessageSquare className="w-6 h-6 text-viverblue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-1">Comunidade</h1>
            <p className="text-muted-foreground">
              Conecte-se com outros membros e compartilhe conhecimento.
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo à Comunidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Este é o espaço para discussões, perguntas e troca de experiências entre membros da comunidade Viver de IA.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommunityHome;

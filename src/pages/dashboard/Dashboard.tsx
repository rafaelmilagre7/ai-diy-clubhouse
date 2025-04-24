
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { CheckCircle, Info, Lightbulb, Clock, Star } from "lucide-react";

const Dashboard = () => {
  const { user, profile } = useAuth();
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            Olá, {profile?.name || user?.user_metadata?.name || 'Membro'}!
          </h1>
          <p className="text-muted-foreground">
            Bem-vindo ao seu dashboard do VIVER DE IA Club
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid grid-cols-3 w-full md:w-[400px]">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="solutions">Soluções</TabsTrigger>
          <TabsTrigger value="activity">Atividade</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 mt-6">
          <Alert className="bg-blue-50 border-blue-100">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">Bem-vindo à Plataforma DIY do VIVER DE IA Club</AlertTitle>
            <AlertDescription className="text-blue-600">
              Esta plataforma foi desenvolvida para ajudar você a implementar soluções de IA com facilidade.
              Explore as soluções disponíveis e comece sua jornada de transformação com IA.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Star className="mr-2 h-4 w-4 text-amber-500" />
                  Soluções Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Baseadas no seu perfil de implementação
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/solutions">Explorar Soluções</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-orange-500" />
                  Soluções em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Você não tem soluções em andamento
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/solutions">Iniciar Uma Solução</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Soluções Concluídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4">
                  Você ainda não concluiu nenhuma solução
                </p>
                <Button asChild variant="outline" className="w-full" disabled>
                  <Link to="/solutions">Ver Concluídas</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="solutions" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-4 w-4 text-blue-500" />
                    Solução de Exemplo {i + 1}
                  </CardTitle>
                  <CardDescription>
                    Uma solução de IA para demonstração
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta é uma solução de exemplo para demonstrar o layout da plataforma.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/solutions/${i + 1}`}>Ver Detalhes</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Atividade Recente</CardTitle>
              <CardDescription>
                Seu histórico de atividades na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma atividade registrada ainda
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;

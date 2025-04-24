
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Users, Lightbulb, Activity } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * AdminDashboard - Dashboard administrativo simplificado
 */
const AdminDashboard = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-muted-foreground">
            Bem-vindo ao painel de controle do VIVER DE IA Club
          </p>
        </div>
        
        <Button asChild variant="outline">
          <Link to="/admin/diagnostic" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Diagnóstico do Sistema
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Usuários</CardTitle>
            <CardDescription>Gerenciar usuários da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">Ver Detalhes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Soluções</CardTitle>
            <CardDescription>Gerenciar soluções disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">Ver Detalhes</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Atividade</CardTitle>
            <CardDescription>Acompanhar atividade dos usuários</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="bg-purple-100 p-3 rounded-full">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" size="sm" className="w-full">Ver Detalhes</Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Status do Sistema</CardTitle>
          <CardDescription>
            Verifique a saúde do sistema e conexões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-100">
              <span className="font-medium">Conexão com Supabase</span>
              <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full">Ativa</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-md border border-green-100">
              <span className="font-medium">Autenticação</span>
              <span className="text-green-600 text-sm bg-green-100 px-2 py-1 rounded-full">Configurada</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button asChild variant="outline">
            <Link to="/admin/diagnostic">
              Diagnóstico Completo
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminDashboard;

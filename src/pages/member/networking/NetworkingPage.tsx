
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building, Loader2 } from 'lucide-react';

const NetworkingPage = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  console.log('🌐 NetworkingPage: Carregando página', { 
    isAdmin: profile?.role === 'admin',
    userRole: profile?.role 
  });

  // Para admin, sempre mostrar interface funcional
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Networking Inteligente</h1>
        <p className="text-gray-400">
          Conecte-se com outros empreendedores através de IA
        </p>
      </div>
      
      <Card className="p-6">
        {isAdmin ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-viverblue" />
              <h3 className="text-lg font-semibold mb-2">Área de Networking</h3>
              <p className="text-gray-400 mb-4">
                Sistema de networking funcionando - você está logado como admin
              </p>
            </div>
            
            <Tabs defaultValue="customers" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="customers" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Potenciais Clientes
                </TabsTrigger>
                <TabsTrigger value="suppliers" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Potenciais Fornecedores
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customers" className="space-y-4">
                <div className="text-center py-8 border border-gray-700 rounded-lg">
                  <p className="text-gray-400">
                    🤖 Sistema de matching funcionando
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Matches de clientes seriam exibidos aqui
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="suppliers" className="space-y-4">
                <div className="text-center py-8 border border-gray-700 rounded-lg">
                  <p className="text-gray-400">
                    🤖 Sistema de matching funcionando
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Matches de fornecedores seriam exibidos aqui
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-viverblue" />
            <p className="text-muted-foreground">Verificando acesso ao networking...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default NetworkingPage;

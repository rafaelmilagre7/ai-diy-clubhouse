
import { useDocumentTitle } from "@/hooks/use-document-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ConfigurationSection from "@/components/admin/whatsapp-debug/ConfigurationSection";
import TemplateTestSection from "@/components/admin/whatsapp-debug/TemplateTestSection";
import SendTestSection from "@/components/admin/whatsapp-debug/SendTestSection";
import LogsSection from "@/components/admin/whatsapp-debug/LogsSection";
import { MessageCircle, Settings, TestTube, Send, FileText } from "lucide-react";

const WhatsAppDebug = () => {
  useDocumentTitle("Debug WhatsApp | Admin");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <MessageCircle className="h-8 w-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold">Debug WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Ferramentas para testar e diagnosticar problemas na integração WhatsApp
          </p>
        </div>
      </div>

      <Tabs defaultValue="config" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Teste de Envio
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Verificação de Configuração</CardTitle>
              <CardDescription>
                Validar tokens, IDs e conectividade com a API do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigurationSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Templates</CardTitle>
              <CardDescription>
                Validar templates disponíveis e testar envios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateTestSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Envio</CardTitle>
              <CardDescription>
                Enviar mensagens de teste e visualizar respostas em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SendTestSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs e Debugging</CardTitle>
              <CardDescription>
                Visualizar logs recentes das Edge Functions e erros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogsSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppDebug;


import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { TestTube, Loader2, MessageCircle } from "lucide-react";

interface Template {
  name: string;
  status: string;
  language: string;
  category: string;
}

const TemplateTestSection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [testingTemplate, setTestingTemplate] = useState<string | null>(null);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      console.log("📋 Carregando templates disponíveis...");

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { action: 'list_templates' }
      });

      if (error) {
        toast.error("Erro ao carregar templates");
        console.error("Erro:", error);
        return;
      }

      setTemplates(data.templates || []);
      console.log("Templates carregados:", data.templates);

    } catch (err: any) {
      console.error("Erro ao carregar templates:", err);
      toast.error("Erro ao carregar templates");
    } finally {
      setIsLoading(false);
    }
  };

  const testTemplate = async (templateName: string) => {
    setTestingTemplate(templateName);
    try {
      console.log(`🧪 Testando template: ${templateName}`);

      const { data, error } = await supabase.functions.invoke('whatsapp-config-check', {
        body: { 
          action: 'test_template',
          templateName,
          phoneNumber: '5531999999999' // Número de teste
        }
      });

      if (error) {
        toast.error(`Erro ao testar template ${templateName}`);
        console.error("Erro:", error);
        return;
      }

      if (data.success) {
        toast.success(`Template ${templateName} testado com sucesso`);
      } else {
        toast.warning(`Falha no teste do template ${templateName}: ${data.error}`);
      }

      console.log("Resultado do teste:", data);

    } catch (err: any) {
      console.error("Erro ao testar template:", err);
      toast.error(`Erro ao testar template ${templateName}`);
    } finally {
      setTestingTemplate(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'APPROVED' ? 'default' : 
                   status === 'PENDING' ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Templates Disponíveis</h3>
        <Button 
          onClick={loadTemplates} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube className="h-4 w-4" />}
          {isLoading ? "Carregando..." : "Carregar Templates"}
        </Button>
      </div>

      {templates.length > 0 && (
        <div className="grid gap-4">
          {templates.map((template) => (
            <Card key={template.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {template.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(template.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testTemplate(template.name)}
                      disabled={testingTemplate === template.name}
                    >
                      {testingTemplate === template.name ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "Testar"
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Idioma: {template.language}</span>
                  <span>Categoria: {template.category}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {templates.length === 0 && !isLoading && (
        <Alert>
          <MessageCircle className="h-4 w-4" />
          <AlertDescription>
            Clique em "Carregar Templates" para ver os templates disponíveis na sua conta WhatsApp Business.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-800">Template de Convite</CardTitle>
          <CardDescription className="text-blue-600">
            O sistema está procurando pelo template "convite_acesso" em pt_BR
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            Se o template "convite_acesso" não aparecer na lista ou estiver com status diferente de "APPROVED", 
            isso explica o erro que estamos enfrentando.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateTestSection;

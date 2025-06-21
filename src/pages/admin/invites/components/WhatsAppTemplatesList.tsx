
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  status: string;
  language: string;
  category: string;
  components: any[];
  quality_score?: {
    score: string;
    date: number;
  };
}

const WhatsAppTemplatesList = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any>(null);

  const handleSearchTemplates = async () => {
    setIsLoading(true);
    setSearchResult(null);
    
    try {
      console.log('🔍 Buscando todos os templates WhatsApp...');
      const response = await supabase.functions.invoke('whatsapp-list-templates', {
        body: {}
      });

      console.log('🔍 Resposta do discovery:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;
      if (data?.success) {
        setTemplates(data.data.templates || []);
        setSearchResult(data.data);
        
        const targetFound = data.data.hasTargetTemplate;
        if (targetFound) {
          toast.success(`Templates encontrados! Template 'convitevia' está aprovado e disponível.`);
        } else {
          toast.warning(`${data.data.approvedTemplates} templates encontrados, mas 'convitevia' não foi localizado.`);
        }
      } else {
        throw new Error(data?.message || 'Erro ao buscar templates');
      }
    } catch (error: any) {
      console.error('❌ Erro na busca de templates:', error);
      toast.error(error.message || 'Erro ao buscar templates');
      setSearchResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyTemplateConfig = (template: Template) => {
    const config = {
      name: template.name,
      id: template.id,
      language: template.language,
      category: template.category,
      status: template.status
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success(`Configuração do template '${template.name}' copiada!`);
  };

  const isTargetTemplate = (templateName: string) => {
    return templateName === 'convitevia';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Discovery de Templates WhatsApp
        </CardTitle>
        <CardDescription>
          Busque todos os templates aprovados na sua conta WhatsApp Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleSearchTemplates} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Buscando Templates...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Buscar Todos os Templates
            </>
          )}
        </Button>

        {searchResult && (
          <div className="">
            <div className="flex items-center gap-2 mb-2">
              {searchResult.success ? (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-semibold">
                {searchResult.success ? 'Busca Concluída!' : 'Erro na Busca!'}
              </span>
            </div>
            
            {searchResult.success ? (
              <div className="text-sm space-y-1">
                <p><strong>Total de templates:</strong> {searchResult.totalTemplates}</p>
                <p><strong>Templates aprovados:</strong> {searchResult.approvedTemplates}</p>
                <p><strong>Business ID:</strong> {searchResult.businessId}</p>
                <p><strong>Template 'convitevia' encontrado:</strong> 
                  <Badge variant={searchResult.hasTargetTemplate ? "default" : "destructive"} className="ml-2">
                    {searchResult.hasTargetTemplate ? "✅ SIM" : "❌ NÃO"}
                  </Badge>
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600">{searchResult.error}</p>
            )}
          </div>
        )}

        {templates.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Templates Aprovados ({templates.length})</h3>
            
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {templates.map(template => (
                <div key={template.id} className="">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{template.name}</h4>
                      {isTargetTemplate(template.name) && (
                        <Badge variant="default" className="bg-green-600">
                          🎯 TEMPLATE ATUAL
                        </Badge>
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyTemplateConfig(template)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>ID:</strong> {template.id}</p>
                    <p><strong>Idioma:</strong> {template.language}</p>
                    <p><strong>Categoria:</strong> {template.category}</p>
                    <p><strong>Status:</strong> 
                      <Badge variant="outline" className="ml-1">
                        {template.status}
                      </Badge>
                    </p>
                    {template.quality_score && (
                      <p><strong>Quality Score:</strong> {template.quality_score.score}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Objetivo:</strong> Encontrar e confirmar o template 'convitevia' (ID: 1413982056507354)</p>
          <p><strong>Uso:</strong> Template para envio de convites da plataforma via WhatsApp</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppTemplatesList;


import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, CheckCircle, AlertCircle, Copy, Eye } from 'lucide-react';
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

interface TemplatesData {
  totalTemplates: number;
  approvedTemplates: number;
  templates: Template[];
  hasTargetTemplate: boolean;
  targetTemplate: Template | null;
  businessId: string;
}

const WhatsAppTemplatesList = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [templatesData, setTemplatesData] = useState<TemplatesData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleSearchTemplates = async () => {
    setIsLoading(true);
    setTemplatesData(null);

    try {
      console.log('📋 Buscando templates WhatsApp...');

      const response = await supabase.functions.invoke('whatsapp-list-templates', {
        body: {}
      });

      console.log('📋 Resposta da busca:', response);

      if (response.error) {
        throw new Error(response.error.message);
      }

      if (response.data?.success) {
        setTemplatesData(response.data.data);
        toast.success(`${response.data.data.approvedTemplates} templates aprovados encontrados!`);
      } else {
        toast.error(response.data?.message || 'Erro ao buscar templates');
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar templates:', error);
      toast.error(error.message || 'Erro ao buscar templates');
    } finally {
      setIsLoading(false);
    }
  };

  const extractTemplateVariables = (components: any[]) => {
    const bodyComponent = components.find(c => c.type === 'BODY');
    if (!bodyComponent || !bodyComponent.text) return [];

    const variables = bodyComponent.text.match(/\{\{(\d+)\}\}/g) || [];
    return variables.map((v: string) => v.replace(/[{}]/g, ''));
  };

  const copyTemplateConfig = (template: Template) => {
    const variables = extractTemplateVariables(template.components);
    const config = {
      templateName: template.name,
      templateId: template.id,
      language: template.language,
      variables: variables,
      category: template.category
    };

    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast.success('Configuração do template copiada!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MARKETING': return 'bg-blue-100 text-blue-800';
      case 'UTILITY': return 'bg-purple-100 text-purple-800';
      case 'AUTHENTICATION': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5 text-blue-600" />
          Discovery de Templates WhatsApp
        </CardTitle>
        <CardDescription>
          Busque e analise todos os templates aprovados da sua conta Meta Business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleSearchTemplates}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Search className="h-4 w-4 mr-2 animate-spin" />
              Buscando Templates...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Buscar Todos os Templates
            </>
          )}
        </Button>

        {templatesData && (
          <div className="space-y-4">
            {/* Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{templatesData.totalTemplates}</div>
                <div className="text-sm text-blue-800">Total de Templates</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{templatesData.approvedTemplates}</div>
                <div className="text-sm text-green-800">Templates Aprovados</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{templatesData.businessId}</div>
                <div className="text-sm text-purple-800">Business ID</div>
              </div>
            </div>

            {/* Template Alvo */}
            {templatesData.hasTargetTemplate && templatesData.targetTemplate && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Template "convite_viver_ia" encontrado!</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>ID:</strong> {templatesData.targetTemplate.id}</div>
                  <div><strong>Language:</strong> {templatesData.targetTemplate.language}</div>
                  <div><strong>Category:</strong> {templatesData.targetTemplate.category}</div>
                  <div><strong>Variables:</strong> {extractTemplateVariables(templatesData.targetTemplate.components).join(', ')}</div>
                </div>
              </div>
            )}

            {!templatesData.hasTargetTemplate && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Template "convite_viver_ia" não encontrado</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  O template pode não estar aprovado para esta conta ou ter um nome diferente.
                </p>
              </div>
            )}

            {/* Tabela de Templates */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Idioma</TableHead>
                    <TableHead>Variáveis</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templatesData.templates.map((template) => (
                    <TableRow 
                      key={template.id}
                      className={template.name === 'convite_viver_ia' ? 'bg-green-50' : ''}
                    >
                      <TableCell className="font-medium">
                        {template.name}
                        {template.name === 'convite_viver_ia' && (
                          <Badge variant="secondary" className="ml-2">TARGET</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(template.status)}>
                          {template.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell>
                        {extractTemplateVariables(template.components).length > 0 ? (
                          <span className="text-sm font-mono">
                            {extractTemplateVariables(template.components).join(', ')}
                          </span>
                        ) : (
                          <span className="text-gray-500">Nenhuma</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyTemplateConfig(template)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {templatesData.templates.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhum template aprovado encontrado.
              </div>
            )}
          </div>
        )}

        {/* Template Detail Modal/Preview (simplified) */}
        {selectedTemplate && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">Detalhes do Template: {selectedTemplate.name}</h4>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedTemplate(null)}
              >
                ✕
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div><strong>ID:</strong> {selectedTemplate.id}</div>
              <div><strong>Status:</strong> {selectedTemplate.status}</div>
              <div><strong>Categoria:</strong> {selectedTemplate.category}</div>
              <div><strong>Idioma:</strong> {selectedTemplate.language}</div>
              {selectedTemplate.quality_score && (
                <div><strong>Quality Score:</strong> {selectedTemplate.quality_score.score}</div>
              )}
              <div><strong>Componentes:</strong></div>
              <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(selectedTemplate.components, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WhatsAppTemplatesList;

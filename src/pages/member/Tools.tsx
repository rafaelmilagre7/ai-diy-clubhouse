import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Wrench, Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Tools = () => {
  const tools = [
    {
      name: "Gerador de Conteúdo IA",
      description: "Crie textos, artigos e posts automaticamente com IA",
      status: "Disponível",
      category: "Conteúdo"
    },
    {
      name: "Análise de Dados",
      description: "Processe e analise grandes volumes de dados",
      status: "Premium",
      category: "Analytics"
    },
    {
      name: "Chatbot Builder",
      description: "Construa chatbots inteligentes para seu negócio",
      status: "Disponível",
      category: "Automação"
    },
    {
      name: "OCR Scanner",
      description: "Extraia texto de imagens e documentos",
      status: "Disponível",
      category: "Produtividade"
    },
    {
      name: "Previsão de Vendas",
      description: "Preveja tendências de vendas com machine learning",
      status: "Premium",
      category: "Analytics"
    },
    {
      name: "Otimizador SEO",
      description: "Otimize seu conteúdo para mecanismos de busca",
      status: "Disponível",
      category: "Marketing"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Ferramentas de IA</h1>
        <p className="text-muted-foreground">
          Acesse nossa coleção de ferramentas alimentadas por inteligência artificial
        </p>
      </div>
      
      {/* Grid de ferramentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                </div>
                <Badge 
                  variant={tool.status === "Premium" ? "default" : "secondary"}
                >
                  {tool.status}
                </Badge>
              </div>
              <CardDescription>
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{tool.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>IA</span>
                </div>
              </div>
              <Button className="w-full">
                <ExternalLink className="h-4 w-4 mr-2" />
                Usar Ferramenta
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tools;
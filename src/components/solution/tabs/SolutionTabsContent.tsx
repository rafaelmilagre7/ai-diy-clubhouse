
import React from "react";
import { Solution } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SolutionContentSection } from "@/components/solution/SolutionContentSection";
import { CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SolutionTabsContentProps {
  solution: Solution;
  activeTab: string;
  setActiveTab: (value: string) => void;
}

export const SolutionTabsContent = ({ solution, activeTab, setActiveTab }: SolutionTabsContentProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full grid grid-cols-5 mb-6">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="tools">Ferramentas</TabsTrigger>
        <TabsTrigger value="materials">Materiais</TabsTrigger>
        <TabsTrigger value="videos">Vídeos</TabsTrigger>
        <TabsTrigger value="checklist">Checklist</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview">
        <SolutionContentSection solution={solution} />
      </TabsContent>
      
      <TabsContent value="tools">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Ferramentas Necessárias</h3>
          <p className="text-muted-foreground mb-6">
            Estas são as ferramentas que você precisará para implementar esta solução:
          </p>
          <div className="space-y-4">
            {solution.tools && Array.isArray(solution.tools) && solution.tools.length > 0 ? (
              solution.tools.map((tool: any, index: number) => (
                <div key={index} className="flex items-start p-3 border rounded-md">
                  <div className="bg-blue-100 p-2 rounded mr-3">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{tool.name}</h4>
                    <p className="text-sm text-muted-foreground">{tool.description}</p>
                    {tool.url && (
                      <a 
                        href={tool.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                      >
                        Acessar ferramenta
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhuma ferramenta necessária para esta solução</p>
            )}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="materials">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Materiais de Apoio</h3>
          <p className="text-muted-foreground mb-6">
            Baixe os materiais necessários para implementar esta solução:
          </p>
          
          <div className="space-y-4">
            {solution.materials && Array.isArray(solution.materials) && solution.materials.length > 0 ? (
              solution.materials.map((material: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded mr-3">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{material.name}</h4>
                      <p className="text-sm text-muted-foreground">{material.description || 'Material de apoio'}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.open(material.url, '_blank')}
                    disabled={!material.url}
                  >
                    Baixar
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum material disponível para esta solução</p>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="videos">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Vídeos de Instrução</h3>
          <p className="text-muted-foreground mb-6">
            Assista aos vídeos explicativos para facilitar sua implementação:
          </p>
          
          {solution.videos && Array.isArray(solution.videos) && solution.videos.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {solution.videos.map((video: any, index: number) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="aspect-video bg-gray-100">
                    {video.youtube_id ? (
                      <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.youtube_id}`}
                        title={video.title || `Vídeo ${index + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : video.url ? (
                      <iframe 
                        className="w-full h-full"
                        src={video.url}
                        title={video.title || `Vídeo ${index + 1}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-muted-foreground">Vídeo não disponível</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium">{video.title || `Vídeo ${index + 1}`}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{video.description || 'Vídeo instrucional para implementação'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum vídeo disponível para esta solução</p>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="checklist">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium mb-4">Checklist de Implementação</h3>
          <p className="text-muted-foreground mb-6">
            Acompanhe seu progresso na implementação desta solução:
          </p>
          
          {solution.checklist && Array.isArray(solution.checklist) && solution.checklist.length > 0 ? (
            <div className="space-y-4">
              {solution.checklist.map((item: any, index: number) => (
                <div key={index} className="flex items-start p-3 border rounded-md">
                  <input 
                    type="checkbox" 
                    id={`checklist-${index}`}
                    className="mt-1 mr-3 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <label htmlFor={`checklist-${index}`} className="font-medium cursor-pointer">
                      {item.title || `Passo ${index + 1}`}
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description || 'Descrição do passo de implementação'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum checklist disponível para esta solução</p>
              <Button 
                className="mt-4" 
                onClick={() => {}}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                Iniciar Implementação Guiada
              </Button>
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
};

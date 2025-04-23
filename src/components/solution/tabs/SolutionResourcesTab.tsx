
import React from 'react';
import { Solution } from '@/types/solution';
import { Download, File, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SolutionResourcesTabProps {
  solution: Solution;
}

export const SolutionResourcesTab: React.FC<SolutionResourcesTabProps> = ({ solution }) => {
  // Dados fictícios para recursos (em um sistema real, isso viria do objeto solution)
  const resources = [
    { id: '1', name: 'Guia de implementação', type: 'pdf', url: '#' },
    { id: '2', name: 'Template de planejamento', type: 'excel', url: '#' },
    { id: '3', name: 'Checklist de verificação', type: 'pdf', url: '#' },
  ];
  
  const links = [
    { id: '1', title: 'Documentação oficial', url: '#' },
    { id: '2', title: 'Tutorial em vídeo', url: '#' },
    { id: '3', title: 'Artigo sobre o tema', url: '#' },
  ];
  
  const downloadResource = (url: string) => {
    // Em uma aplicação real, isso dispararia o download
    console.log('Iniciando download:', url);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Materiais para Download</h3>
        {resources.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <div key={resource.id} className="border rounded-lg p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <File className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{resource.name}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Formato: {resource.type.toUpperCase()}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadResource(resource.url)}
                  className="mt-auto flex gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum material disponível para esta solução.</p>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Links Úteis</h3>
        {links.length > 0 ? (
          <div className="grid gap-3">
            {links.map((link) => (
              <a 
                key={link.id} 
                href={link.url} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 p-3 border rounded-md hover:bg-slate-50 transition-colors"
              >
                <LinkIcon className="h-4 w-4 text-blue-500" />
                <span>{link.title}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">Nenhum link útil disponível para esta solução.</p>
        )}
      </div>
    </div>
  );
};

export default SolutionResourcesTab;

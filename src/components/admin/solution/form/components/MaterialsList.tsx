
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Resource } from "../types/ResourceTypes";
import MaterialItem from "./MaterialItem";

interface MaterialsListProps {
  filteredResources: Resource[];
  searchQuery: string;
  handleRemoveResource: (id?: string) => Promise<void>;
  formatFileSize: (bytes?: number) => string;
}

const ResourceList: React.FC<MaterialsListProps> = ({ 
  filteredResources, 
  searchQuery, 
  handleRemoveResource,
  formatFileSize
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Materiais Adicionados</CardTitle>
      </CardHeader>
      <CardContent>
        {filteredResources.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {resource.type === 'image' && (
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                          <img src={resource.url} alt={resource.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {resource.type !== 'image' && (
                        <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded">
                          <span className="text-xs font-medium">{resource.format?.toUpperCase() || 'DOC'}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium truncate max-w-[200px]">{resource.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {resource.type} • {formatFileSize(resource.size)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => window.open(resource.url, '_blank')}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Ver
                    </button>
                    <button 
                      onClick={() => handleRemoveResource(resource.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-10 text-muted-foreground">
            {searchQuery ? (
              <p>Nenhum resultado encontrado para "{searchQuery}"</p>
            ) : (
              <p>Nenhum material foi adicionado ainda.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceList;

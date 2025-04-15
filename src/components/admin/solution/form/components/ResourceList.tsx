
import React from "react";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Resource } from "../types/ResourceTypes";
import ResourceItem from "./ResourceItem";

interface ResourceListProps {
  filteredResources: Resource[];
  searchQuery: string;
  handleRemoveResource: (id?: string, url?: string) => Promise<void>;
  formatFileSize: (bytes: number) => string;
}

const ResourceList: React.FC<ResourceListProps> = ({ 
  filteredResources, 
  searchQuery, 
  handleRemoveResource,
  formatFileSize
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Materiais Adicionados</CardTitle>
        <CardDescription>
          {filteredResources.length} {filteredResources.length === 1 ? 'material encontrado' : 'materiais encontrados'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {filteredResources.length > 0 ? (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <ResourceItem 
                  key={resource.id} 
                  resource={resource} 
                  handleRemoveResource={handleRemoveResource}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? (
              <p>Nenhum material encontrado para "{searchQuery}".</p>
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

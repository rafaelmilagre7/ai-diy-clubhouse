
import React from "react";
import { CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Resource } from "../types/ResourceTypes";
import ResourceItem from "./ResourceItem";

interface ResourceListContentProps {
  resources: Resource[];
  searchQuery: string;
  handleRemoveResource: (id?: string, url?: string) => Promise<void>;
  formatFileSize: (bytes: number) => string;
}

const ResourceListContent: React.FC<ResourceListContentProps> = ({ 
  resources, 
  searchQuery, 
  handleRemoveResource,
  formatFileSize
}) => {
  if (resources.length === 0) {
    return (
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          {searchQuery ? (
            <p>Nenhum material encontrado para "{searchQuery}".</p>
          ) : (
            <p>Nenhum material foi adicionado ainda.</p>
          )}
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent>
      <ScrollArea className="h-scroll-lg pr-4">
        <div className="space-y-3">
          {resources.map((resource) => (
            <ResourceItem 
              key={resource.id} 
              resource={resource} 
              handleRemoveResource={handleRemoveResource}
              formatFileSize={formatFileSize}
            />
          ))}
        </div>
      </ScrollArea>
    </CardContent>
  );
};

export default ResourceListContent;

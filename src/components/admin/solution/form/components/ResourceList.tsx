
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Resource } from "../types/ResourceTypes";
import ResourceListHeader from "./ResourceListHeader";
import ResourceListContent from "./ResourceListContent";

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
    <Card className="border border-aurora-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="text-lg">Materiais Adicionados</span>
          <span className="text-sm font-normal text-muted-foreground">
            {filteredResources.length} {filteredResources.length === 1 ? 'material' : 'materiais'} encontrado{filteredResources.length !== 1 ? 's' : ''}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResourceListContent 
          resources={filteredResources}
          searchQuery={searchQuery}
          handleRemoveResource={handleRemoveResource}
          formatFileSize={formatFileSize}
        />
      </CardContent>
    </Card>
  );
};

export default ResourceList;

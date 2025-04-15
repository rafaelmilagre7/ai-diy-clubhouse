
import React from "react";
import { Card } from "@/components/ui/card";
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
    <Card>
      <ResourceListHeader 
        resourceCount={filteredResources.length}
        searchQuery={searchQuery}
      />
      <ResourceListContent 
        resources={filteredResources}
        searchQuery={searchQuery}
        handleRemoveResource={handleRemoveResource}
        formatFileSize={formatFileSize}
      />
    </Card>
  );
};

export default ResourceList;

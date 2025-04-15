
import { useState } from "react";
import { Resource } from "../types/ResourceTypes";

export function useResourceFiltering(resources: Resource[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilterTab, setActiveFilterTab] = useState<string>("all");

  const filteredResources = resources.filter(resource => {
    const searchMatch = 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.metadata.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (resource.metadata.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) || false);
    
    const tabMatch = 
      activeFilterTab === "all" || 
      resource.type === activeFilterTab;
    
    return searchMatch && tabMatch;
  });

  return {
    searchQuery,
    setSearchQuery,
    activeFilterTab,
    setActiveFilterTab,
    filteredResources
  };
}

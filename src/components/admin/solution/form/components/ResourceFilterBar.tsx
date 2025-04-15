
import React from "react";
import SearchInput from "./SearchInput";
import AddResourceButton from "./AddResourceButton";
import FilterTabs from "./FilterTabs";

interface ResourceFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilterTab: string;
  setActiveFilterTab: (tab: string) => void;
  openNewResourceDialog: () => void;
}

const ResourceFilterBar: React.FC<ResourceFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  activeFilterTab,
  setActiveFilterTab,
  openNewResourceDialog
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <SearchInput 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
        />
        
        <AddResourceButton onClick={openNewResourceDialog} />
      </div>
      
      <FilterTabs 
        activeFilterTab={activeFilterTab} 
        setActiveFilterTab={setActiveFilterTab} 
      />
    </div>
  );
};

export default ResourceFilterBar;

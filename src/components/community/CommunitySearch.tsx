
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CommunityFilterType } from "@/types/communityTypes";

interface ForumSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilter: CommunityFilterType;
  setSelectedFilter: (filter: CommunityFilterType) => void;
}

export const ForumSearch = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  setSelectedFilter
}: ForumSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Pesquisar tópicos..." 
          className="pl-10" 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        <Button
          variant={selectedFilter === "recentes" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("recentes")}
        >
          Recentes
        </Button>
        <Button
          variant={selectedFilter === "populares" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("populares")}
        >
          Populares
        </Button>
        <Button
          variant={selectedFilter === "sem-respostas" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("sem-respostas")}
        >
          Sem respostas
        </Button>
        <Button
          variant={selectedFilter === "resolvidos" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("resolvidos")}
        >
          Resolvidos
        </Button>
      </div>
    </div>
  );
}

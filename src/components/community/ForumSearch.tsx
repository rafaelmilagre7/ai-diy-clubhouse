
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TopicFilterType } from "@/hooks/community/useForumTopics";

interface ForumSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedFilter: TopicFilterType;
  setSelectedFilter: (filter: TopicFilterType) => void;
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
          variant={selectedFilter === "recent" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("recent")}
        >
          Recentes
        </Button>
        <Button
          variant={selectedFilter === "popular" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("popular")}
        >
          Populares
        </Button>
        <Button
          variant={selectedFilter === "unsolved" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("unsolved")}
        >
          Sem respostas
        </Button>
        <Button
          variant={selectedFilter === "solved" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter("solved")}
        >
          Resolvidos
        </Button>
      </div>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageSquare, Users, PlusCircle } from "lucide-react";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { useState } from "react";
import { CommunityFilterType } from "@/types/communityTypes";

interface CommunityHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: CommunityFilterType;
  onFilterChange: (filter: CommunityFilterType) => void;
}

export const CommunityHero = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onFilterChange
}: CommunityHeroProps) => {
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  const filterOptions = [
    { key: "recentes" as CommunityFilterType, label: "Recentes", icon: MessageSquare },
    { key: "populares" as CommunityFilterType, label: "Populares", icon: Users },
    { key: "sem-respostas" as CommunityFilterType, label: "Sem Respostas", icon: MessageSquare },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 backdrop-blur-3xl"></div>
      
      {/* Content */}
      <div className="relative px-6 py-12 text-center">
        {/* Title with Gradient */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-3">
            Comunidade VIVER DE IA
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Conecte-se, compartilhe conhecimento e construa o futuro da IA junto com nossa comunidade exclusiva
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-1">
              <div className="flex items-center gap-3 p-4">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar discussões, tópicos ou membros..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="border-0 bg-transparent text-base placeholder:text-muted-foreground/70 focus-visible:ring-0 flex-1"
                />
                <Button 
                  onClick={() => setCreateTopicOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Criar Tópico
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Filter Tags */}
        <div className="flex flex-wrap justify-center gap-3">
          {filterOptions.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.key;
            
            return (
              <Badge
                key={filter.key}
                variant={isActive ? "default" : "secondary"}
                className={`px-4 py-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isActive 
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg" 
                    : "bg-background/60 backdrop-blur-sm hover:bg-background/80"
                }`}
                onClick={() => onFilterChange(filter.key)}
              >
                <Icon className="h-3 w-3 mr-2" />
                {filter.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <CreateTopicDialog open={createTopicOpen} onOpenChange={setCreateTopicOpen} />
    </div>
  );
};

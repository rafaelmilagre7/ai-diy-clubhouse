
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Sparkles, Users, MessageSquare, PlusCircle } from "lucide-react";
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
    { key: "sem-respostas" as CommunityFilterType, label: "Sem Respostas", icon: Sparkles },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Bright Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/60 to-purple-50/70 backdrop-blur-sm"></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-24 h-24 bg-cyan-200/50 rounded-full blur-2xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative px-6 py-20 text-center">
        {/* Title with Enhanced Gradient */}
        <div className="mb-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 leading-tight">
            Comunidade VIVER DE IA
          </h1>
          <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed font-medium">
            Conecte-se, compartilhe conhecimento e construa o futuro da IA junto com nossa comunidade exclusiva
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/40 to-purple-300/40 rounded-3xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
            <div className="relative bg-white/90 backdrop-blur-xl border border-blue-200/50 rounded-3xl p-2 shadow-xl">
              <div className="flex items-center gap-4 p-5">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Search className="h-5 w-5 text-white" />
                </div>
                <Input
                  placeholder="Buscar discussões, tópicos ou membros..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="border-0 bg-transparent text-lg placeholder:text-slate-500 focus-visible:ring-0 flex-1 font-medium"
                />
                <Button 
                  onClick={() => setCreateTopicOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Criar Tópico
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bright Filter Tags */}
        <div className="flex flex-wrap justify-center gap-4">
          {filterOptions.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedFilter === filter.key;
            
            return (
              <Badge
                key={filter.key}
                variant={isActive ? "default" : "secondary"}
                className={`px-6 py-3 cursor-pointer transition-all duration-300 hover:scale-105 text-sm font-semibold ${
                  isActive 
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl" 
                    : "bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white/90 border border-slate-200/50 shadow-md"
                }`}
                onClick={() => onFilterChange(filter.key)}
              >
                <Icon className="h-4 w-4 mr-2" />
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

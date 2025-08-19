
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityCategory } from "@/types/communityTypes";
import { MessageSquare, Hash, Star, LifeBuoy, Zap, Lightbulb, Folder } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryTabsModernProps {
  categories: CommunityCategory[] | undefined;
  isLoading: boolean;
}

const categoryIcons = {
  'Geral': Star,
  'Suporte': LifeBuoy,
  'Implementação': Zap,
  'Feedback': Lightbulb,
  'default': Folder
};

const categoryGradients = {
  'Geral': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-blue-700 data-[state=active]:border-blue-300/50',
  'Suporte': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-300/50',
  'Implementação': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-purple-700 data-[state=active]:border-purple-300/50',
  'Feedback': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500/20 data-[state=active]:to-red-500/20 data-[state=active]:text-orange-700 data-[state=active]:border-orange-300/50'
};

export const CategoryTabsModern = ({ categories, isLoading }: CategoryTabsModernProps) => {
  if (isLoading) {
    return <Skeleton className="h-16 w-full rounded-2xl" />;
  }

  return (
    <div className="relative mb-8">
      {/* Background Blur */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl rounded-2xl border border-border/50"></div>
      
      <TabsList className="relative w-full bg-transparent p-3 h-auto flex flex-wrap justify-center lg:justify-start gap-3">
        <TabsTrigger 
          value="todos" 
          className="relative group px-6 py-3 rounded-xl bg-background/40 backdrop-blur-sm hover:bg-background/60 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-primary data-[state=active]:border-primary/30 border border-transparent transition-all duration-300 hover:scale-105 data-[state=active]:shadow-xl"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-data-[state=active]:from-primary/30 group-data-[state=active]:to-accent/30 transition-all">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-sm">Todos os Tópicos</span>
              <div className="flex items-center gap-1 mt-0.5">
                <Hash className="h-3 w-3 opacity-60" />
                <span className="text-xs opacity-60">Visualização geral</span>
              </div>
            </div>
          </div>
        </TabsTrigger>
        
        {categories?.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.slug} 
            className={`relative group px-6 py-3 rounded-xl bg-background/40 backdrop-blur-sm hover:bg-background/60 border border-transparent transition-all duration-300 hover:scale-105 data-[state=active]:shadow-xl ${
              categoryGradients[category.name as keyof typeof categoryGradients] || 
              'data-[state=active]:bg-gradient-to-r data-[state=active]:from-muted/30 data-[state=active]:to-muted/20 data-[state=active]:text-foreground data-[state=active]:border-border'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-data-[state=active]:from-primary/30 group-data-[state=active]:to-accent/30 transition-all">
                {(() => {
                  const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || categoryIcons.default;
                  return <IconComponent className="h-4 w-4" />;
                })()}
              </div>
              <div className="text-left">
                <span className="font-semibold text-sm">
                  {category.name}
                </span>
                {category.topic_count !== undefined && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 h-auto bg-muted/50 border-0">
                      {category.topic_count} tópicos
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
};


import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityCategory } from "@/types/communityTypes";
import { MessageSquare, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CategoryTabsModernProps {
  categories: CommunityCategory[] | undefined;
  isLoading: boolean;
}

const categoryIcons = {
  'Geral': '🌟',
  'Suporte': '🛟',
  'Implementação': '⚡',
  'Feedback': '💡',
  'default': '📁'
};

const categoryGradients = {
  'Geral': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400/30 data-[state=active]:to-cyan-400/30 data-[state=active]:text-blue-700 data-[state=active]:border-blue-300/60',
  'Suporte': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-400/30 data-[state=active]:to-green-400/30 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-300/60',
  'Implementação': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400/30 data-[state=active]:to-pink-400/30 data-[state=active]:text-purple-700 data-[state=active]:border-purple-300/60',
  'Feedback': 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400/30 data-[state=active]:to-red-400/30 data-[state=active]:text-orange-700 data-[state=active]:border-orange-300/60'
};

export const CategoryTabsModern = ({ categories, isLoading }: CategoryTabsModernProps) => {
  if (isLoading) {
    return <Skeleton className="h-16 w-full rounded-3xl bg-white/50" />;
  }

  return (
    <div className="relative">
      {/* Background Blur */}
      <div className="absolute inset-0 bg-white/60 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-lg"></div>
      
      <TabsList className="relative w-full bg-transparent p-3 h-auto grid grid-cols-2 lg:grid-cols-5 gap-3">
        <TabsTrigger 
          value="todos" 
          className="relative group px-4 py-4 rounded-2xl bg-white/70 backdrop-blur-sm hover:bg-white/90 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400/30 data-[state=active]:to-purple-400/30 data-[state=active]:text-blue-700 data-[state=active]:border-blue-300/60 border border-transparent transition-all duration-300 hover:scale-[1.02] data-[state=active]:shadow-lg shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400/30 to-purple-400/30 group-data-[state=active]:from-blue-500/40 group-data-[state=active]:to-purple-500/40 transition-all border border-white/30">
              <MessageSquare className="h-4 w-4" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-sm">Todos</span>
              <div className="flex items-center gap-1 mt-1">
                <Hash className="h-3 w-3 opacity-60" />
                <span className="text-xs opacity-60">Geral</span>
              </div>
            </div>
          </div>
        </TabsTrigger>
        
        {categories?.map((category) => (
          <TabsTrigger 
            key={category.id} 
            value={category.slug} 
            className={`relative group px-4 py-4 rounded-2xl bg-white/70 backdrop-blur-sm hover:bg-white/90 border border-transparent transition-all duration-300 hover:scale-[1.02] data-[state=active]:shadow-lg shadow-sm ${
              categoryGradients[category.name as keyof typeof categoryGradients] || 
              'data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-400/30 data-[state=active]:to-gray-400/30 data-[state=active]:text-slate-700 data-[state=active]:border-slate-300/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl group-data-[state=active]:scale-110 transition-transform">
                {categoryIcons[category.name as keyof typeof categoryIcons] || categoryIcons.default}
              </div>
              <div className="text-left">
                <span className="font-semibold text-sm">
                  {category.name}
                </span>
                {category.topic_count !== undefined && (
                  <div className="flex items-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-xs px-2 py-0 h-5 bg-white/60 text-slate-600 border border-slate-200/50">
                      {category.topic_count}
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

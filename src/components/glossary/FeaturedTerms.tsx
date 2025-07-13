import React from "react";
import { useFeaturedTerms } from "@/hooks/useGlossary";
import { GlossaryTermCard } from "./GlossaryTermCard";
import { Star, Rocket, Zap } from "lucide-react";

export const FeaturedTerms = () => {
  const { data: featuredTerms, isLoading } = useFeaturedTerms();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
            <Star className="h-6 w-6 text-amber-600 fill-current animate-pulse" />
            <h2 className="text-3xl font-bold text-amber-800">Conceitos Essenciais</h2>
            <Rocket className="h-5 w-5 text-amber-600" />
          </div>
          <p className="text-muted-foreground mt-3 text-lg">Termos práticos para implementar IA no seu negócio</p>
        </div>
        
        <div className="grid gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gradient-to-r from-card to-card/50 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!featuredTerms || featuredTerms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
          <Star className="h-6 w-6 text-amber-600 fill-current" />
          <h2 className="text-3xl font-bold text-amber-800">Conceitos Essenciais</h2>
          <Rocket className="h-5 w-5 text-amber-600" />
        </div>
        <p className="text-muted-foreground mt-3 text-lg">Termos práticos para implementar IA no seu negócio</p>
      </div>
      
      <div className="grid gap-8">
        {featuredTerms.map((term) => (
          <GlossaryTermCard key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
};
import React from "react";
import { useFeaturedTerms } from "@/hooks/useGlossary";
import { GlossaryTermCard } from "./GlossaryTermCard";
import { Star, Zap } from "lucide-react";

export const FeaturedTerms = () => {
  const { data: featuredTerms, isLoading } = useFeaturedTerms();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50">
            <Star className="h-6 w-6 text-yellow-600 fill-current animate-pulse" />
            <h2 className="text-3xl font-bold text-yellow-800">Conceitos Essenciais</h2>
            <Zap className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-muted-foreground mt-3 text-lg">Os fundamentos que todo empresário precisa dominar</p>
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
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200/50">
          <Star className="h-6 w-6 text-yellow-600 fill-current" />
          <h2 className="text-3xl font-bold text-yellow-800">Conceitos Essenciais</h2>
          <Zap className="h-5 w-5 text-yellow-600" />
        </div>
        <p className="text-muted-foreground mt-3 text-lg">Os fundamentos que todo empresário precisa dominar</p>
      </div>
      
      <div className="grid gap-8">
        {featuredTerms.map((term) => (
          <GlossaryTermCard key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
};
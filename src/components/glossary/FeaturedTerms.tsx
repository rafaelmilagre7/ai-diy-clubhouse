import React from "react";
import { useFeaturedTerms } from "@/hooks/useGlossary";
import { GlossaryTermCard } from "./GlossaryTermCard";
import { Star } from "lucide-react";

export const FeaturedTerms = () => {
  const { data: featuredTerms, isLoading } = useFeaturedTerms();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-2xl font-semibold">Termos em Destaque</h2>
        </div>
        <div className="grid gap-4 md:gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!featuredTerms || featuredTerms.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2">
        <Star className="h-5 w-5 text-yellow-500 fill-current" />
        <h2 className="text-2xl font-semibold">Termos em Destaque</h2>
      </div>
      
      <div className="grid gap-4 md:gap-6">
        {featuredTerms.map((term) => (
          <GlossaryTermCard key={term.id} term={term} />
        ))}
      </div>
    </div>
  );
};
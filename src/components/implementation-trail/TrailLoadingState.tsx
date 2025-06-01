
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Sparkles, Loader2 } from "lucide-react";

interface TrailLoadingStateProps {
  isRegenerating?: boolean;
}

export const TrailLoadingState: React.FC<TrailLoadingStateProps> = ({ 
  isRegenerating = false 
}) => {
  return (
    <div className="space-y-6">
      {/* Header Loading */}
      <Card className="bg-gradient-to-br from-viverblue/10 via-transparent to-viverblue/5 border-viverblue/20">
        <CardHeader className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-viverblue animate-pulse" />
            <Loader2 className="h-6 w-6 text-viverblue animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-viverblue">
            {isRegenerating ? 'Regenerando' : 'Gerando'} Sua Trilha Personalizada
          </h2>
          <p className="text-neutral-400 mt-2">
            {isRegenerating 
              ? 'Criando uma nova trilha baseada no seu perfil...'
              : 'Analisando seu perfil e criando recomendações personalizadas...'
            }
          </p>
        </CardHeader>
      </Card>

      {/* Loading Cards Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-viverblue/30 rounded animate-pulse"></div>
          <div className="h-6 w-48 bg-neutral-700 rounded animate-pulse"></div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-neutral-900/50 border-neutral-700/50">
              <CardHeader>
                <div className="space-y-2">
                  <div className="h-6 bg-neutral-700 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-neutral-600 rounded animate-pulse"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-neutral-800 rounded animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-neutral-700 rounded animate-pulse"></div>
                  <div className="h-4 w-3/4 bg-neutral-700 rounded animate-pulse"></div>
                </div>
                <div className="h-10 bg-neutral-700 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Progress indicator */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <div className="h-2 w-2 bg-viverblue rounded-full animate-bounce"></div>
          <div className="h-2 w-2 bg-viverblue rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-2 w-2 bg-viverblue rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-sm text-neutral-500">
          Isso pode levar alguns segundos...
        </p>
      </div>
    </div>
  );
};

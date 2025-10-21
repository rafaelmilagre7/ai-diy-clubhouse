import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wrench } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BuilderToolsRankingProps {
  solutions: any[];
  loading: boolean;
}

export const BuilderToolsRanking: React.FC<BuilderToolsRankingProps> = ({
  solutions,
  loading
}) => {
  // Count tool recommendations
  const toolCounts: Record<string, number> = {};
  
  solutions?.forEach(solution => {
    const tools = solution.required_tools;
    if (tools) {
      // Essential tools
      tools.essential?.forEach((tool: any) => {
        const name = tool.name || tool;
        toolCounts[name] = (toolCounts[name] || 0) + 2; // Essential conta mais
      });
      
      // Optional tools
      tools.optional?.forEach((tool: any) => {
        const name = tool.name || tool;
        toolCounts[name] = (toolCounts[name] || 0) + 1;
      });
    }
  });

  const rankedTools = Object.entries(toolCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ferramentas Mais Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = rankedTools[0]?.[1] || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Ferramentas Mais Recomendadas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top 15 ferramentas sugeridas pela IA
        </p>
      </CardHeader>
      <CardContent>
        {rankedTools.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma ferramenta recomendada ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rankedTools.map(([toolName, count], index) => {
              const percentage = (count / maxCount) * 100;
              
              return (
                <div key={toolName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium">{toolName}</span>
                    </div>
                    <Badge>
                      {count} {count === 1 ? 'recomendação' : 'recomendações'}
                    </Badge>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Globe, Clock, Target, TrendingUp } from "lucide-react";
import { Solution } from "@/lib/supabase";

interface SolutionsMetricsProps {
  solutions: Solution[];
}

export const SolutionsMetrics = ({ solutions }: SolutionsMetricsProps) => {
  const totalSolutions = solutions.length;
  const publishedSolutions = solutions.filter(s => s.published).length;
  const draftSolutions = solutions.filter(s => !s.published).length;
  const categoriesCount = new Set(solutions.map(s => s.category)).size;
  const recentSolutions = solutions.filter(s => {
    const solutionDate = new Date(s.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return solutionDate > weekAgo;
  }).length;

  const metrics = [
    {
      title: "Total",
      value: totalSolutions,
      icon: BookOpen,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Publicadas",
      value: publishedSolutions,
      subtitle: `${totalSolutions > 0 ? Math.round((publishedSolutions / totalSolutions) * 100) : 0}% do total`,
      icon: Globe,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Rascunhos",
      value: draftSolutions,
      subtitle: "Em desenvolvimento",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Categorias",
      value: categoriesCount,
      subtitle: "Tipos diferentes",
      icon: Target,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Recentes",
      value: recentSolutions,
      subtitle: "Últimos 7 dias",
      icon: TrendingUp,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold">{metric.value}</p>
                {metric.subtitle && (
                  <p className="text-xs text-muted-foreground">{metric.subtitle}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
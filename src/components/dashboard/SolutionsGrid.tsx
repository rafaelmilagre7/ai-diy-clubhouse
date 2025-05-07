
import { FC } from "react";
import { Solution } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SolutionsGridProps {
  solutions: Solution[];
  onSolutionClick: (solution: Solution) => void;
}

export const SolutionsGrid: FC<SolutionsGridProps> = ({ solutions, onSolutionClick }) => {
  if (!solutions || solutions.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {solutions.map((solution) => (
        <Card key={solution.id} className={`solution-card card-hover-effect ${solution.category}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className={`badge-${solution.category}`}>
                {solution.category.charAt(0).toUpperCase() + solution.category.slice(1)}
              </Badge>
              <Badge variant="outline">{solution.difficulty}</Badge>
            </div>
            <CardTitle className="line-clamp-2">{solution.title}</CardTitle>
            <CardDescription className="line-clamp-2">{solution.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {solution.thumbnail_url ? (
              <img 
                src={solution.thumbnail_url} 
                alt={solution.title} 
                className="w-full h-32 object-cover rounded-md mb-2"
              />
            ) : (
              <div className="w-full h-32 bg-muted rounded-md mb-2 flex items-center justify-center text-muted-foreground">
                Sem imagem
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-0 flex justify-between">
            <Button onClick={() => onSolutionClick(solution)} variant="default">
              Ver detalhes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

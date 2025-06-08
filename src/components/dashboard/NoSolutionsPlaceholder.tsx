
import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

export const NoSolutionsPlaceholder: FC = () => {
  return (
    <Card variant="outline" className="p-12 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-2xl">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
        </div>
        
        <div className="space-y-2">
          <Text variant="subsection" textColor="primary">
            Nenhuma solução encontrada
          </Text>
          <Text variant="body" textColor="secondary">
            Parece que você ainda não tem soluções em seu dashboard. 
            Explore nosso catálogo e comece a implementar hoje mesmo!
          </Text>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="hover-scale">
            <Link to="/solutions">
              <Lightbulb className="h-4 w-4 mr-2" />
              Explorar soluções
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="hover-scale">
            <Link to="/implementation-trail">
              Ver trilha personalizada
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

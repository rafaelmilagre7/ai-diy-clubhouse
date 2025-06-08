
import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Container } from "@/components/ui/container";
import { BookOpen, Lightbulb, Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export const NoSolutionsPlaceholder: FC = () => {
  return (
    <Container className="py-12">
      <Card className="p-8 text-center max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Rocket className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-3">
            <Text variant="section" textColor="primary">
              Comece sua jornada com IA
            </Text>
            <Text variant="body" textColor="secondary" className="max-w-lg mx-auto">
              Você ainda não começou nenhuma implementação. Explore nossas soluções 
              e encontre as melhores oportunidades para seu negócio.
            </Text>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <div className="p-4 rounded-lg bg-surface-elevated border border-border-subtle">
              <BookOpen className="h-6 w-6 text-info mb-2 mx-auto" />
              <Text variant="body-small" weight="medium" textColor="secondary">
                Explore Soluções
              </Text>
              <Text variant="caption" textColor="tertiary">
                Descubra implementações prontas
              </Text>
            </div>
            <div className="p-4 rounded-lg bg-surface-elevated border border-border-subtle">
              <Lightbulb className="h-6 w-6 text-warning mb-2 mx-auto" />
              <Text variant="body-small" weight="medium" textColor="secondary">
                Trilha Personalizada
              </Text>
              <Text variant="caption" textColor="tertiary">
                IA recomenda por você
              </Text>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild>
              <Link to="/solutions">
                <BookOpen className="mr-2 h-4 w-4" />
                Ver Soluções
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/implementation-trail">
                <Lightbulb className="mr-2 h-4 w-4" />
                Gerar Trilha
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
};

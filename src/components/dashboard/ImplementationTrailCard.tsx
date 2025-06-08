
import { FC } from "react";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";

export const ImplementationTrailCard: FC = () => {
  return (
    <Card 
      variant="gradient" 
      className="p-6 relative overflow-hidden hover-lift transition-all duration-300"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <Text variant="card" textColor="primary">
              Trilha de Implementação
            </Text>
            <Badge variant="accent" size="sm">
              <Star className="h-3 w-3 mr-1" />
              Personalizada
            </Badge>
          </div>
        </div>
        
        <Text variant="body" textColor="secondary">
          Siga uma sequência otimizada de implementações baseada no seu perfil de negócio e maximize seus resultados.
        </Text>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <Text variant="caption" textColor="tertiary">3 concluídas</Text>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <Text variant="caption" textColor="tertiary">2 em progresso</Text>
            </div>
          </div>
          
          <Button variant="outline" size="sm" asChild className="hover-scale">
            <Link to="/implementation-trail">
              Ver trilha
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

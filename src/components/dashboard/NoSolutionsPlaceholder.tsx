
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, ArrowRight, Sparkles, Target, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

export const NoSolutionsPlaceholder: FC = () => {
  const quickActions = [
    {
      title: "Explorar Soluções",
      description: "Descubra soluções personalizadas para seu negócio",
      icon: Lightbulb,
      href: "/solutions",
      variant: "primary" as const
    },
    {
      title: "Começar Implementação",
      description: "Inicie sua primeira implementação guiada",
      icon: Target,
      href: "/implementation/start",
      variant: "accent" as const
    },
    {
      title: "Ver Formação",
      description: "Acesse cursos e materiais de aprendizado",
      icon: BookOpen,
      href: "/learning",
      variant: "info" as const
    }
  ];

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <Card variant="elevated" className="p-8 bg-gradient-to-br from-primary/5 via-surface to-accent/5 border-primary/20">
          <CardContent className="space-y-6">
            {/* Icon and Badge */}
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
              <Badge variant="accent" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Começe aqui
              </Badge>
            </div>

            {/* Main Message */}
            <div className="space-y-3">
              <Text variant="section" textColor="primary" className="font-bold">
                Bem-vindo ao seu Dashboard!
              </Text>
              <Text variant="body-large" textColor="secondary" className="max-w-2xl mx-auto">
                Ainda não há soluções em andamento. Explore nossa biblioteca de soluções 
                personalizadas e comece a transformar seu negócio hoje mesmo.
              </Text>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-4">
              <div className="text-center">
                <Text variant="heading" textColor="primary" className="font-bold">
                  50+
                </Text>
                <Text variant="caption" textColor="tertiary">
                  Soluções disponíveis
                </Text>
              </div>
              <div className="w-px h-8 bg-border-subtle"></div>
              <div className="text-center">
                <Text variant="heading" textColor="primary" className="font-bold">
                  95%
                </Text>
                <Text variant="caption" textColor="tertiary">
                  Taxa de sucesso
                </Text>
              </div>
              <div className="w-px h-8 bg-border-subtle"></div>
              <div className="text-center">
                <Text variant="heading" textColor="primary" className="font-bold">
                  30min
                </Text>
                <Text variant="caption" textColor="tertiary">
                  Para começar
                </Text>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Card 
              key={action.title}
              variant="elevated" 
              className="group hover:shadow-glow-primary transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className={`p-3 rounded-2xl mx-auto w-fit ${
                  action.variant === 'primary' ? 'bg-primary/10' :
                  action.variant === 'accent' ? 'bg-accent/10' :
                  'bg-info/10'
                }`}>
                  <action.icon className={`h-6 w-6 ${
                    action.variant === 'primary' ? 'text-primary' :
                    action.variant === 'accent' ? 'text-accent' :
                    'text-info'
                  }`} />
                </div>
                
                <div className="space-y-2">
                  <Text variant="body" textColor="primary" className="font-semibold">
                    {action.title}
                  </Text>
                  <Text variant="body-small" textColor="secondary">
                    {action.description}
                  </Text>
                </div>
                
                <Button 
                  asChild 
                  variant={action.variant === 'primary' ? 'default' : 'outline'}
                  className="w-full group-hover:shadow-md transition-all"
                >
                  <Link to={action.href}>
                    Começar
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card variant="outline" className="p-6 bg-gradient-to-r from-accent/5 to-primary/5">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <Text variant="body" textColor="primary" className="font-semibold mb-1">
                Precisa de ajuda para começar?
              </Text>
              <Text variant="body-small" textColor="secondary">
                Nossa equipe pode ajudar você a escolher a melhor solução
              </Text>
            </div>
            
            <Button variant="accent" size="lg" className="hover-scale">
              <Plus className="h-4 w-4 mr-2" />
              Falar com Especialista
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

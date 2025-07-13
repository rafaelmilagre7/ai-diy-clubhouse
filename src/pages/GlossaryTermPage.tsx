import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGlossaryTerm } from "@/hooks/useGlossary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Star,
  Brain,
  Lightbulb,
  Link as LinkIcon,
  Target,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GlossaryTermPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: term, isLoading, error } = useGlossaryTerm(slug!);

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'iniciante': return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' };
      case 'intermediario': return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' };
      case 'avancado': return { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-400' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', dot: 'bg-gray-400' };
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'Fundamental';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return 'Fundamental';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-16 bg-muted rounded w-3/4"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto" />
            <h1 className="text-3xl font-bold">Conceito não encontrado</h1>
            <p className="text-muted-foreground text-lg">
              O conceito que você está procurando não existe ou foi removido.
            </p>
            <Button asChild size="lg">
              <Link to="/glossario">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Glossário
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const difficultyStyle = getDifficultyColor(term.difficulty_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      <div className="container mx-auto px-4 py-12 space-y-8">
        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="rounded-full">
            <Link to="/glossario">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Glossário
            </Link>
          </Button>
          {term.category_name && (
            <>
              <span className="text-muted-foreground">/</span>
              <Badge 
                variant="outline" 
                className="rounded-full"
                style={{ 
                  borderColor: term.category_color,
                  color: term.category_color,
                  backgroundColor: `${term.category_color}08`
                }}
              >
                {term.category_name}
              </Badge>
            </>
          )}
        </div>

        {/* Term Header */}
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-3xl blur-3xl -z-10"></div>
          
          <div className="relative space-y-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {term.is_featured && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded-full border border-yellow-200">
                  <Star className="h-5 w-5 text-yellow-600 fill-current" />
                  <span className="text-sm font-semibold text-yellow-700">Conceito Essencial</span>
                </div>
              )}
              
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${difficultyStyle.bg} ${difficultyStyle.border} border`}>
                <div className={`w-3 h-3 rounded-full ${difficultyStyle.dot}`}></div>
                <span className={`text-sm font-semibold ${difficultyStyle.text}`}>
                  {getDifficultyLabel(term.difficulty_level)}
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {term.title}
            </h1>
            
            {term.synonyms && term.synonyms.length > 0 && (
              <div className="text-lg text-muted-foreground">
                <span className="font-medium">Também conhecido como: </span>
                <span className="italic">{term.synonyms.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Definition */}
            <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  O que é?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl leading-relaxed text-muted-foreground">{term.definition}</p>
              </CardContent>
            </Card>

            {/* Examples */}
            {term.examples && term.examples.length > 0 && (
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                    </div>
                    Exemplos Práticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {term.examples.map((example, index) => (
                      <div key={index} className="flex gap-4 p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-primary">{index + 1}</span>
                        </div>
                        <p className="text-lg leading-relaxed">{example}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Terms */}
            {term.related_terms && term.related_terms.length > 0 && (
              <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <LinkIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    Conceitos Relacionados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {term.related_terms.map((relatedTerm, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="text-base px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        {relatedTerm}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <Card className="border-0 bg-gradient-to-br from-card to-card/50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {term.category_name && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Categoria</p>
                    <Badge 
                      className="text-sm px-3 py-1 rounded-full"
                      style={{ 
                        backgroundColor: `${term.category_color}15`,
                        color: term.category_color,
                        borderColor: term.category_color
                      }}
                    >
                      {term.category_name}
                    </Badge>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Nível</p>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${difficultyStyle.bg} ${difficultyStyle.text}`}>
                    <div className={`w-2 h-2 rounded-full ${difficultyStyle.dot}`}></div>
                    <span className="text-sm font-medium">{getDifficultyLabel(term.difficulty_level)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Visualizações</p>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{term.view_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Back to Glossary */}
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-primary/10 shadow-xl">
              <CardContent className="pt-6">
                <Button asChild className="w-full" size="lg">
                  <Link to="/glossario">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Explorar Mais Conceitos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
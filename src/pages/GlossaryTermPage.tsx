import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGlossaryTerm } from "@/hooks/useGlossary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Tag, 
  Star,
  BookOpen,
  Lightbulb,
  Link as LinkIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const GlossaryTermPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: term, isLoading, error } = useGlossaryTerm(slug!);

  const getDifficultyColor = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'avancado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyLabel = (level?: string) => {
    switch (level) {
      case 'iniciante': return 'Iniciante';
      case 'intermediario': return 'Intermediário';
      case 'avancado': return 'Avançado';
      default: return 'Iniciante';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-12 bg-muted rounded w-3/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Termo não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O termo que você está procurando não existe ou foi removido.
        </p>
        <Button asChild>
          <Link to="/glossario">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Glossário
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Button variant="ghost" size="sm" asChild>
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
              style={{ 
                borderColor: term.category_color,
                color: term.category_color 
              }}
            >
              {term.category_name}
            </Badge>
          </>
        )}
      </div>

      {/* Term Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {term.is_featured && (
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
              )}
              <Badge className={`${getDifficultyColor(term.difficulty_level)}`}>
                {getDifficultyLabel(term.difficulty_level)}
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight">
              {term.title}
            </h1>
            
            {term.synonyms && term.synonyms.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm font-medium">Sinônimos:</span>
                <span className="text-sm">{term.synonyms.join(", ")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {term.reading_time_minutes && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{term.reading_time_minutes} min de leitura</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{term.view_count || 0} visualizações</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Definition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Definição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed">{term.definition}</p>
            </CardContent>
          </Card>

          {/* Examples */}
          {term.examples && term.examples.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Exemplos Práticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {term.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <span className="text-primary font-bold text-lg">{index + 1}</span>
                      <span className="leading-relaxed">{example}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Related Terms */}
          {term.related_terms && term.related_terms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" />
                  Termos Relacionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {term.related_terms.map((relatedTerm, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
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
          {/* Tags */}
          {term.tags && term.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Tag className="h-4 w-4" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {term.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Info */}
          {term.category_name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge 
                  className="text-sm px-3 py-1"
                  style={{ 
                    backgroundColor: `${term.category_color}15`,
                    color: term.category_color,
                    borderColor: term.category_color
                  }}
                >
                  {term.category_name}
                </Badge>
              </CardContent>
            </Card>
          )}

          {/* Back to Glossary */}
          <Card>
            <CardContent className="pt-6">
              <Button asChild className="w-full">
                <Link to="/glossario">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Glossário
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
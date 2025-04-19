
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSuggestions } from '@/hooks/suggestions/useSuggestions';
import { Plus, ThumbsUp, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const SuggestionsPage = () => {
  const navigate = useNavigate();
  const {
    suggestions,
    categories,
    isLoading,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    refetch
  } = useSuggestions();

  useEffect(() => {
    console.log("Componente SuggestionsPage montado, buscando sugestões...");
    refetch().catch(error => {
      console.error("Erro ao buscar sugestões:", error);
      toast.error("Erro ao carregar sugestões. Tente novamente.");
    });
  }, [refetch]);

  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("Sugestões filtradas:", filteredSuggestions.length, filteredSuggestions);

  const renderSuggestionCard = (suggestion: any) => {
    const formattedDate = format(new Date(suggestion.created_at), "dd 'de' MMMM", { locale: ptBR });
    
    return (
      <Card key={suggestion.id} className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="line-clamp-1 hover:text-primary cursor-pointer" 
                onClick={() => navigate(`/suggestions/${suggestion.id}`)}>
                {suggestion.title}
              </CardTitle>
              <CardDescription className="flex flex-wrap gap-2 mt-1">
                {suggestion.category && (
                  <Badge variant="outline">{suggestion.category.name}</Badge>
                )}
                <span className="flex items-center text-xs gap-1">
                  <Calendar size={12} />
                  {formattedDate}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-2 flex-grow">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {suggestion.description}
          </p>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between items-center border-t">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={suggestion.profiles?.avatar_url || ''} />
              <AvatarFallback>{(suggestion.profiles?.name || '?').charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {suggestion.profiles?.name || 'Usuário'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1 text-xs">
              <ThumbsUp size={14} />
              {suggestion.upvotes || 0}
            </div>
            <div className="flex items-center gap-1 text-xs">
              <MessageCircle size={14} />
              {suggestion.comment_count || 0}
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sugestões</h1>
          <p className="text-muted-foreground">
            Compartilhe suas ideias para melhorar a plataforma
          </p>
        </div>

        <Button 
          onClick={() => navigate('/suggestions/new')} 
          size="lg"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Sugestão
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Buscar sugestões..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-[300px]"
        />

        <Tabs value={filter} onValueChange={(value: 'popular' | 'recent') => setFilter(value)}>
          <TabsList>
            <TabsTrigger value="popular">Mais Populares</TabsTrigger>
            <TabsTrigger value="recent">Mais Recentes</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-4/5 mb-2" />
                <Skeleton className="h-4 w-2/5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[80px] w-full" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-dashed">
          <div className="flex flex-col items-center px-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-12 w-12 text-muted-foreground mb-3"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
              />
            </svg>
            <h3 className="text-lg font-medium">Nenhuma sugestão encontrada</h3>
            <p className="text-muted-foreground text-sm mt-1 max-w-md">
              {searchQuery 
                ? `Não encontramos sugestões contendo "${searchQuery}". Tente uma busca diferente.` 
                : 'Seja o primeiro a compartilhar uma sugestão para melhorar nossa plataforma!'}
            </p>
            <Button className="mt-4" onClick={() => navigate('/suggestions/new')}>
              Criar nova sugestão
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuggestions.map((suggestion) => renderSuggestionCard(suggestion))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsPage;

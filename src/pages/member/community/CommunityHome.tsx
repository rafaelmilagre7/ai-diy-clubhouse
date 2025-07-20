
import { useState } from "react";
import { Search, Plus, TrendingUp, Users, MessageSquare, BookOpen, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { useTopics } from "@/hooks/community/useTopics";
import { useForumStats } from "@/hooks/useForumStats";
import { TopicItem } from "@/components/community/TopicItem";
import { Loader2 } from "lucide-react";

export default function CommunityHome() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { categories, isLoading: categoriesLoading } = useForumCategories();
  const { topics, isLoading: topicsLoading } = useTopics(selectedCategory, searchTerm);
  const { topicCount, postCount, activeUserCount, solvedCount, isLoading: statsLoading } = useForumStats();

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };

  if (categoriesLoading || topicsLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comunidade</h1>
          <p className="text-muted-foreground">
            Conecte-se, compartilhe conhecimento e cresça junto com outros profissionais
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tópico
        </Button>
      </div>

      {/* Enhanced Statistics Section */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="text-lg font-medium mb-3">Estatísticas do Fórum</h3>
          {statsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold">{topicCount}</span>
                <span className="text-sm text-muted-foreground">Tópicos</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold">{postCount}</span>
                <span className="text-sm text-muted-foreground">Respostas</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold">{activeUserCount}</span>
                <span className="text-sm text-muted-foreground">Participantes</span>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center mb-2 h-10 w-10 rounded-full bg-green-500/10">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <span className="text-xl font-bold">{solvedCount}</span>
                <span className="text-sm text-muted-foreground">Resolvidos</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Pesquisar tópicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={selectedCategory === null ? "default" : "secondary"}
          className="cursor-pointer"
          onClick={() => handleCategoryFilter(null)}
        >
          Todas as Categorias
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "secondary"}
            className="cursor-pointer"
            onClick={() => handleCategoryFilter(category.id)}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">Tópicos Recentes</TabsTrigger>
          <TabsTrigger value="trending">Em Alta</TabsTrigger>
          <TabsTrigger value="solved">Resolvidos</TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="mt-6">
          <div className="space-y-4">
            {topics.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">Nenhum tópico encontrado.</p>
                </CardContent>
              </Card>
            ) : (
              topics.map((topic) => (
                <TopicItem key={topic.id} topic={topic} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Tópicos em alta serão exibidos aqui em breve.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="solved" className="mt-6">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p className="text-muted-foreground">
                  Tópicos resolvidos serão filtrados aqui.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

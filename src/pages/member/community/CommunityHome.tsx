
import { useState } from "react";
import { Search, Plus, Filter, TrendingUp, Users, MessageSquare, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryList } from "@/components/community/CategoryList";
import { TopicList } from "@/components/community/TopicList";
import { useForumStats } from "@/hooks/useForumStats";

const CommunityHome = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { topicCount, postCount, activeUserCount, solvedCount, isLoading: statsLoading } = useForumStats();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Aurora Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-viverblue/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto p-6 relative z-10">
        {/* Header with Aurora Glow */}
        <div className="mb-8 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative bg-card/40 backdrop-blur-sm border border-border/30 rounded-3xl p-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                Comunidade VIA
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Conecte-se, compartilhe conhecimento e cresça junto com outros empreendedores
              </p>
            </div>
          </div>
        </div>

        {/* Statistics with Glassmorphism */}
        {!statsLoading && (
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: MessageSquare, label: "Tópicos", value: topicCount, color: "text-primary" },
                { icon: Users, label: "Participantes", value: activeUserCount, color: "text-accent" },
                { icon: TrendingUp, label: "Respostas", value: postCount, color: "text-viverblue" },
                { icon: CheckCircle2, label: "Resolvidos", value: solvedCount, color: "text-green-500" }
              ].map((stat, index) => (
                <Card key={index} className="relative group bg-card/30 backdrop-blur-sm border-border/30 hover:bg-card/50 transition-all duration-300">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <CardContent className="relative p-4 text-center">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search and Actions with Aurora Effects */}
        <div className="mb-6 relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl blur opacity-50"></div>
          <Card className="relative bg-card/40 backdrop-blur-sm border-border/30">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Pesquisar na comunidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/50 border-border/50 focus:bg-background/80 transition-all duration-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="bg-background/30 hover:bg-background/60 transition-all duration-300">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtros
                  </Button>
                  <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Tópico
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Glassmorphism Tabs */}
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 rounded-3xl blur-xl opacity-40"></div>
          <Card className="relative bg-card/30 backdrop-blur-sm border-border/30">
            <CardContent className="p-6">
              <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-background/40 backdrop-blur-sm">
                  <TabsTrigger 
                    value="categories" 
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                  >
                    Categorias
                  </TabsTrigger>
                  <TabsTrigger 
                    value="recent" 
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                  >
                    Recentes
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trending" 
                    className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary transition-all duration-300"
                  >
                    Em Alta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="mt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Explore as Categorias
                    </h2>
                    <CategoryList />
                  </div>
                </TabsContent>

                <TabsContent value="recent" className="mt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Tópicos Recentes
                    </h2>
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Funcionalidade em desenvolvimento</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="trending" className="mt-6">
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                      Tópicos em Alta
                    </h2>
                    <div className="text-center py-8 text-muted-foreground">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Funcionalidade em desenvolvimento</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Floating Action Button with Aurora Glow */}
        <Button
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-2xl hover:shadow-primary/25 transition-all duration-300 z-50"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default CommunityHome;

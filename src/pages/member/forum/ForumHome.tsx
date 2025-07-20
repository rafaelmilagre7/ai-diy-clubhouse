
import { ForumLayout } from "@/components/forum/ForumLayout";
import { CategoryList } from "@/components/forum/CategoryList";
import { BarChart, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useForumStats } from "@/hooks/useForumStats";
import { Skeleton } from "@/components/ui/skeleton";

const ForumHome = () => {
  const { topicCount, postCount, activeUserCount, isLoading } = useForumStats();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background gradient com efeito aurora */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background opacity-90"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-60"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-accent/10 rounded-full blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative container px-4 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col gap-8">
          {/* Header com gradiente */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur opacity-40"></div>
                <div className="relative bg-gradient-to-r from-primary/20 to-accent/20 p-3 rounded-full backdrop-blur-sm border border-primary/20">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                Comunidade
              </h1>
            </div>
            
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Bem-vindo à nossa comunidade! Aqui você pode discutir tópicos, fazer perguntas e compartilhar conhecimento com outros membros.
            </p>
          </div>
          
          {/* Cards de estatísticas com glassmorphism */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 p-6 rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-full blur"></div>
                    <div className="relative bg-gradient-to-r from-blue-500/20 to-blue-600/10 p-3 rounded-full border border-blue-500/20">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Tópicos</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {topicCount}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 p-6 rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-full blur"></div>
                    <div className="relative bg-gradient-to-r from-green-500/20 to-green-600/10 p-3 rounded-full border border-green-500/20">
                      <BarChart className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Mensagens</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {postCount}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>
              <Card className="relative bg-card/60 backdrop-blur-sm border border-border/50 p-6 rounded-2xl hover:shadow-xl hover:shadow-primary/10 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-full blur"></div>
                    <div className="relative bg-gradient-to-r from-purple-500/20 to-purple-600/10 p-3 rounded-full border border-purple-500/20">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">Membros ativos</p>
                    {isLoading ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {activeUserCount}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          <ForumLayout>
            <CategoryList />
          </ForumLayout>
        </div>
      </div>
    </div>
  );
};

export default ForumHome;

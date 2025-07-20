
import { ForumLayout } from "@/components/forum/ForumLayout";
import { CategoryList } from "@/components/forum/CategoryList";
import { BarChart, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useForumStats } from "@/hooks/useForumStats";
import { Skeleton } from "@/components/ui/skeleton";

const ForumHome = () => {
  const { topicCount, postCount, activeUserCount, isLoading } = useForumStats();

  return (
    <div className="container px-4 py-6 mx-auto max-w-7xl">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Comunidade</h1>
        </div>
        
        <p className="text-muted-foreground mb-2">
          Bem-vindo à comunidade! Aqui você pode discutir tópicos, fazer perguntas e compartilhar conhecimento com outros membros.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tópicos</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{topicCount}</p>
              )}
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <BarChart className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mensagens</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{postCount}</p>
              )}
            </div>
          </Card>
          
          <Card className="p-4 flex items-center gap-3">
            <div className="bg-primary/20 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Membros ativos</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{activeUserCount}</p>
              )}
            </div>
          </Card>
        </div>
        
        <ForumLayout title="Categorias">
          <CategoryList />
        </ForumLayout>
      </div>
    </div>
  );
};

export default ForumHome;

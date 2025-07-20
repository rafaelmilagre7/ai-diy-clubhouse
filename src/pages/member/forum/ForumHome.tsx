
import { ForumLayout } from "@/components/forum/ForumLayout";
import { CategoryList } from "@/components/forum/CategoryList";
import { BarChart, MessageSquare, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useForumStats } from "@/hooks/useForumStats";
import { Skeleton } from "@/components/ui/skeleton";

const ForumHome = () => {
  const { topicCount, postCount, activeUserCount, isLoading } = useForumStats();

  return (
    <div className="min-h-screen community-header">
      <div className="content-section">
        <div className="content-container">
          <div className="flex flex-col gap-6">
            {/* Header com efeito aurora */}
            <div className="text-center space-y-4 py-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="category-icon glow-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h1 className="text-responsive-xl font-heading text-aurora glow-text">
                  Comunidade VIA
                </h1>
              </div>
              
              <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto">
                Bem-vindo à comunidade! Aqui você pode discutir tópicos, fazer perguntas e compartilhar conhecimento com outros membros da jornada VIA.
              </p>
            </div>
            
            {/* Stats cards com design Aurora */}
            <div className="community-grid max-w-4xl mx-auto">
              <div className="community-card p-6 text-center interactive-hover">
                <div className="category-icon mx-auto mb-4">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tópicos</p>
                  {isLoading ? (
                    <div className="aurora-skeleton h-8 w-16 mx-auto" />
                  ) : (
                    <p className="text-responsive-lg font-bold text-aurora">{topicCount}</p>
                  )}
                </div>
              </div>
              
              <div className="community-card p-6 text-center interactive-hover">
                <div className="category-icon mx-auto mb-4">
                  <BarChart className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mensagens</p>
                  {isLoading ? (
                    <div className="aurora-skeleton h-8 w-16 mx-auto" />
                  ) : (
                    <p className="text-responsive-lg font-bold text-aurora">{postCount}</p>
                  )}
                </div>
              </div>
              
              <div className="community-card p-6 text-center interactive-hover">
                <div className="category-icon mx-auto mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Membros ativos</p>
                  {isLoading ? (
                    <div className="aurora-skeleton h-8 w-16 mx-auto" />
                  ) : (
                    <p className="text-responsive-lg font-bold text-aurora">{activeUserCount}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Forum layout com estilo Aurora */}
            <div className="animate-slide-up">
              <ForumLayout title="Categorias">
                <CategoryList />
              </ForumLayout>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumHome;

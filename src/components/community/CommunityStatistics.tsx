
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Users, BookOpen, CheckCircle2 } from "lucide-react";
import { useCommunityStats } from "@/hooks/community/useCommunityStats";

export const ForumStatistics = () => {
  const { topicCount, postCount, activeUserCount, solvedCount, isLoading } = useCommunityStats();

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-3">Estatísticas do Fórum</h3>
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
      </CardContent>
    </Card>
  );
};

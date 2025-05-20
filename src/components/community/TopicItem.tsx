
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Topic } from "@/types/forumTypes";
import { SolutionBadge } from "./SolutionBadge";

interface TopicItemProps {
  topic: Topic;
  isPinned?: boolean;
}

export const TopicItem = ({ topic, isPinned = false }: TopicItemProps) => {
  // Função para obter as iniciais do nome do usuário
  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Tratar casos onde last_activity_at pode estar ausente
  const lastActivityDate = topic.last_activity_at 
    ? new Date(topic.last_activity_at) 
    : new Date(topic.created_at);

  return (
    <Card className="mb-3 p-4 hover:bg-accent/50 transition-all">
      <Link to={`/comunidade/topico/${topic.id}`} className="block">
        <div className="flex items-start gap-3">
          <Avatar>
            <AvatarImage src={topic.profiles?.avatar_url || undefined} />
            <AvatarFallback>{getInitials(topic.profiles?.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-medium flex items-center flex-wrap">
                {isPinned && <span className="text-primary mr-1">[Fixo] </span>}
                {topic.is_locked && <span className="text-muted-foreground mr-1">[Trancado] </span>}
                {topic.title}
                {topic.is_solved && <SolutionBadge isSolved={topic.is_solved} className="ml-2" />}
              </h3>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {topic.reply_count}
                </span>
                <span>{topic.view_count} visualizações</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-1 text-sm text-muted-foreground">
              <span>Por {topic.profiles?.name || "Usuário"}</span>
              <span>•</span>
              <span>
                {format(lastActivityDate, "d 'de' MMMM 'às' HH:mm", {
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

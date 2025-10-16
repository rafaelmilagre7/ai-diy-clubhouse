
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle2 } from "lucide-react";

interface PostHeaderProps {
  profile: {
    name?: string | null;
    role?: string | null;
    avatar_url?: string | null;
  } | null;
  createdAt: string;
  isTopicAuthor?: boolean;
  userId?: string;
  isAdmin?: boolean;
  contextMenu?: React.ReactNode;
  isSolution?: boolean;
}

export const PostHeader = ({
  profile,
  createdAt,
  isTopicAuthor = false,
  userId,
  isAdmin = false,
  contextMenu,
  isSolution = false
}: PostHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-base leading-none">
            {profile?.name || "Usuário Anônimo"}
            {isSolution && (
              <span className="ml-2 text-green-600 text-xs inline-flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Solução
              </span>
            )}
          </h3>
          {isTopicAuthor && (
            <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded">
              Autor
            </span>
          )}
          {isAdmin && (
            <span className="bg-destructive/10 text-destructive text-xs px-1.5 py-0.5 rounded">
              Admin
            </span>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mt-1">
          {format(new Date(createdAt), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
        </p>
      </div>
      
      {contextMenu}
    </div>
  );
};

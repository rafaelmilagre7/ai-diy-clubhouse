
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Profile } from "@/types/forumTypes";
import { getInitials } from "@/utils/user";

interface PostHeaderProps {
  profile: Profile | null;
  createdAt: string;
  isTopicAuthor: boolean;
  userId: string;
  isAdmin?: boolean;
  showActions?: boolean;
  contextMenu?: React.ReactNode;
}

export const PostHeader = ({
  profile,
  createdAt,
  isTopicAuthor,
  userId,
  isAdmin,
  showActions = true,
  contextMenu
}: PostHeaderProps) => {
  return (
    <div className="flex justify-between items-start mb-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{profile?.name || "Usuário"}</span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">
          {format(new Date(createdAt), "d 'de' MMMM 'às' HH:mm", {
            locale: ptBR,
          })}
        </span>
        
        {isTopicAuthor && profile?.id === userId && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Autor
          </span>
        )}

        {profile?.role === 'admin' && (
          <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">
            Admin
          </span>
        )}
      </div>

      {showActions && contextMenu}
    </div>
  );
};


import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle } from "lucide-react";
import { Post } from "@/types/forumTypes";
import { ModerationActions } from "./ModerationActions";
import { useReporting } from "@/hooks/community/useReporting";
import { createSafeHTML } from '@/utils/htmlSanitizer';

interface PostItemProps {
  post: Post;
  showTopicContext?: boolean;
}

export const PostItem = ({ post, showTopicContext = false }: PostItemProps) => {
  const { openReportModal } = useReporting();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  // Converter markdown para HTML para renderização
  const convertMarkdownToHtml = (markdown: string) => {
    let html = markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-viverblue pl-4 italic my-2 text-muted-foreground">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/^1\. (.+)$/gm, '<li class="ml-4">$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-viverblue underline hover:text-viverblue/80" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full h-auto my-4 rounded shadow-sm" />')
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br />');

    // Wrap consecutive <li> elements in <ul>
    html = html.replace(/(<li[^>]*>.*?<\/li>(?:\s*<br \/>\s*<li[^>]*>.*?<\/li>)*)/g, '<ul class="list-disc list-inside space-y-1 my-3">$1</ul>');
    html = html.replace(/<br \/>\s*<\/ul>/g, '</ul>');
    html = html.replace(/<ul[^>]*>\s*<br \/>/g, '<ul class="list-disc list-inside space-y-1 my-3">');

    // Wrap content in paragraphs if it doesn't start with HTML
    if (html && !html.startsWith('<')) {
      html = '<p class="mb-3">' + html + '</p>';
    }

    return html;
  };

  return (
    <div className="flex gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      {/* Avatar do Autor */}
      <div className="flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.profiles?.avatar_url || ''} />
          <AvatarFallback className="bg-viverblue text-white text-sm">
            {getInitials(post.profiles?.name || 'Usuário')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {/* Header com autor e data */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-medium text-foreground">
                {post.profiles?.name || 'Usuário'}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDate(post.created_at)}
              </span>
              
              {post.is_solution && (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Solução
                </Badge>
              )}
            </div>

            {/* Conteúdo do post - Agora renderiza HTML do Markdown */}
            <div className="prose prose-sm max-w-none text-foreground">
              <div 
                className="break-words"
                dangerouslySetInnerHTML={createSafeHTML(convertMarkdownToHtml(post.content))}
              />
            </div>
          </div>

          {/* Ações de Moderação */}
          <div className="flex-shrink-0">
            <ModerationActions
              type="post"
              itemId={post.id}
              currentState={{
                isHidden: false // Posts podem ter is_hidden se implementado
              }}
              onReport={() => openReportModal('post', post.id, post.user_id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

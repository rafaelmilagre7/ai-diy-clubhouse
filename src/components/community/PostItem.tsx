
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, ThumbsUp, Pin, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Post } from "@/types/forumTypes";
import { createSafeHTML } from "@/utils/htmlSanitizer";
import { ModerationActions } from "./ModerationActions";
import { useReporting } from "@/hooks/community/useReporting";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface PostItemProps {
  post: Post;
  showTopicContext?: boolean;
}

export const PostItem = ({ post, showTopicContext = false }: PostItemProps) => {
  const queryClient = useQueryClient();
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

  const handleModerationSuccess = () => {
    // Invalidar queries relacionadas para atualizar a UI
    queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
    queryClient.invalidateQueries({ queryKey: ['forumStats'] });
    
    console.log('Queries invalidadas após ação de moderação no post');
  };

  // Processar conteúdo para imagens - versão melhorada
  const processContentForImages = (content: string) => {
    if (!content) return content;
    
    let processedContent = content;
    const processedUrls = new Set<string>();
    
    // PRIMEIRO: Processar sintaxe Markdown ![alt](url)
    const markdownImageRegex = /!\[([^\]]*)\]\((https?:\/\/[^\s\)]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s\)]*)?)\)/gi;
    
    processedContent = processedContent.replace(markdownImageRegex, (match, alt, url) => {
      console.log('🖼️ Processando Markdown de imagem:', { alt, url });
      processedUrls.add(url);
      
      return `<img 
        src="${url}" 
        alt="${alt || 'Imagem'}" 
        class="max-w-full h-auto rounded-lg shadow-md border border-border cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" 
        style="max-height: 500px; object-fit: contain;" 
        loading="lazy"
        data-image-src="${url}"
      />`;
    });
    
    // SEGUNDO: Processar URLs diretas que não foram processadas ainda
    const directImageRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^\s]*)?)/gi;
    
    processedContent = processedContent.replace(directImageRegex, (url) => {
      // Se já foi processada como Markdown, pular
      if (processedUrls.has(url)) {
        console.log('🔄 URL já processada, pulando:', url);
        return url;
      }
      
      console.log('🖼️ Processando URL direta de imagem:', url);
      processedUrls.add(url);
      
      return `<img 
        src="${url}" 
        alt="Imagem" 
        class="max-w-full h-auto rounded-lg shadow-md border border-border cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]" 
        style="max-height: 500px; object-fit: contain;" 
        loading="lazy"
        data-image-src="${url}"
      />`;
    });
    
    return processedContent;
  };

  // Inicializar tratamento de clique em imagens quando o componente montar
  useEffect(() => {
    const handleImageClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      if (target.tagName === 'IMG' && target.hasAttribute('data-image-src')) {
        event.preventDefault();
        const src = target.getAttribute('data-image-src');
        if (src) {
          console.log('🖼️ Clique na imagem detectado:', src);
          window.open(src, '_blank');
        }
      }
    };

    document.addEventListener('click', handleImageClick);
    
    return () => {
      document.removeEventListener('click', handleImageClick);
    };
  }, []);

  const processedContent = processContentForImages(post.content || '');
  const safeHTML = createSafeHTML(processedContent);

  console.log('PostItem renderizando:', {
    id: post.id,
    hasContent: !!post.content,
    originalLength: post.content?.length || 0,
    processedLength: processedContent.length,
    safeHTMLLength: safeHTML.__html.length
  });

  return (
    <div className="p-4 border-b last:border-b-0 relative">
      {/* Avatar e informações do autor */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={post.profiles?.avatar_url || ''} />
          <AvatarFallback className="bg-viverblue text-white text-xs">
            {getInitials(post.profiles?.name || 'Usuário')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {post.profiles?.name || 'Usuário'}
            </span>
            <span className="text-muted-foreground text-xs">
              {formatDate(post.created_at)}
            </span>
            
            {post.is_solution && (
              <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 text-xs">
                <CheckCircle className="h-3 w-3" />
                Solução
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo do post */}
      <div className="mb-3">
        <div 
          className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-pre:text-foreground"
          dangerouslySetInnerHTML={safeHTML}
        />
      </div>

      {/* Estatísticas e ações */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>0</span>
          </div>
        </div>

        {/* Ações de Moderação */}
        <div className="flex-shrink-0">
          <ModerationActions
            type="post" 
            itemId={post.id}
            currentState={{
              isPinned: false,
              isLocked: false,
              isHidden: false
            }}
            onReport={() => openReportModal('post', post.id, post.user_id)}
            onSuccess={handleModerationSuccess}
          />
        </div>
      </div>
    </div>
  );
};

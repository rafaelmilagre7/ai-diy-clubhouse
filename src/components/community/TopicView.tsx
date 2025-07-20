import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Link } from 'react-router-dom';
import { MoreVertical, Pencil, Trash2, MessageSquare, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/hooks/useAuth';
import { ForumTopic, ForumPost } from '@/types/forumTypes';

interface Params {
  topicId: string;
}

export const TopicView = () => {
  const { topicId } = useParams<Params>();
  const [topic, setTopic] = useState<ForumTopic | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editedPostContent, setEditedPostContent] = useState('');

  useEffect(() => {
    const fetchTopicAndPosts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch topic
        const { data: topicData, error: topicError } = await supabase
          .from('forum_topics')
          .select(`
            *,
            profiles:user_id(name, avatar_url),
            forum_categories:category_id(name, slug)
          `)
          .eq('id', topicId)
          .single();
          
        if (topicError) throw topicError;
        
        setTopic(topicData);
        
        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select(`
            *,
            profiles:user_id(name, avatar_url)
          `)
          .eq('topic_id', topicId)
          .order('created_at', { ascending: true });
          
        if (postsError) throw postsError;
        
        setPosts(postsData);
        
      } catch (error: any) {
        console.error("Erro ao carregar tópico e posts:", error);
        setError(error.message);
        toast.error("Erro ao carregar tópico e posts");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopicAndPosts();
  }, [topicId]);
  
  const handleAddPost = async () => {
    if (!newPostContent.trim() || !topic) return;
    if (!user) {
      toast.error("Você precisa estar logado para postar.");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          content: newPostContent,
          topic_id: topic.id,
          user_id: user.id
        });
        
      if (error) throw error;
      
      setNewPostContent('');
      
      // Invalidate cache and refetch
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      
      toast.success("Post adicionado com sucesso!");
      
      // Atualizar contagem de posts no tópico
      await supabase.rpc('increment_forum_topic_reply_count', { topic_id: topic.id });
      
      // Invalidate queries relacionadas ao tópico
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
      
      // Recarregar posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
        
      if (postsError) throw postsError;
      
      setPosts(postsData);
      
    } catch (error: any) {
      console.error("Erro ao adicionar post:", error);
      toast.error("Erro ao adicionar post");
    }
  };
  
  const handleEditPost = (postId: string, content: string) => {
    setEditingPostId(postId);
    setEditedPostContent(content);
  };
  
  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditedPostContent('');
  };
  
  const handleUpdatePost = async (postId: string) => {
    if (!editedPostContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ content: editedPostContent })
        .eq('id', postId);
        
      if (error) throw error;
      
      setEditingPostId(null);
      setEditedPostContent('');
      
      // Invalidate cache and refetch
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      
      toast.success("Post atualizado com sucesso!");
      
      // Recarregar posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
        
      if (postsError) throw postsError;
      
      setPosts(postsData);
      
    } catch (error: any) {
      console.error("Erro ao atualizar post:", error);
      toast.error("Erro ao atualizar post");
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .delete()
        .eq('id', postId);
        
      if (error) throw error;
      
      // Invalidate cache and refetch
      queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] });
      
      toast.success("Post excluído com sucesso!");
      
      // Atualizar contagem de posts no tópico
      if (topic) {
        await supabase.rpc('decrement_forum_topic_reply_count', { topic_id: topic.id });
        
        // Invalidate queries relacionadas ao tópico
        queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
        queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
        queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
      }
      
      // Recarregar posts
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          profiles:user_id(name, avatar_url)
        `)
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });
        
      if (postsError) throw postsError;
      
      setPosts(postsData);
      
    } catch (error: any) {
      console.error("Erro ao excluir post:", error);
      toast.error("Erro ao excluir post");
    }
  };

  const handleDeleteTopic = async () => {
    if (!topic || !user) return;
    
    try {
      const { error } = await supabase
        .from('forum_topics')
        .delete()
        .eq('id', topic.id);
        
      if (error) throw error;
      
      // Usar query keys padronizadas
      queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      queryClient.invalidateQueries({ queryKey: ['forum-categories'] });
      queryClient.invalidateQueries({ queryKey: ['forum-stats'] });
      
      toast.success("Tópico excluído com sucesso!");
      navigate("/comunidade");
    } catch (error: any) {
      console.error("Erro ao excluir tópico:", error);
      toast.error("Erro ao excluir tópico");
    }
  };
  
  const handleUpvote = async (postId: string) => {
    try {
      // Lógica para adicionar um upvote
      toast.success("Upvote implementado!");
    } catch (error: any) {
      console.error("Erro ao dar upvote:", error);
      toast.error("Erro ao dar upvote");
    }
  };
  
  const handleDownvote = async (postId: string) => {
    try {
      // Lógica para adicionar um downvote
      toast.success("Downvote implementado!");
    } catch (error: any) {
      console.error("Erro ao dar downvote:", error);
      toast.error("Erro ao dar downvote");
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>Erro: {error}</div>;
  }

  if (!topic) {
    return <div>Tópico não encontrado.</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start">
            <Avatar className="mr-4 h-10 w-10">
              <AvatarImage src={topic.profiles?.avatar_url || ""} alt={topic.profiles?.name || "Autor"} />
              <AvatarFallback>{topic.profiles?.name?.charAt(0) || "A"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{topic.title}</h2>
              <p className="text-muted-foreground">
                Por {topic.profiles?.name || "Usuário Desconhecido"}, {formatDistanceToNow(new Date(topic.created_at), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          </div>
          <Separator className="my-4" />
          <p>{topic.content}</p>
        </CardContent>
        {user?.id === topic.user_id && (
          <CardFooter className="justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Abrir menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate(`/comunidade/editar/${topicId}`)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteTopic} className="text-red-500">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardFooter>
        )}
      </Card>
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Respostas</h3>
        {posts.map((post) => (
          <Card key={post.id} className="mb-2">
            <CardContent className="p-4">
              <div className="flex items-start">
                <Avatar className="mr-4 h-8 w-8">
                  <AvatarImage src={post.profiles?.avatar_url || ""} alt={post.profiles?.name || "Autor"} />
                  <AvatarFallback>{post.profiles?.name?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{post.profiles?.name || "Usuário Desconhecido"}</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                    {user?.id === post.user_id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditPost(post.id, post.content)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeletePost(post.id)} className="text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <Separator className="my-2" />
                  {editingPostId === post.id ? (
                    <div className="flex flex-col space-y-2">
                      <Textarea
                        value={editedPostContent}
                        onChange={(e) => setEditedPostContent(e.target.value)}
                        className="resize-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                        <Button onClick={() => handleUpdatePost(post.id)}>Salvar</Button>
                      </div>
                    </div>
                  ) : (
                    <p>{post.content}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="ghost" size="sm" onClick={() => handleUpvote(post.id)}>
                <ArrowUpCircle className="mr-2 h-4 w-4" />
                Upvote
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDownvote(post.id)}>
                <ArrowDownCircle className="mr-2 h-4 w-4" />
                Downvote
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {user ? (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Adicionar Resposta</h3>
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Escreva sua resposta..."
              className="resize-none mb-4"
            />
            <Button onClick={handleAddPost}>Enviar Resposta</Button>
          </CardContent>
        </Card>
      ) : (
        <p className="text-center">
          Por favor, <Link to="/login" className="text-primary">faça login</Link> para responder a este tópico.
        </p>
      )}
    </div>
  );
};

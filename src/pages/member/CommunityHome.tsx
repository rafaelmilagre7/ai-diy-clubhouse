
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TopicCard } from "@/components/community/TopicCard";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import type { Topic, ForumCategory } from "@/types/forumTypes";

export default function CommunityHome() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
    fetchCategories();
  }, [searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias",
        variant: "destructive",
      });
    }
  };

  const fetchTopics = async () => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from("forum_topics")
        .select(`
          id,
          title,
          content,
          created_at,
          updated_at,
          user_id,
          view_count,
          reply_count,
          is_pinned,
          is_locked,
          is_solved,
          last_activity_at,
          category_id,
          profiles!forum_topics_user_id_fkey(
            name,
            avatar_url
          ),
          forum_categories!forum_topics_category_id_fkey(
            name,
            slug
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("last_activity_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      console.log("Raw Supabase data:", data);

      // Mapear os dados para o formato esperado pelo tipo Topic
      const mappedTopics: Topic[] = (data || []).map((item: any) => {
        // Acessar o primeiro elemento dos arrays retornados pelo Supabase
        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
        const category = Array.isArray(item.forum_categories) ? item.forum_categories[0] : item.forum_categories;

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          created_at: item.created_at,
          updated_at: item.updated_at,
          user_id: item.user_id,
          category_id: item.category_id,
          view_count: item.view_count || 0,
          reply_count: item.reply_count || 0,
          is_pinned: item.is_pinned || false,
          is_locked: item.is_locked || false,
          is_solved: item.is_solved || false,
          last_activity_at: item.last_activity_at,
          profiles: profile ? {
            id: profile.id || item.user_id,
            name: profile.name || "Usuário",
            avatar_url: profile.avatar_url || null
          } : null,
          category: category ? {
            id: item.category_id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            topic_count: category.topic_count,
            color: category.color,
            icon: category.icon,
            order: category.order_index
          } : null
        };
      });

      console.log("Mapped topics:", mappedTopics);
      setTopics(mappedTopics);
    } catch (error) {
      console.error("Erro ao buscar tópicos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tópicos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = !searchTerm || 
      topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      topic.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || topic.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Comunidade</h1>
          <p className="text-muted-foreground">
            Conecte-se, compartilhe conhecimento e encontre soluções
          </p>
        </div>
        
        <Link to="/comunidade/novo-topico">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Novo Tópico
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar tópicos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategory === null ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(null)}
            >
              Todas
            </Badge>
            
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
                style={{ 
                  backgroundColor: selectedCategory === category.id ? category.color : undefined 
                }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Carregando tópicos...</p>
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory 
                ? "Nenhum tópico encontrado com os filtros aplicados" 
                : "Nenhum tópico encontrado"}
            </p>
          </div>
        ) : (
          filteredTopics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Reply, CheckCircle, Clock, Search, Filter, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { CommentStatsCards } from "@/components/admin/learning/CommentStatsCards";
import { CommentsList } from "@/components/admin/learning/CommentsList";
import { CommentFilters } from "@/components/admin/learning/CommentFilters";
import { CommentReplyModal } from "@/components/admin/learning/CommentReplyModal";
import { useAdminLearningComments } from "@/hooks/admin/useAdminLearningComments";
import { useCommentStats } from "@/hooks/admin/useCommentStats";

const AdminLearningComments = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  const {
    comments,
    isLoading,
    error,
    markAsReplied,
    replyToComment,
    refreshComments,
    hasMore,
    loadMore
  } = useAdminLearningComments({
    status: statusFilter === "all" ? undefined : statusFilter,
    courseId: courseFilter === "all" ? undefined : courseFilter,
    search: searchTerm
  });

  const { stats, isLoading: isLoadingStats } = useCommentStats();

  const handleReply = async (commentId: string, replyContent: string) => {
    try {
      await replyToComment(commentId, replyContent);
      setSelectedCommentId(null);
    } catch (error) {
      console.error("Erro ao responder comentário:", error);
    }
  };

  const handleMarkAsReplied = async (commentId: string) => {
    try {
      await markAsReplied(commentId);
    } catch (error) {
      console.error("Erro ao marcar como respondido:", error);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Erro ao carregar comentários: {error.message}</p>
              <Button onClick={refreshComments} className="mt-4">
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Comentários das Aulas</h1>
          <p className="text-muted-foreground">
            Gerencie e responda aos comentários dos alunos nas aulas do LMS
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          
          <Button asChild variant="outline" className="gap-2">
            <Link to="/formacao">
              <ExternalLink className="h-4 w-4" />
              Ir para o LMS
            </Link>
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <CommentStatsCards stats={stats} isLoading={isLoadingStats} />

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Busca */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar comentários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="replied">Respondidos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros Expandidos */}
            {showFilters && (
              <CommentFilters
                courseFilter={courseFilter}
                setCourseFilter={setCourseFilter}
                onReset={() => {
                  setCourseFilter("all");
                  setStatusFilter("all");
                  setSearchTerm("");
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Comentários */}
      <CommentsList
        comments={comments}
        isLoading={isLoading}
        onReply={(commentId) => setSelectedCommentId(commentId)}
        onMarkAsReplied={handleMarkAsReplied}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />

      {/* Modal de Resposta */}
      {selectedCommentId && (
        <CommentReplyModal
          commentId={selectedCommentId}
          isOpen={!!selectedCommentId}
          onClose={() => setSelectedCommentId(null)}
          onReply={handleReply}
        />
      )}
    </div>
  );
};

export default AdminLearningComments;
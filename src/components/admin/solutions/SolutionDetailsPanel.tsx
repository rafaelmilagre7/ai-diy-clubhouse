import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { X, Edit, Trash2, Eye, EyeOff, Calendar, User, Clock } from "lucide-react";
import { Solution } from "@/lib/supabase";
import { getCategoryDetails } from "@/lib/types/categoryTypes";

interface SolutionDetailsPanelProps {
  solution: Solution;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: (published: boolean) => void;
}

export const SolutionDetailsPanel = ({
  solution,
  onClose,
  onEdit,
  onDelete,
  onTogglePublish
}: SolutionDetailsPanelProps) => {
  const categoryDetails = getCategoryDetails(solution.category);

  return (
    <div className="h-full flex flex-col bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Detalhes da Solução</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={() => onTogglePublish(!solution.published)}
            variant={solution.published ? "secondary" : "default"}
            className="gap-2"
          >
            {solution.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {solution.published ? "Despublicar" : "Publicar"}
          </Button>
          
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onDelete} 
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className={`p-2 rounded ${categoryDetails.bgColor}`}>
                <categoryDetails.icon className={`h-4 w-4 ${categoryDetails.color}`} />
              </div>
              {solution.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Descrição</h4>
              <p className="text-sm text-muted-foreground">
                {solution.description || "Sem descrição"}
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Status</h4>
                <Badge variant={solution.published ? "default" : "secondary"}>
                  {solution.published ? "Publicada" : "Rascunho"}
                </Badge>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-1">Categoria</h4>
                <Badge variant="outline">{categoryDetails.name}</Badge>
              </div>
            </div>

            {solution.difficulty && (
              <div>
                <h4 className="text-sm font-medium mb-1">Dificuldade</h4>
                <Badge variant="outline">
                  {solution.difficulty === 'easy' ? 'Fácil' :
                   solution.difficulty === 'medium' ? 'Médio' : 'Avançado'}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Criado em:</span>
              <span>{new Date(solution.created_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Atualizado em:</span>
              <span>{new Date(solution.updated_at).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">ID:</span>
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                {solution.id.slice(0, 8)}...
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details */}
        {solution.estimated_time && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">Tempo Estimado</h4>
                <p className="text-sm text-muted-foreground">{solution.estimated_time}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
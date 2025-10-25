import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  FileText, 
  FileImage, 
  FileArchive,
  FileCode, 
  File, 
  Heart,
  HeartOff,
  Calendar,
  HardDrive
} from "lucide-react";
import { RecursoWithDetails } from "./types";

interface MaterialGridViewProps {
  recursos: RecursoWithDetails[];
  onEdit: (recurso: RecursoWithDetails) => void;
  onDelete: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  favorites?: string[];
  isAdmin: boolean;
}

export const MaterialGridView = ({ 
  recursos, 
  onEdit, 
  onDelete, 
  onToggleFavorite,
  favorites = [],
  isAdmin 
}: MaterialGridViewProps) => {
  
  const getFileIcon = (fileType: string | null, size = "h-8 w-8") => {
    if (!fileType) return <File className={size} />;
    
    if (fileType.includes("pdf")) return <FileText className={`${size} text-destructive`} />;
    if (fileType.includes("image")) return <FileImage className={`${size} text-success`} />;
    if (fileType.includes("zip") || fileType.includes("rar")) return <FileArchive className={`${size} text-warning`} />;
    if (fileType.includes("doc")) return <FileText className={`${size} text-operational`} />;
    if (fileType.includes("code") || fileType.includes("json")) return <FileCode className={`${size} text-strategy`} />;
    
    return <File className={size} />;
  };

  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "—";
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileTypeLabel = (fileType: string | null) => {
    if (!fileType) return "Arquivo";
    
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("doc")) return "DOC";
    if (fileType.includes("zip")) return "ZIP";
    if (fileType.includes("image")) return "Imagem";
    if (fileType.includes("video")) return "Vídeo";
    
    return fileType.split('/')[1]?.toUpperCase() || "Arquivo";
  };

  const handleDownload = async (recurso: RecursoWithDetails) => {
    if (!recurso.file_url) return;
    window.open(recurso.file_url, '_blank');
  };

  const isFavorite = (id: string) => favorites.includes(id);

  if (recursos.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium mb-2">Nenhum material encontrado</h3>
        <p className="text-muted-foreground">
          Tente ajustar os filtros ou adicione novos materiais.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {recursos.map((recurso) => {
        const lesson = recurso.lesson;
        const module = lesson?.module;
        const course = module?.course;

        return (
          <Card 
            key={recurso.id} 
            className="group bg-gradient-to-br from-card to-card/50 border-0 shadow-lg hover:shadow-xl transition-all duration-slow hover:scale-[1.02] overflow-hidden"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {getFileIcon(recurso.file_type)}
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className="text-xs mb-1">
                      {getFileTypeLabel(recurso.file_type)}
                    </Badge>
                    <CardTitle className="text-base leading-tight line-clamp-2">
                      {recurso.name}
                    </CardTitle>
                  </div>
                </div>
                
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleFavorite(recurso.id)}
                    className="p-1 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {isFavorite(recurso.id) ? (
                      <Heart className="h-4 w-4 text-destructive fill-current" />
                    ) : (
                      <HeartOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Hierarquia do curso */}
              <div className="text-sm space-y-1">
                {course?.title && (
                  <div className="font-medium text-primary truncate" title={course.title}>
                    📚 {course.title}
                  </div>
                )}
                {module?.title && (
                  <div className="text-muted-foreground truncate" title={module.title}>
                    📂 {module.title}
                  </div>
                )}
                {lesson?.title && (
                  <div className="text-xs text-muted-foreground truncate" title={lesson.title}>
                    🎯 {lesson.title}
                  </div>
                )}
              </div>

              {/* Metadados */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <HardDrive className="h-3 w-3" />
                  <span>{formatFileSize(recurso.file_size_bytes)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(recurso.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex flex-wrap gap-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => handleDownload(recurso)}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Baixar
                </Button>
                
                {isAdmin && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(recurso)}
                      className="hover:bg-operational/10 hover:border-operational/30"
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onDelete(recurso.id)}
                      className="hover:bg-status-error/10 hover:border-status-error/30 text-status-error"
                    >
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
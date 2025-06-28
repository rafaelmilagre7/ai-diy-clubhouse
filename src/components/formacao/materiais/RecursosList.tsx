
import { useState } from "react";
import { LearningResource } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  FileText, 
  FileImage, 
  FileArchive,
  FileCode, 
  File, 
  Pencil, 
  Trash2, 
  Download,
  Loader2
} from "lucide-react";
import { RecursoDeleteDialog } from "./RecursoDeleteDialog";

interface RecursosListProps {
  recursos: LearningResource[];
  loading: boolean;
  onEdit: (recurso: LearningResource) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export const RecursosList = ({ 
  recursos, 
  loading, 
  onEdit, 
  onDelete, 
  isAdmin 
}: RecursosListProps) => {
  const [recursoParaExcluir, setRecursoParaExcluir] = useState<LearningResource | null>(null);

  // Abrir diálogo de confirmação para excluir
  const handleOpenDelete = (recurso: LearningResource) => {
    setRecursoParaExcluir(recurso);
  };

  const handleConfirmDelete = () => {
    if (recursoParaExcluir) {
      onDelete(recursoParaExcluir.id);
      setRecursoParaExcluir(null);
    }
  };

  // Função para determinar o ícone com base na URL do arquivo
  const getFileIcon = (fileUrl: string | null) => {
    if (!fileUrl) return <File className="h-5 w-5" />;
    
    const extension = fileUrl.split('.').pop()?.toLowerCase();
    
    if (extension === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) return <FileImage className="h-5 w-5" />;
    if (['zip', 'rar', '7z'].includes(extension || '')) return <FileArchive className="h-5 w-5" />;
    if (['doc', 'docx', 'txt'].includes(extension || '')) return <FileText className="h-5 w-5" />;
    if (['json', 'html', 'js', 'ts', 'css'].includes(extension || '')) return <FileCode className="h-5 w-5" />;
    
    return <File className="h-5 w-5" />;
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number | null) => {
    if (bytes === null) return "Desconhecido";
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  // Função para extrair nome do arquivo da URL
  const getFileName = (fileUrl: string) => {
    return fileUrl.split('/').pop() || 'Arquivo';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (recursos.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-background">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">Nenhum material disponível</h3>
        <p className="text-sm text-muted-foreground mt-2 mb-4">
          Esta aula ainda não possui materiais cadastrados.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recursos.map((recurso) => (
              <TableRow key={recurso.id}>
                <TableCell>{getFileIcon(recurso.file_url)}</TableCell>
                {/* Corrigido: usar file_url para extrair o nome do arquivo */}
                <TableCell className="font-medium">{getFileName(recurso.file_url)}</TableCell>
                <TableCell>{recurso.description || "—"}</TableCell>
                <TableCell>{formatFileSize(recurso.file_size_bytes)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={recurso.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </a>
                    </Button>
                    
                    {isAdmin && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => onEdit(recurso)}>
                          <Pencil className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenDelete(recurso)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <RecursoDeleteDialog 
        open={!!recursoParaExcluir} 
        onOpenChange={() => setRecursoParaExcluir(null)}
        onConfirm={handleConfirmDelete}
        recurso={recursoParaExcluir}
      />
    </>
  );
};

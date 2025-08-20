import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Edit, Trash2, ExternalLink } from "lucide-react";
import { Solution } from "@/lib/supabase";
import { getCategoryDetails } from "@/lib/types/categoryTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SolutionsTableProps {
  solutions: Solution[];
  onSolutionSelect?: (solution: Solution) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, published: boolean) => void;
  selectedSolution?: Solution | null;
}

export const SolutionsTable = ({
  solutions,
  onSolutionSelect,
  onEdit,
  onDelete,
  onTogglePublish,
  selectedSolution
}: SolutionsTableProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Lista de Soluções ({solutions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Solução</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dificuldade</TableHead>
                <TableHead>Criado</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solutions.map((solution) => {
                const categoryDetails = getCategoryDetails(solution.category);
                const isSelected = selectedSolution?.id === solution.id;
                
                return (
                  <TableRow 
                    key={solution.id} 
                    className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                      isSelected ? 'bg-muted/50 border-l-2 border-l-primary' : ''
                    }`}
                    onClick={() => onSolutionSelect?.(solution)}
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium line-clamp-1">{solution.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {solution.description}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{categoryDetails.icon}</span>
                        <span className="text-sm">{categoryDetails.name}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant={solution.published ? "default" : "secondary"}>
                        {solution.published ? "Publicada" : "Rascunho"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      {solution.difficulty && (
                        <Badge variant="outline" className="text-xs">
                          {solution.difficulty === 'easy' ? 'Fácil' :
                           solution.difficulty === 'medium' ? 'Médio' : 'Avançado'}
                        </Badge>
                      )}
                    </TableCell>
                    
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(solution.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePublish(solution.id, !solution.published);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          {solution.published ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(solution.id);
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(solution.id);
                          }}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {solutions.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-muted-foreground">
                <ExternalLink className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Nenhuma solução encontrada</p>
                <p className="text-sm">Ajuste os filtros para ver mais resultados</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
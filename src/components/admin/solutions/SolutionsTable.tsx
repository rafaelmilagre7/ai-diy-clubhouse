
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Solution } from '@/lib/supabase/types/legacy';
import { SolutionDifficultyBadge } from './SolutionDifficultyBadge';
import { PublishStatus } from './PublishStatus';
import { formatDateDistance } from './utils/dateFormatter';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Globe,
  EyeOff,
  Calendar,
  Target,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SolutionsTableProps {
  solutions: Solution[];
  onEdit: (id: string) => void;
  onDelete: (solutionId: string) => Promise<void>;
  onTogglePublish: (solutionId: string, newPublishedState: boolean) => Promise<void>;
  getCategoryDetails: (category: string) => { name: string; color: string; bgColor: string; icon: string; description: string; };
  onDeleteClick?: (id: string) => void;
}

export const SolutionsTable: React.FC<SolutionsTableProps> = ({ 
  solutions, 
  onEdit,
  onDelete,
  onTogglePublish,
  getCategoryDetails,
  onDeleteClick
}) => {
  const handleTogglePublish = async (solutionId: string, currentPublished: boolean) => {
    await onTogglePublish(solutionId, !currentPublished);
  };

  if (solutions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 backdrop-blur-sm border border-muted/20 inline-block mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-heading-3 text-foreground mb-2">Nenhuma solução encontrada</h3>
        <p className="text-body text-muted-foreground">
          Tente ajustar os filtros ou criar uma nova solução
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {solutions.map((solution, index) => {
        const categoryDetails = getCategoryDetails(solution.category);
        const createdDate = new Date(solution.created_at);
        const isRecentSolution = Date.now() - createdDate.getTime() < 7 * 24 * 60 * 60 * 1000;
        
        return (
          <motion.div
            key={solution.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: index * 0.1,
              ease: 'easeOut' 
            }}
          >
            <Card className="surface-elevated border-0 shadow-aurora transition-all duration-300 hover:shadow-aurora-strong group h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`
                      p-3 rounded-lg transition-all duration-300 group-hover:scale-110
                      bg-gradient-to-br from-${categoryDetails.color}/20 to-${categoryDetails.color}/10 
                      group-hover:from-${categoryDetails.color}/30 group-hover:to-${categoryDetails.color}/20
                    `}>
                      <Target className={`h-6 w-6 text-${categoryDetails.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="text-body-large font-semibold text-foreground line-clamp-2 group-hover:text-viverblue transition-colors">
                          {solution.title}
                        </h3>
                        {isRecentSolution && (
                          <Badge variant="outline" className="text-xs bg-operational/10 text-operational border-operational/20 flex-shrink-0">
                            Nova
                          </Badge>
                        )}
                      </div>
                      
                      {/* Category and Difficulty */}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-xs bg-${categoryDetails.color}/10 text-${categoryDetails.color} border-${categoryDetails.color}/30`}>
                          {categoryDetails.name}
                        </Badge>
                        <SolutionDifficultyBadge difficulty={solution.difficulty} />
                      </div>

                      {/* Publish Status */}
                      <div className="flex items-center gap-2">
                        {solution.published ? (
                          <Badge variant="outline" className="text-xs bg-revenue/10 text-revenue border-revenue/30 flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            Publicada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-strategy/10 text-strategy border-strategy/30 flex items-center gap-1">
                            <EyeOff className="h-3 w-3" />
                            Rascunho
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="surface-elevated border-0 shadow-aurora">
                      <DropdownMenuItem onClick={() => onEdit(solution.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePublish(solution.id, solution.published)}>
                        {solution.published ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Despublicar
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Publicar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDeleteClick?.(solution.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Description */}
                {solution.description && (
                  <p className="text-body-small text-muted-foreground line-clamp-3">
                    {solution.description}
                  </p>
                )}

                {/* Date Info */}
                <div className="flex items-center gap-2 text-body-small text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDateDistance(solution.created_at)}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEdit(solution.id)}
                    className="flex-1 h-8 text-xs aurora-focus"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleTogglePublish(solution.id, solution.published)}
                    className="flex-1 h-8 text-xs aurora-focus"
                  >
                    {solution.published ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Publicar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

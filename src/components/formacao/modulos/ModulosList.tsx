
import { Link } from "react-router-dom";
import { LearningModule } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, Loader2, LucideIcon, BookOpen, Plus, Play, Clock, ChevronRight } from "lucide-react";
import { NovaAulaButton } from "@/components/formacao/aulas/NovaAulaButton";

interface ModulosListProps {
  modulos: LearningModule[];
  loading: boolean;
  onEdit: (modulo: LearningModule) => void;
  onDelete: (moduloId: string) => void;
  isAdmin: boolean;
}

export const ModulosList: React.FC<ModulosListProps> = ({ 
  modulos, 
  loading,
  onEdit,
  onDelete,
  isAdmin
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="group">
            <Card className="h-full bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border/50 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20 loading-skeleton" />
                  <Skeleton className="h-8 w-8 rounded-full loading-skeleton" />
                </div>
                <Skeleton className="h-6 w-4/5 loading-skeleton" />
                <Skeleton className="h-4 w-full loading-skeleton" />
                <Skeleton className="h-4 w-3/4 loading-skeleton" />
              </CardHeader>
              <CardContent className="pb-4">
                <Skeleton className="h-20 w-full rounded-lg loading-skeleton" />
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/30">
                <Skeleton className="h-10 w-full loading-skeleton" />
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (modulos.length === 0) {
    return (
      <div className="relative">
        {/* Aurora Background */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute top-10 left-10 w-40 h-40 bg-aurora/10 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-10 right-10 w-40 h-40 bg-revenue/10 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="relative text-center py-16 glass rounded-2xl border border-border/50">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-aurora/20 to-revenue/20 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-text-muted" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-text-primary">Nenhum módulo encontrado</h3>
          <p className="text-text-secondary mb-6 max-w-md mx-auto leading-relaxed">
            Ainda não existem módulos cadastrados para este curso. Comece criando o primeiro módulo.
          </p>
          {isAdmin && (
            <Button 
              className="bg-gradient-to-r from-aurora to-revenue hover:from-aurora-dark hover:to-revenue-dark 
                        shadow-lg hover:shadow-xl transition-all duration-slow"
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Módulo
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {modulos.map((modulo, index) => (
          <div 
            key={modulo.id} 
            className="group animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <Link to={`/formacao/modulos/${modulo.id}`} className="block h-full">
              <Card className="h-full bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-sm border border-border/50 
                            hover:border-aurora/30 hover:shadow-2xl hover:shadow-aurora/10 
                            transition-all duration-slower hover:-translate-y-2 overflow-hidden relative group/card cursor-pointer">
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-aurora/[0.02] via-transparent to-revenue/[0.02] 
                              opacity-0 group-hover/card:opacity-100 transition-opacity duration-slower" />
                
                {/* Module Number Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="w-8 h-8 bg-gradient-to-br from-aurora to-revenue rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                    {index + 1}
                  </div>
                </div>
                
                {/* Admin Actions - Positioned to avoid card click */}
                {isAdmin && (
                  <div className="absolute top-4 right-4 z-20 flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEdit(modulo);
                      }}
                      className="w-8 h-8 p-0 border-aurora/40 bg-white/90 text-aurora hover:bg-aurora/10 hover:border-aurora transition-all duration-slow shadow-lg"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(modulo.id);
                      }}
                      className="w-8 h-8 p-0 border-destructive/40 bg-white/90 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all duration-slow shadow-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}

                <CardHeader className="pb-4 pt-16">
                  <CardTitle className="text-lg font-bold text-text-primary group-hover/card:text-aurora transition-colors duration-slow line-clamp-2">
                    {modulo.title}
                  </CardTitle>
                  <CardDescription className="text-text-secondary line-clamp-3 leading-relaxed">
                    {modulo.description || "Este módulo não possui descrição, mas contém conteúdo valioso para seu aprendizado."}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-4 flex-1">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                      <span>Progresso</span>
                      <span>100%</span>
                    </div>
                    <div className="w-full bg-border/30 rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-aurora to-revenue rounded-full transition-all duration-slower" 
                           style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-text-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>5 aulas</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      <span>2h 30min</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/30 bg-surface-elevated/50">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center text-text-primary group-hover/card:text-aurora transition-colors duration-slow">
                      <BookOpen className="mr-2 h-4 w-4 group-hover/card:scale-110 transition-transform" />
                      <span className="font-medium">Ver Aulas</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-text-muted group-hover/card:text-aurora group-hover/card:translate-x-1 transition-all duration-slow" />
                  </div>
                  
                  {/* Admin Action - Add Lesson */}
                  {isAdmin && (
                    <div className="mt-3 pt-3 border-t border-border/20">
                      <NovaAulaButton 
                        moduleId={modulo.id} 
                        buttonText="+ Nova Aula"
                        variant="outline"
                        size="sm"
                        className="w-full border-operational/30 text-operational hover:bg-operational/10 hover:border-operational/50"
                      />
                    </div>
                  )}
                </CardFooter>
              </Card>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

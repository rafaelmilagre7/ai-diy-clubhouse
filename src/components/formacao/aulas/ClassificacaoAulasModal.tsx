import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Bot, Sparkles } from 'lucide-react';
import { useClassifyLessons } from '@/hooks/useClassifyLessons';

interface ClassificacaoAulasModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonIds?: string[];
}

const tagColors: Record<string, string> = {
  // Temas
  vendas: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  marketing: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  automacao: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  atendimento: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  gestao: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  produtividade: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  integracao: 'bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-200',
  analytics: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  
  // Ferramentas
  make: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  typebot: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  openai: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'meta-ads': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'google-sheets': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  zapier: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  chatgpt: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'whatsapp-business': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  
  // Níveis
  iniciante: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediario: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  avancado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  
  // Formatos
  hotseat: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'aula-pratica': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'case-study': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  tutorial: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
  configuracao: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
};

export const ClassificacaoAulasModal: React.FC<ClassificacaoAulasModalProps> = ({
  open,
  onOpenChange,
  lessonIds
}) => {
  const {
    isAnalyzing,
    isApplying,
    classifications,
    analyzeLessons,
    toggleApproval,
    approveAll,
    rejectAll,
    applyClassifications
  } = useClassifyLessons();

  const handleAnalyze = () => {
    analyzeLessons(lessonIds);
  };

  const approvedCount = classifications.filter(c => c.approved).length;
  const totalCount = classifications.length;

  const renderTags = (tags: string[], category: string) => {
    if (tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        <span className="text-xs font-medium text-muted-foreground mr-1">
          {category.charAt(0).toUpperCase() + category.slice(1)}:
        </span>
        {tags.map((tag, index) => (
          <Badge 
            key={index} 
            variant="secondary" 
            className={`text-xs ${tagColors[tag] || 'bg-gray-100 text-gray-800'}`}
          >
            {tag}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Classificação Automática de Aulas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controles principais */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {lessonIds ? `Analisar ${lessonIds.length} Aulas` : 'Analisar Todas as Aulas'}
                  </>
                )}
              </Button>
            </div>

            {totalCount > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {approvedCount} de {totalCount} aprovadas
                </span>
                <Button variant="outline" size="sm" onClick={approveAll}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Aprovar Todas
                </Button>
                <Button variant="outline" size="sm" onClick={rejectAll}>
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeitar Todas
                </Button>
                <Button 
                  onClick={applyClassifications}
                  disabled={isApplying || approvedCount === 0}
                  className="gap-2"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Aplicando...
                    </>
                  ) : (
                    `Aplicar ${approvedCount} Classificações`
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Lista de classificações */}
          {totalCount > 0 && (
            <ScrollArea className="h-[500px]">
              <div className="space-y-3 pr-4">
                {classifications.map((classification) => (
                  <Card key={classification.lessonId} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                          <Checkbox
                            checked={classification.approved}
                            onCheckedChange={() => toggleApproval(classification.lessonId)}
                          />
                          {classification.lessonTitle}
                        </CardTitle>
                        <Badge 
                          variant={classification.confidence > 0.8 ? 'default' : classification.confidence > 0.6 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {Math.round(classification.confidence * 100)}% confiança
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-2">
                      {renderTags(classification.suggestedTags.tema, 'tema')}
                      {renderTags(classification.suggestedTags.ferramenta, 'ferramenta')}
                      {renderTags(classification.suggestedTags.nivel, 'nivel')}
                      {renderTags(classification.suggestedTags.formato, 'formato')}
                      
                      {classification.reasoning && (
                        <p className="text-xs text-muted-foreground mt-2">
                          <strong>Análise:</strong> {classification.reasoning}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Estado vazio */}
          {!isAnalyzing && totalCount === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Clique em "Analisar" para que a IA classifique as aulas automaticamente</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
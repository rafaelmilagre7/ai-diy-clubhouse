import React, { useState } from 'react';
import { X, CheckCircle2, Circle, BookOpen, ExternalLink, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface RelatedLesson {
  id: string;
  title: string;
  module_id: string;
  course_id: string;
}

interface FlowNodeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  nodeId: string;
  nodeTitle: string;
  nodeDescription?: string;
  isCompleted: boolean;
  onToggleComplete: () => void;
  note: string;
  onNoteChange: (note: string) => void;
  relatedLessons?: RelatedLesson[];
  tutorialUrl?: string;
  videoUrl?: string;
}

export const FlowNodeSidebar: React.FC<FlowNodeSidebarProps> = ({
  isOpen,
  onClose,
  nodeId,
  nodeTitle,
  nodeDescription,
  isCompleted,
  onToggleComplete,
  note,
  onNoteChange,
  relatedLessons = [],
  tutorialUrl,
  videoUrl
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface border-l border-border shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-surface-elevated">
                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-medium-contrast" />
                  )}
                  <h3 className="font-semibold text-high-contrast">Detalhes da Etapa</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  {/* Node Title & Description */}
                  <div>
                    <h4 className="text-lg font-semibold text-high-contrast mb-2">
                      {nodeTitle}
                    </h4>
                    {nodeDescription && (
                      <p className="text-sm text-medium-contrast leading-relaxed">
                        {nodeDescription}
                      </p>
                    )}
                  </div>

                  {/* Completion Checkbox */}
                  <div className="flex items-center gap-3 p-3 bg-surface-elevated rounded-lg border border-border">
                    <Checkbox
                      id={`complete-${nodeId}`}
                      checked={isCompleted}
                      onCheckedChange={onToggleComplete}
                      className="h-5 w-5"
                    />
                    <label
                      htmlFor={`complete-${nodeId}`}
                      className="text-sm font-medium text-high-contrast cursor-pointer flex-1"
                    >
                      {isCompleted ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    </label>
                  </div>

                  {/* User Notes */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StickyNote className="h-4 w-4 text-primary" />
                        <h5 className="text-sm font-semibold text-high-contrast">
                          Suas Anotações
                        </h5>
                      </div>
                      {!isEditingNote && note && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingNote(true)}
                          className="h-7 text-xs"
                        >
                          Editar
                        </Button>
                      )}
                    </div>

                    {isEditingNote || !note ? (
                      <div className="space-y-2">
                        <Textarea
                          value={note}
                          onChange={(e) => onNoteChange(e.target.value)}
                          placeholder="Adicione suas anotações sobre esta etapa..."
                          className="min-h-[100px] text-sm"
                        />
                        {isEditingNote && (
                          <Button
                            size="sm"
                            onClick={() => setIsEditingNote(false)}
                            className="w-full"
                          >
                            Salvar anotação
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-surface-elevated rounded-lg border border-border">
                        <p className="text-sm text-medium-contrast whitespace-pre-wrap">
                          {note}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Related Lessons */}
                  {relatedLessons.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h5 className="text-sm font-semibold text-high-contrast">
                          Aulas Recomendadas
                        </h5>
                      </div>
                      <div className="space-y-2">
                        {relatedLessons.map((lesson) => (
                          <Button
                            key={lesson.id}
                            variant="outline"
                            className="w-full justify-start text-left h-auto py-3"
                            onClick={() => window.open(`/aulas/${lesson.course_id}/${lesson.module_id}/${lesson.id}`, '_blank')}
                          >
                            <BookOpen className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="text-sm flex-1">{lesson.title}</span>
                            <ExternalLink className="h-3 w-3 ml-2 flex-shrink-0" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* External Resources */}
                  {(tutorialUrl || videoUrl) && (
                    <div className="space-y-3">
                      <h5 className="text-sm font-semibold text-high-contrast">
                        Recursos Externos
                      </h5>
                      <div className="space-y-2">
                        {tutorialUrl && (
                          <a
                            href={tutorialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg border border-border transition-colors"
                          >
                            <BookOpen className="h-4 w-4 text-primary" />
                            <span className="text-sm flex-1">Tutorial oficial</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {videoUrl && (
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-3 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg border border-border transition-colors"
                          >
                            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                            <span className="text-sm flex-1">Vídeo explicativo</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileCode, 
  Copy, 
  CheckCircle2, 
  Download,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LiquidGlassCard } from '@/components/ui/LiquidGlassCard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function BuilderSolutionPrompt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCopied, setIsCopied] = useState(false);

  const { data: solution, isLoading } = useQuery({
    queryKey: ['builder-solution-prompt', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_generated_solutions')
        .select('id, title, lovable_prompt, original_idea')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleCopy = async () => {
    if (!solution?.lovable_prompt) return;
    
    try {
      await navigator.clipboard.writeText(solution.lovable_prompt);
      setIsCopied(true);
      toast.success('Prompt copiado com sucesso! 📋', {
        description: 'Cole no Lovable.dev para começar seu projeto'
      });
      
      setTimeout(() => setIsCopied(false), 3000);
    } catch (error) {
      toast.error('Erro ao copiar prompt', {
        description: 'Tente selecionar e copiar manualmente'
      });
    }
  };

  const handleDownload = () => {
    if (!solution?.lovable_prompt) return;
    
    const blob = new Blob([solution.lovable_prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lovable-prompt-${solution.title?.toLowerCase().replace(/\s+/g, '-') || 'solucao'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Prompt baixado! 📥', {
      description: 'Arquivo salvo com sucesso'
    });
  };

  const handleOpenLovable = () => {
    window.open('https://lovable.dev', '_blank');
    toast.info('Abrindo Lovable.dev...', {
      description: 'Cole o prompt no chat para começar'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!solution) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-muted-foreground">Solução não encontrada</p>
      </div>
    );
  }

  if (!solution.lovable_prompt) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <LiquidGlassCard className="p-8 text-center">
          <FileCode className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Prompt não disponível</h2>
          <p className="text-muted-foreground">
            Esta solução foi criada antes da implementação do Prompt Lovable.
          </p>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>

          {/* Hero Card com Título */}
          <LiquidGlassCard className="p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            
            <div className="relative z-10 flex items-start gap-6">
              {/* Logo Lovable estilosa */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/50">
                  <FileCode className="h-10 w-10 text-white" />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-600 bg-clip-text text-transparent">
                    Prompt Lovable
                  </h1>
                  <Badge variant="secondary" className="text-xs">
                    Pronto para usar
                  </Badge>
                </div>
                <p className="text-foreground/80 text-lg mb-4">
                  {solution.title || 'Sua solução Builder'}
                </p>
                <p className="text-sm text-muted-foreground italic">
                  💡 "{solution.original_idea?.substring(0, 120)}..."
                </p>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              onClick={handleCopy}
              className="flex-1 min-w-[200px] bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-xl shadow-violet-500/30"
            >
              {isCopied ? (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5 mr-2" />
                  Copiar Prompt
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleDownload}
              className="min-w-[180px]"
            >
              <Download className="h-5 w-5 mr-2" />
              Baixar .txt
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={handleOpenLovable}
              className="min-w-[180px]"
            >
              <ExternalLink className="h-5 w-5 mr-2" />
              Abrir Lovable
            </Button>
          </div>

          {/* Prompt Content */}
          <LiquidGlassCard className="p-8">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold mb-4 text-foreground border-b-2 border-primary/20 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold mt-8 mb-4 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold mt-6 mb-3 text-foreground">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 text-foreground/90">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-2 text-foreground/90">
                      {children}
                    </ol>
                  ),
                  code: ({ inline, children }: any) =>
                    inline ? (
                      <code className="bg-surface-elevated px-2 py-1 rounded text-sm font-mono text-primary">
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-surface-elevated p-4 rounded-lg text-sm font-mono overflow-x-auto">
                        {children}
                      </code>
                    ),
                  p: ({ children }) => (
                    <p className="text-foreground/90 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {solution.lovable_prompt}
              </ReactMarkdown>
            </div>
          </LiquidGlassCard>

          {/* Footer com Dica Profissional */}
          <LiquidGlassCard className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <Lightbulb className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  💡 Dica profissional
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  Cole este prompt <strong>completo</strong> no Lovable.dev e aguarde a geração inicial. 
                  Use o <strong>modo Chat</strong> para iterar e fazer ajustes específicos. 
                  Para mudanças visuais rápidas, use o <strong>Visual Edit</strong> (economiza créditos).
                </p>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Assinatura Rafael Milagre */}
          <div className="text-center py-6 border-t border-border/30">
            <p className="text-sm text-muted-foreground">
              Criado por <span className="font-semibold text-primary">Rafael Milagre AI</span>
              {' '}- Embaixador Lovable Brasil 🇧🇷
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

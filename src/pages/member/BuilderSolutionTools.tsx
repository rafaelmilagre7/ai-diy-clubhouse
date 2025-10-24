import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ToolsLoading } from '@/components/implementation/content/tools/ToolsLoading';
import { RequiredToolsGrid } from '@/components/builder/RequiredToolsGrid';
import type { Tool, SolutionTool } from '@/types/toolTypes';
import { useState } from 'react';

// Funções auxiliares para matching flexível de nomes
const normalizeName = (name: string) => 
  name.toLowerCase()
    .replace(/\s*\([^)]*\)/g, '') // Remove (parênteses)
    .trim();

const findToolByName = (name: string, tools: Tool[] | null) => {
  if (!tools) return null;
  const normalized = normalizeName(name);
  
  // 🎯 PRIORIDADE 1: Match exato completo
  const exactMatch = tools.find(t => 
    normalizeName(t.name) === normalized
  );
  if (exactMatch) {
    console.log(`✅ Match exato: "${name}" → "${exactMatch.name}"`);
    return exactMatch;
  }
  
  // 🎯 PRIORIDADE 2: Match exato de todas as palavras principais
  const nameWords = normalized.split(/[\s.]+/).filter(w => w.length > 3);
  
  const fullWordMatch = tools.find(t => {
    const toolNormalized = normalizeName(t.name);
    const toolWords = toolNormalized.split(/[\s.]+/).filter(w => w.length > 3);
    
    // Todas as palavras do nome devem estar presentes E mesmo número de palavras
    return nameWords.every(nw => 
      toolWords.some(tw => tw === nw || tw.includes(nw) || nw.includes(tw))
    ) && nameWords.length === toolWords.length;
  });
  
  if (fullWordMatch) {
    console.log(`✅ Match completo de palavras: "${name}" → "${fullWordMatch.name}"`);
    return fullWordMatch;
  }
  
  // 🎯 PRIORIDADE 3: Match parcial (ex: "Make" → "Make.com")
  const partialMatch = tools.find(t => {
    const toolNormalized = normalizeName(t.name);
    return toolNormalized.includes(normalized) || normalized.includes(toolNormalized);
  });
  
  if (partialMatch) {
    console.log(`⚠️ Match parcial: "${name}" → "${partialMatch.name}"`);
    return partialMatch;
  }
  
  // 🎯 PRIORIDADE 4: Match por palavra-chave (ÚLTIMO RECURSO)
  const keywordMatch = tools.find(t => {
    const toolNormalized = normalizeName(t.name);
    const toolWords = toolNormalized.split(/[\s.]+/).filter(w => w.length > 3);
    
    // Pelo menos 2 palavras devem coincidir EXATAMENTE
    const matchingWords = nameWords.filter(nw =>
      toolWords.some(tw => tw === nw)
    );
    
    return matchingWords.length >= 2;
  });
  
  if (keywordMatch) {
    console.log(`⚠️ Match por palavras-chave: "${name}" → "${keywordMatch.name}"`);
  } else {
    console.warn(`❌ Nenhum match encontrado para: "${name}"`);
  }
  
  return keywordMatch || null;
};

// Extrair dados específicos do JSONB required_tools
const extractFromJson = (toolName: string, field: string, requiredToolsJson: any) => {
  if (!requiredToolsJson) return undefined;
  
  const allTools = [
    ...(requiredToolsJson.essential || []),
    ...(requiredToolsJson.optional || [])
  ];
  
  const tool = allTools.find((t: any) => 
    normalizeName(t.name) === normalizeName(toolName)
  );
  
  return tool?.[field];
};

export default function BuilderSolutionTools() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState('Analisando solução...');

  // Buscar ferramentas da plataforma conectadas a essa solução
  const { data: tools, isLoading } = useQuery<{ essential: any[], optional: any[], requiredToolsJson?: any }>({
    queryKey: ['builder-solution-tools', id],
    queryFn: async () => {
      try {
        setLoadingStep('Buscando ferramentas vinculadas...');

        // ✅ FASE 1: Buscar solution_tools (sem JOIN inválido)
        const { data: solutionTools, error: toolsError } = await supabase
          .from('solution_tools')
          .select('*')
          .eq('solution_id', id);

        if (toolsError) throw toolsError;

        // ✅ FASE 2: Se vazio, buscar do JSONB required_tools
        if (!solutionTools || solutionTools.length === 0) {
          setLoadingStep('Carregando ferramentas do builder...');

          const { data: aiSolution, error: solutionError } = await supabase
            .from('ai_generated_solutions')
            .select('required_tools')
            .eq('id', id)
            .maybeSingle();

          if (solutionError) throw solutionError;

          if (!aiSolution?.required_tools) {
            return { essential: [], optional: [] };
          }

          setLoadingStep('Carregando ferramentas da plataforma...');

          // ✅ FASE 3: Buscar ferramentas da plataforma em BATCH (1 query única)
          const { data: platformTools, error: platformError } = await supabase
            .from('tools')
            .select('*')
            .eq('status', true);

          if (platformError) throw platformError;

          setLoadingStep('Organizando dados...');

          console.log('🔧 FERRAMENTAS RECEBIDAS DA IA:', {
            essenciais: aiSolution.required_tools.essential?.map((t: any) => t.name) || [],
            opcionais: aiSolution.required_tools.optional?.map((t: any) => t.name) || []
          });

          // ✅ FASE 4: Transformar para o formato do RequiredToolsGrid (APENAS ferramentas cadastradas)
          const essentialTools = (aiSolution.required_tools.essential || [])
            .map((jsonTool: any) => {
              const platformTool = findToolByName(jsonTool.name, platformTools);
              
              // ✅ Só incluir se existir na plataforma
              if (!platformTool) {
                console.warn(`⚠️ Ferramenta essencial "${jsonTool.name}" não encontrada na plataforma - ignorada`);
                return null;
              }
              
              return {
                name: platformTool.name,
                logo_url: platformTool.logo_url,
                category: platformTool.category || 'Outros',
                reason: platformTool.description || 'Ferramenta essencial para a implementação',
                setup_complexity: jsonTool.setup_complexity,
                cost_estimate: jsonTool.estimated_cost,
                tool_id: platformTool.id
              };
            })
            .filter(Boolean); // Remove nulls

          const optionalTools = (aiSolution.required_tools.optional || [])
            .map((jsonTool: any) => {
              const platformTool = findToolByName(jsonTool.name, platformTools);
              
              // ✅ Só incluir se existir na plataforma
              if (!platformTool) {
                console.warn(`⚠️ Ferramenta opcional "${jsonTool.name}" não encontrada na plataforma - ignorada`);
                return null;
              }
              
              return {
                name: platformTool.name,
                logo_url: platformTool.logo_url,
                category: platformTool.category || 'Outros',
                reason: platformTool.description || 'Ferramenta opcional recomendada',
                setup_complexity: jsonTool.setup_complexity,
                cost_estimate: jsonTool.estimated_cost,
                tool_id: platformTool.id
              };
            })
            .filter(Boolean); // Remove nulls

          // ✅ VALIDAÇÃO: Verificar se todas as ferramentas foram encontradas
          const expectedEssentialCount = aiSolution.required_tools.essential?.length || 0;
          const foundEssentialCount = essentialTools.length;
          const expectedOptionalCount = aiSolution.required_tools.optional?.length || 0;
          const foundOptionalCount = optionalTools.length;

          console.log('🔧 RESULTADO DO MATCHING:', {
            esperadas: {
              essenciais: expectedEssentialCount,
              opcionais: expectedOptionalCount
            },
            encontradas: {
              essenciais: foundEssentialCount,
              opcionais: foundOptionalCount
            },
            ferramentasEncontradas: {
              essenciais: essentialTools.map((t: any) => t.name),
              opcionais: optionalTools.map((t: any) => t.name)
            }
          });

          if (foundEssentialCount < expectedEssentialCount) {
            const missingTools = (aiSolution.required_tools.essential || [])
              .filter((jsonTool: any) => !findToolByName(jsonTool.name, platformTools))
              .map((t: any) => t.name);
            
            console.error(`⚠️ ALERTA: Esperadas ${expectedEssentialCount} ferramentas essenciais, mas apenas ${foundEssentialCount} foram encontradas!`);
            console.error('❌ Ferramentas essenciais não encontradas:', missingTools);
          }

          if (foundOptionalCount < expectedOptionalCount) {
            const missingTools = (aiSolution.required_tools.optional || [])
              .filter((jsonTool: any) => !findToolByName(jsonTool.name, platformTools))
              .map((t: any) => t.name);
            
            console.warn(`⚠️ ${expectedOptionalCount - foundOptionalCount} ferramentas opcionais não encontradas:`, missingTools);
          }

          return {
            essential: essentialTools,
            optional: optionalTools,
            requiredToolsJson: aiSolution.required_tools
          };
        }

        // ✅ Se houver solution_tools, buscar detalhes das ferramentas em BATCH
        setLoadingStep('Carregando detalhes das ferramentas...');

        const toolNames = solutionTools.map(st => st.tool_name).filter(Boolean);

        if (toolNames.length === 0) {
          return { essential: [], optional: [] };
        }

        const { data: platformTools, error: platformError } = await supabase
          .from('tools')
          .select('*')
          .eq('status', true);

        if (platformError) throw platformError;

        // Transformar solution_tools para o formato RequiredToolsGrid
        const essential = solutionTools
          .filter(st => st.is_required)
          .map(st => {
            const platformTool = findToolByName(st.tool_name, platformTools);
            return {
              name: st.tool_name,
              logo_url: platformTool?.logo_url,
              category: platformTool?.category || 'Outros',
              reason: 'Ferramenta vinculada à solução',
              setup_complexity: undefined,
              cost_estimate: undefined
            };
          });

        const optional = solutionTools
          .filter(st => !st.is_required)
          .map(st => {
            const platformTool = findToolByName(st.tool_name, platformTools);
            return {
              name: st.tool_name,
              logo_url: platformTool?.logo_url,
              category: platformTool?.category || 'Outros',
              reason: 'Ferramenta vinculada à solução',
              setup_complexity: undefined,
              cost_estimate: undefined
            };
          });

        return { essential, optional };

      } catch (error) {
        console.error('Erro ao buscar ferramentas:', error);
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <ToolsLoading message={loadingStep} />
        </div>
      </div>
    );
  }

  if (!tools || (!tools.essential?.length && !tools.optional?.length)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Nenhuma ferramenta vinculada a essa solução</p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/ferramentas/builder/solution/${id}`)}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              🔧 Ferramentas Necessárias
            </h1>
            <p className="text-foreground/70 text-lg">
              Stack completo para implementar sua solução
            </p>
          </div>

          <RequiredToolsGrid tools={tools} />
        </motion.div>
      </div>
    </div>
  );
}

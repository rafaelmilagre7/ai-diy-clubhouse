
import { useState, useCallback, useEffect } from "react";
import { useProgress } from "./useProgress";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Corrigindo a tipagem para ser explicitamente "user" ou "assistant"
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useOnboardingAI = (stepId: string) => {
  const { progress, updateProgress } = useProgress();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Buscar histórico de conversa ao montar ou mudar de etapa
  useEffect(() => {
    const fetchConversationHistory = async () => {
      if (!stepId || !progress?.user_id) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('onboarding_ai_conversations')
          .select('conversation_history')
          .eq('user_id', progress.user_id)
          .eq('step_id', stepId)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 = not found
          console.error("Erro ao buscar histórico de conversa:", error);
          throw error;
        }
        
        // Se existe um histórico, usá-lo
        if (data?.conversation_history) {
          const typedMessages = (data.conversation_history as any[]).map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content as string
          }));
          setMessages(typedMessages);
        } else {
          // Gerar mensagem inicial contextualizada para a etapa
          const initialMessage = getInitialMessageForStep(stepId, progress);
          setMessages([{ role: 'assistant', content: initialMessage }]);
        }
      } catch (err) {
        console.error("Erro ao buscar conversa:", err);
        setError(err instanceof Error ? err : new Error('Erro desconhecido'));
        
        // Fallback para mensagem padrão
        const fallbackMessage = "Olá! Estou aqui para te ajudar com esta etapa do onboarding. Como posso te ajudar?";
        setMessages([{ role: 'assistant', content: fallbackMessage }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchConversationHistory();
  }, [stepId, progress?.user_id]);
  
  // Salvar histórico de conversa
  const saveConversationHistory = useCallback(async (newMessages: Message[]) => {
    if (!stepId || !progress?.user_id) return;
    
    try {
      const { error } = await supabase
        .from('onboarding_ai_conversations')
        .upsert({
          user_id: progress.user_id,
          step_id: stepId,
          conversation_history: newMessages,
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error("Erro ao salvar histórico de conversa:", err);
      // Não exibir toast de erro aqui para não interromper a experiência
    }
  }, [stepId, progress?.user_id]);
  
  // Enviar mensagem para a API da OpenAI
  const sendMessage = useCallback(async (userMessage: string) => {
    if (!userMessage.trim() || !progress?.user_id) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Adicionar mensagem do usuário ao estado local
      const updatedMessages: Message[] = [
        ...messages,
        { role: 'user', content: userMessage }
      ];
      setMessages(updatedMessages);
      
      // Preparar o contexto para a API
      const context = buildContextFromProgress(progress, stepId);
      
      // Chamar API da OpenAI (usando Edge Function do Supabase)
      const response = await fetch('/api/onboarding-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          context,
          stepId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao processar sua mensagem');
      }
      
      const data = await response.json();
      const assistantMessage = data.message;
      
      // Adicionar resposta ao estado local
      const finalMessages: Message[] = [
        ...updatedMessages,
        { role: 'assistant', content: assistantMessage }
      ];
      setMessages(finalMessages);
      
      // Salvar histórico atualizado
      await saveConversationHistory(finalMessages);
      
      return assistantMessage;
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
      toast.error("Não foi possível processar sua mensagem. Por favor, tente novamente.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, stepId, progress, saveConversationHistory]);
  
  // Limpar conversa
  const clearConversation = useCallback(async () => {
    if (!stepId || !progress?.user_id) return;
    
    try {
      // Remover do banco
      await supabase
        .from('onboarding_ai_conversations')
        .delete()
        .eq('user_id', progress.user_id)
        .eq('step_id', stepId);
      
      // Resetar estado local com mensagem inicial
      const initialMessage = getInitialMessageForStep(stepId, progress);
      const resetMessages: Message[] = [{ role: 'assistant', content: initialMessage }];
      setMessages(resetMessages);
      
      toast.success("Conversa reiniciada");
    } catch (err) {
      console.error("Erro ao limpar conversa:", err);
      toast.error("Erro ao reiniciar conversa");
    }
  }, [stepId, progress]);

  return {
    messages,
    sendMessage,
    clearConversation,
    isLoading,
    error
  };
};

// Funções auxiliares

function getInitialMessageForStep(stepId: string, progress: any): string {
  const userName = progress?.personal_info?.name || 'usuário';
  
  const stepMessages: Record<string, string> = {
    personal_info: `Olá! Eu sou o Milagrinho, seu assistente de IA. Vamos começar com seus dados pessoais. Me conte seu nome, email, telefone e outras informações básicas. Estou aqui para te ajudar durante todo o processo!`,
    
    professional_info: `Olá ${userName}! Agora vamos falar sobre sua empresa. Qual é o nome da sua empresa? Em que setor ela atua? Estou aqui para te ajudar a preencher os dados profissionais.`,
    
    business_context: `Olá ${userName}! Para entender melhor o contexto do seu negócio, me conte quais são seus principais desafios e objetivos. Isso vai me ajudar a personalizar sua experiência no VIVER DE IA Club.`,
    
    ai_experience: `Oi ${userName}! Vamos falar sobre sua experiência com IA. Qual seu nível de conhecimento? Já implementou soluções de IA antes? Suas respostas vão me ajudar a recomendar conteúdos e soluções mais relevantes para você.`,
    
    business_goals: `Olá ${userName}! Vamos definir seus objetivos com IA. O que você espera alcançar nos próximos meses? Quais resultados seriam mais valiosos para seu negócio? Me conte para que eu possa te ajudar a traçar um caminho de sucesso!`,
    
    experience_personalization: `Oi ${userName}! Vamos personalizar sua experiência no clube. Quais são seus interesses? Qual sua disponibilidade para networking? Este é o momento de ajustar tudo conforme suas preferências e necessidades.`,
    
    complementary_info: `Olá ${userName}! Estamos quase finalizando! Preciso só de algumas informações complementares para completar seu perfil. Como você conheceu o VIVER DE IA Club? Tem interesse em compartilhar seu caso de sucesso no futuro?`,
    
    review: `Parabéns,  ${userName}! Você chegou à etapa final. Vamos revisar todas as informações que você forneceu. Se algo não estiver correto, você pode voltar às etapas anteriores e fazer ajustes antes de finalizar seu onboarding.`
  };
  
  // Versões alternativas dos IDs para compatibilidade
  const alternativeIdsMap: Record<string, string> = {
    'personal': 'personal_info',
    'professional_data': 'professional_info',
    'ai_exp': 'ai_experience',
    'complementary': 'complementary_info'
  };
  
  // Verificar se é um ID alternativo e buscar a mensagem correspondente
  const normalizedStepId = alternativeIdsMap[stepId] || stepId;
  
  return stepMessages[normalizedStepId] || `Olá ${userName}! Estou aqui para te ajudar com o preenchimento do seu onboarding. Como posso ajudar?`;
}

function buildContextFromProgress(progress: any, currentStepId: string): Record<string, any> {
  // Dados básicos do usuário para contextualização
  const context: Record<string, any> = {
    userName: progress?.personal_info?.name || '',
    userEmail: progress?.personal_info?.email || '',
    companyName: progress?.company_name || progress?.professional_info?.company_name || '',
    currentStep: currentStepId,
    completedSteps: progress?.completed_steps || []
  };
  
  // Adicionar dados específicos da etapa atual
  switch (currentStepId) {
    case 'personal_info':
    case 'personal':
      context.personalInfo = progress?.personal_info || {};
      break;
    case 'professional_info':
    case 'professional_data':
      context.professionalInfo = progress?.professional_info || {};
      context.personalInfo = progress?.personal_info || {};
      break;
    case 'business_context':
      context.businessContext = progress?.business_context || {};
      context.professionalInfo = progress?.professional_info || {};
      break;
    case 'ai_experience':
    case 'ai_exp':
      context.aiExperience = progress?.ai_experience || {};
      context.businessContext = progress?.business_context || {};
      break;
    case 'business_goals':
      context.businessGoals = progress?.business_goals || {};
      context.aiExperience = progress?.ai_experience || {};
      break;
    case 'experience_personalization':
      context.experiencePersonalization = progress?.experience_personalization || {};
      context.businessGoals = progress?.business_goals || {};
      break;
    case 'complementary_info':
    case 'complementary':
      context.complementaryInfo = progress?.complementary_info || {};
      context.experiencePersonalization = progress?.experience_personalization || {};
      break;
    case 'review':
      // Para a revisão, incluir todos os dados disponíveis
      context.allProgress = {
        personalInfo: progress?.personal_info || {},
        professionalInfo: progress?.professional_info || {},
        businessContext: progress?.business_context || {},
        aiExperience: progress?.ai_experience || {},
        businessGoals: progress?.business_goals || {},
        experiencePersonalization: progress?.experience_personalization || {},
        complementaryInfo: progress?.complementary_info || {}
      };
      break;
  }

  return context;
}

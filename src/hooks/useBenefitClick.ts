
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import { useToastModern } from '@/hooks/useToastModern';

export const useBenefitClick = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { showError } = useToastModern();

  const registerBenefitClick = async (toolId: string, benefitLink: string) => {
    if (!user) {
      // Se não estiver autenticado, apenas abre o link
      window.open(benefitLink, '_blank');
      return;
    }

    setIsProcessing(true);

    try {
      // Registrar o clique na tabela benefit_clicks
      await supabase.from('benefit_clicks').insert({
        tool_id: toolId,
        user_id: user.id,
        benefit_link: benefitLink
      });

      // Atualizar o contador de cliques na tabela tools
      await supabase.rpc('increment_benefit_clicks', { tool_id: toolId });

      // Abrir o link em uma nova aba
      window.open(benefitLink, '_blank');
    } catch (error) {
      console.error('Erro ao registrar clique no benefício:', error);
      
      // Mesmo com erro, abre o link para não prejudicar a experiência do usuário
      window.open(benefitLink, '_blank');
      
      showError('Erro ao registrar acesso', 'Ocorreu um erro ao registrar o seu acesso à oferta, mas o link foi aberto.');
    } finally {
      setIsProcessing(false);
    }
  };

  return { registerBenefitClick, isProcessing };
};

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Hook para validar se um ID de solução é um UUID válido
 * Redireciona automaticamente se o ID for inválido
 */
export const useValidatedSolutionId = (id: string | undefined) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;

    // Regex para validar UUID v4
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(id)) {
      console.error(`❌ [UUID-VALIDATION] ID inválido detectado: "${id}"`);
      
      toast.error('ID de solução inválido', {
        description: 'Você será redirecionado para o histórico.'
      });

      // Redirecionar após pequeno delay para que o usuário veja a mensagem
      setTimeout(() => {
        navigate('/ferramentas/builder/historico', { replace: true });
      }, 1500);
    }
  }, [id, navigate]);
};

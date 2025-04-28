
import { supabase } from '@/lib/supabase';

/**
 * Processa ou cria o perfil do usuário após login bem-sucedido
 * @param userId ID do usuário autenticado
 * @param email Email do usuário
 * @param name Nome do usuário (opcional)
 * @returns O perfil do usuário processado ou criado
 */
export const processUserProfile = async (
  userId: string,
  email: string | undefined,
  name?: string
) => {
  try {
    console.log(`Processando perfil para usuário ${userId}`);
    
    // Buscar perfil existente
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Usando maybeSingle em vez de single para evitar erros
    
    if (fetchError) {
      console.error('Erro ao buscar perfil:', fetchError);
      throw fetchError;
    }
    
    // Se o perfil existir, retornar
    if (existingProfile) {
      console.log('Perfil existente encontrado:', existingProfile);
      return existingProfile;
    }
    
    console.log('Perfil não encontrado, criando novo perfil');
    
    // Determinar papel (role) do usuário
    const isAdmin = email?.endsWith('@viverdeia.ai') || email === 'admin@teste.com';
    const role = isAdmin ? 'admin' : 'member';
    
    // Criar perfil se não existir
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          email: email || '',
          name: name || 'Usuário',
          role: role
        }
      ])
      .select()
      .single();
    
    if (insertError) {
      console.error('Erro ao criar perfil:', insertError);
      throw insertError;
    }
    
    console.log('Novo perfil criado:', newProfile);
    
    // Inicializar o progresso de onboarding para o novo usuário
    await initializeOnboardingProgress(userId);
    
    return newProfile;
    
  } catch (error) {
    console.error('Erro ao processar perfil:', error);
    throw error;
  }
};

/**
 * Inicializa o registro de progresso de onboarding para um novo usuário
 */
const initializeOnboardingProgress = async (userId: string) => {
  try {
    // Verificar se já existe um registro de progresso
    const { data: existingProgress } = await supabase
      .from('onboarding_progress')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (existingProgress) {
      console.log('Progresso de onboarding já existe:', existingProgress.id);
      return existingProgress;
    }
    
    // Criar registro de progresso inicial
    const { data: newProgress, error } = await supabase
      .from('onboarding_progress')
      .insert([{
        user_id: userId,
        current_step: 'personal',
        completed_steps: [],
        is_completed: false,
        personal_info: {},
        professional_info: {},
        business_context: {},
        business_goals: {},
        ai_experience: {},
        experience_personalization: {},
        complementary_info: {}
      }])
      .select()
      .single();
      
    if (error) {
      console.error('Erro ao inicializar progresso de onboarding:', error);
      throw error;
    }
    
    console.log('Progresso de onboarding inicializado:', newProgress.id);
    return newProgress;
  } catch (error) {
    console.error('Falha ao inicializar progresso de onboarding:', error);
    // Não propagar erro para não bloquear fluxo de autenticação
    return null;
  }
};

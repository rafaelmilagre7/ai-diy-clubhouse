
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';

interface OnboardingFormData {
  name: string;
  email: string;
  company_name: string;
  company_size: string;
  company_sector: string;
  current_position: string;
  business_goals: string[];
  ai_experience_level: string;
}

export const UnifiedOnboardingForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<OnboardingFormData>();

  const onSubmit = async (data: OnboardingFormData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('onboarding_progress')
        .insert({
          user_id: user.id,
          personal_info: {
            name: data.name,
            email: data.email
          },
          professional_info: {
            company_name: data.company_name,
            company_size: data.company_size,
            company_sector: data.company_sector,
            current_position: data.current_position
          },
          business_goals: {
            goals: data.business_goals
          },
          ai_experience: {
            knowledge_level: data.ai_experience_level
          },
          is_completed: true,
          current_step: 'completed',
          completed_steps: ['unified_onboarding']
        });

      if (error) {
        throw error;
      }

      toast.success('Cadastro realizado com sucesso!');
      navigate('/implementation-trail');
    } catch (error) {
      console.error('Erro no onboarding:', error);
      toast.error('Erro ao salvar dados. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Seu Cadastro no VIVER DE IA Club</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Nome Completo</label>
            <input 
              {...register('name', { required: 'Nome é obrigatório' })}
              className="w-full p-2 border rounded"
              placeholder="Seu nome"
            />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block mb-2">Email</label>
            <input 
              {...register('email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email inválido"
                }
              })}
              className="w-full p-2 border rounded"
              placeholder="Seu email"
            />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Nome da Empresa</label>
            <input 
              {...register('company_name', { required: 'Nome da empresa é obrigatório' })}
              className="w-full p-2 border rounded"
              placeholder="Nome da empresa"
            />
          </div>
          <div>
            <label className="block mb-2">Tamanho da Empresa</label>
            <select 
              {...register('company_size', { required: 'Tamanho da empresa é obrigatório' })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione</option>
              <option value="micro">Micro (até 10 funcionários)</option>
              <option value="pequena">Pequena (10-49 funcionários)</option>
              <option value="media">Média (50-249 funcionários)</option>
              <option value="grande">Grande (250+ funcionários)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2">Setor da Empresa</label>
            <select 
              {...register('company_sector', { required: 'Setor da empresa é obrigatório' })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione</option>
              <option value="tecnologia">Tecnologia</option>
              <option value="saude">Saúde</option>
              <option value="educacao">Educação</option>
              <option value="comercio">Comércio</option>
              <option value="servicos">Serviços</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Cargo Atual</label>
            <input 
              {...register('current_position', { required: 'Cargo é obrigatório' })}
              className="w-full p-2 border rounded"
              placeholder="Seu cargo"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2">Principais objetivos de negócio</label>
          <div className="grid grid-cols-2 gap-2">
            {['Aumentar Receita', 'Reduzir Custos', 'Melhorar Produtividade', 'Inovar'].map((goal) => (
              <label key={goal} className="inline-flex items-center">
                <input 
                  type="checkbox" 
                  value={goal}
                  {...register('business_goals')}
                  className="mr-2"
                />
                {goal}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-2">Nível de Experiência com IA</label>
          <select 
            {...register('ai_experience_level', { required: 'Nível de experiência é obrigatório' })}
            className="w-full p-2 border rounded"
          >
            <option value="">Selecione</option>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-[#0ABAB5] hover:bg-[#0ABAB5]/90"
        >
          {isSubmitting ? 'Salvando...' : 'Concluir Cadastro'}
        </Button>
      </form>
    </div>
  );
};

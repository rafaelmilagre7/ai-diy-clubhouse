
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/lib/supabase';

interface AccessRule {
  id: string;
  name: string;
  type: 'date_based' | 'progress_based' | 'role_promotion' | 'payment_based';
  conditions: any;
  actions: any;
  isActive: boolean;
}

interface ProgressBasedRule {
  requiredCourseId: string;
  requiredProgress: number; // 0-100
  targetCourseId: string;
}

interface DateBasedRule {
  startDate: string;
  endDate?: string;
  courseIds: string[];
}

interface RolePromotionRule {
  fromRole: string;
  toRole: string;
  requiredCourses: string[];
  requiredProgress: number;
}

export const useAdvancedRules = () => {
  const { user, profile } = useAuth();
  const [rules, setRules] = useState<AccessRule[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Buscar regras ativas
  const fetchActiveRules = async () => {
    try {
      // Por enquanto, usar regras hardcoded - em produção viria do banco
      const hardcodedRules: AccessRule[] = [
        {
          id: '1',
          name: 'Acesso por Progresso',
          type: 'progress_based',
          conditions: {
            requiredCourseId: 'intro-ai-course',
            requiredProgress: 80,
            targetCourseId: 'advanced-ai-course'
          },
          actions: { grantAccess: true },
          isActive: true
        },
        {
          id: '2',
          name: 'Acesso Temporal',
          type: 'date_based',
          conditions: {
            startDate: '2025-01-01',
            endDate: '2025-12-31',
            courseIds: ['seasonal-course-1', 'seasonal-course-2']
          },
          actions: { grantAccess: true },
          isActive: true
        },
        {
          id: '3',
          name: 'Promoção Automática',
          type: 'role_promotion',
          conditions: {
            fromRole: 'member',
            toRole: 'advanced_member',
            requiredCourses: ['basic-course-1', 'basic-course-2'],
            requiredProgress: 100
          },
          actions: { promoteRole: true },
          isActive: true
        }
      ];

      setRules(hardcodedRules);
    } catch (error) {
      console.error('Erro ao buscar regras:', error);
    }
  };

  // Verificar regras baseadas em progresso
  const checkProgressBasedRules = async (courseId: string) => {
    if (!user?.id) return false;

    const progressRules = rules.filter(r => 
      r.type === 'progress_based' && 
      r.isActive &&
      r.conditions.targetCourseId === courseId
    );

    for (const rule of progressRules) {
      const conditions = rule.conditions as ProgressBasedRule;
      
      // Verificar progresso no curso prerequisito
      const { data: progress } = await supabase
        .from('learning_progress')
        .select('progress_percentage')
        .eq('user_id', user.id)
        .eq('lesson_id', conditions.requiredCourseId)
        .order('progress_percentage', { ascending: false })
        .limit(1)
        .single();

      const userProgress = progress?.progress_percentage || 0;
      
      if (userProgress >= conditions.requiredProgress) {
        console.log(`✅ Regra de progresso atendida: ${rule.name}`);
        return true;
      }
    }

    return false;
  };

  // Verificar regras baseadas em data
  const checkDateBasedRules = async (courseId: string) => {
    const dateRules = rules.filter(r => 
      r.type === 'date_based' && 
      r.isActive &&
      r.conditions.courseIds.includes(courseId)
    );

    const now = new Date();

    for (const rule of dateRules) {
      const conditions = rule.conditions as DateBasedRule;
      const startDate = new Date(conditions.startDate);
      const endDate = conditions.endDate ? new Date(conditions.endDate) : null;

      if (now >= startDate && (!endDate || now <= endDate)) {
        console.log(`✅ Regra temporal atendida: ${rule.name}`);
        return true;
      }
    }

    return false;
  };

  // Verificar e aplicar promoções de role
  const checkRolePromotions = async () => {
    if (!user?.id || !profile?.role) return;

    setIsProcessing(true);

    try {
      const promotionRules = rules.filter(r => 
        r.type === 'role_promotion' && 
        r.isActive &&
        r.conditions.fromRole === profile.role
      );

      for (const rule of promotionRules) {
        const conditions = rule.conditions as RolePromotionRule;
        
        // Verificar se completou todos os cursos necessários
        let allCoursesCompleted = true;
        
        for (const courseId of conditions.requiredCourses) {
          const { data: progress } = await supabase
            .from('learning_progress')
            .select('progress_percentage')
            .eq('user_id', user.id)
            .eq('lesson_id', courseId)
            .order('progress_percentage', { ascending: false })
            .limit(1)
            .single();

          const courseProgress = progress?.progress_percentage || 0;
          
          if (courseProgress < conditions.requiredProgress) {
            allCoursesCompleted = false;
            break;
          }
        }

        if (allCoursesCompleted) {
          // Aplicar promoção de role
          const { error } = await supabase
            .from('profiles')
            .update({ role: conditions.toRole })
            .eq('id', user.id);

          if (!error) {
            console.log(`🎉 Role promovido: ${conditions.fromRole} → ${conditions.toRole}`);
            
            // Criar notificação
            await supabase
              .from('notifications')
              .insert({
                user_id: user.id,
                title: 'Parabéns! Role Promovido',
                message: `Você foi promovido para ${conditions.toRole} por completar os cursos necessários!`,
                type: 'success',
                data: { 
                  rule_name: rule.name,
                  old_role: conditions.fromRole,
                  new_role: conditions.toRole
                }
              });
          }
        }
      }
    } catch (error) {
      console.error('Erro ao verificar promoções:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Função principal para verificar acesso com regras avançadas
  const checkAdvancedAccess = async (courseId: string): Promise<boolean> => {
    try {
      // Verificar regras de progresso
      const progressAccess = await checkProgressBasedRules(courseId);
      if (progressAccess) return true;

      // Verificar regras temporais
      const dateAccess = await checkDateBasedRules(courseId);
      if (dateAccess) return true;

      return false;
    } catch (error) {
      console.error('Erro ao verificar regras avançadas:', error);
      return false;
    }
  };

  // Obter próximos marcos do usuário
  const getUpcomingMilestones = async () => {
    if (!user?.id || !profile?.role) return [];

    const milestones = [];

    // Verificar regras de promoção
    const promotionRules = rules.filter(r => 
      r.type === 'role_promotion' && 
      r.isActive &&
      r.conditions.fromRole === profile.role
    );

    for (const rule of promotionRules) {
      const conditions = rule.conditions as RolePromotionRule;
      const completedCourses = [];
      
      for (const courseId of conditions.requiredCourses) {
        const { data: progress } = await supabase
          .from('learning_progress')
          .select('progress_percentage')
          .eq('user_id', user.id)
          .eq('lesson_id', courseId)
          .order('progress_percentage', { ascending: false })
          .limit(1)
          .single();

        const courseProgress = progress?.progress_percentage || 0;
        
        if (courseProgress >= conditions.requiredProgress) {
          completedCourses.push(courseId);
        }
      }

      milestones.push({
        ruleId: rule.id,
        ruleName: rule.name,
        type: 'role_promotion',
        progress: completedCourses.length / conditions.requiredCourses.length,
        target: `Promoção para ${conditions.toRole}`,
        remaining: conditions.requiredCourses.length - completedCourses.length
      });
    }

    return milestones;
  };

  useEffect(() => {
    fetchActiveRules();
  }, []);

  // Verificar promoções quando o perfil carregar
  useEffect(() => {
    if (profile?.role && rules.length > 0) {
      checkRolePromotions();
    }
  }, [profile?.role, rules]);

  return {
    rules,
    isProcessing,
    checkAdvancedAccess,
    checkRolePromotions,
    getUpcomingMilestones,
    fetchActiveRules
  };
};

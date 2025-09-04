import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Verificar se é admin
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*, user_roles(*)')
      .eq('id', user.id)
      .single();

    if (!profile?.user_roles?.name || profile.user_roles.name !== 'admin') {
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Buscar dados de learning
    const [
      coursesResult,
      modulesResult,
      lessonsResult,
      progressResult,
      commentsResult,
      npsResult,
      recentProgressResult
    ] = await Promise.all([
      // Cursos
      supabase
        .from('learning_courses')
        .select('id, published, created_at', { count: 'exact' }),
      
      // Módulos
      supabase
        .from('learning_modules')
        .select('id, course_id', { count: 'exact' }),
      
      // Lições
      supabase
        .from('learning_lessons')
        .select('id, module_id, duration_minutes', { count: 'exact' }),
      
      // Progresso dos usuários
      supabase
        .from('learning_progress')
        .select('id, user_id, lesson_id, progress_percentage, completed_at', { count: 'exact' }),
      
      // Comentários
      supabase
        .from('learning_comments')
        .select('id, created_at', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo),
      
      // NPS scores
      supabase
        .from('learning_lesson_nps')
        .select('id, score, created_at', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo),
      
      // Progresso recente (30 dias)
      supabase
        .from('learning_progress')
        .select('id, user_id, created_at, progress_percentage', { count: 'exact' })
        .gte('created_at', thirtyDaysAgo)
    ]);

    // Calcular métricas de conclusão
    const completedLessons = progressResult.data?.filter(p => p.progress_percentage === 100).length || 0;
    const uniqueLearners = new Set(progressResult.data?.map(p => p.user_id) || []).size;
    const totalDuration = lessonsResult.data?.reduce((sum, lesson) => sum + (lesson.duration_minutes || 0), 0) || 0;

    // Progresso por dia nos últimos 30 dias
    const dailyProgress = {};
    recentProgressResult.data?.forEach(progress => {
      const day = progress.created_at.split('T')[0];
      dailyProgress[day] = (dailyProgress[day] || 0) + 1;
    });

    // Distribuição do NPS
    const npsDistribution = { promoters: 0, passives: 0, detractors: 0 };
    let totalNpsScore = 0;
    npsResult.data?.forEach(nps => {
      totalNpsScore += nps.score;
      if (nps.score >= 9) npsDistribution.promoters++;
      else if (nps.score >= 7) npsDistribution.passives++;
      else npsDistribution.detractors++;
    });

    const avgNps = npsResult.count > 0 ? Math.round((totalNpsScore / npsResult.count) * 100) / 100 : 0;
    const npsScore = npsResult.count > 0 
      ? Math.round(((npsDistribution.promoters - npsDistribution.detractors) / npsResult.count) * 100)
      : 0;

    // Calcular taxa de progresso média
    const avgProgressPercentage = progressResult.data?.length > 0
      ? Math.round((progressResult.data.reduce((sum, p) => sum + (p.progress_percentage || 0), 0) / progressResult.data.length) * 100) / 100
      : 0;

    const dashboardData = {
      overview: {
        totalCourses: coursesResult.count || 0,
        publishedCourses: coursesResult.data?.filter(c => c.published).length || 0,
        totalModules: modulesResult.count || 0,
        totalLessons: lessonsResult.count || 0,
        totalLearners: uniqueLearners,
        totalDurationMinutes: totalDuration
      },
      progress: {
        totalProgress: progressResult.count || 0,
        completedLessons: completedLessons,
        avgProgressPercentage: avgProgressPercentage,
        completionRate: progressResult.count > 0 ? Math.round((completedLessons / progressResult.count) * 100) : 0,
        monthlyProgress: recentProgressResult.count || 0,
        dailyProgress: dailyProgress
      },
      engagement: {
        totalComments: commentsResult.count || 0,
        monthlyComments: commentsResult.count || 0,
        commentsPerLesson: lessonsResult.count > 0 ? Math.round((commentsResult.count / lessonsResult.count) * 100) / 100 : 0,
        learnerEngagement: uniqueLearners > 0 ? Math.round((commentsResult.count / uniqueLearners) * 100) / 100 : 0
      },
      satisfaction: {
        npsScore: npsScore,
        avgRating: avgNps,
        totalRatings: npsResult.count || 0,
        ratingDistribution: npsDistribution,
        monthlyRatings: npsResult.count || 0
      },
      performance: {
        avgLessonDuration: lessonsResult.count > 0 ? Math.round(totalDuration / lessonsResult.count) : 0,
        contentUtilization: lessonsResult.count > 0 ? Math.round((completedLessons / lessonsResult.count) * 100) : 0,
        learnerRetention: uniqueLearners > 0 && progressResult.count > 0 
          ? Math.round((uniqueLearners / (progressResult.count / uniqueLearners)) * 100) 
          : 0
      },
      trends: {
        learningTrend: recentProgressResult.count > (progressResult.count * 0.3) ? 'increasing' : 'stable',
        engagementTrend: commentsResult.count > (lessonsResult.count * 0.1) ? 'high' : 'moderate',
        satisfactionTrend: npsScore > 50 ? 'positive' : npsScore > 0 ? 'neutral' : 'negative'
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        cacheFor: 300,
        dataRange: '30 days'
      }
    };

    return new Response(JSON.stringify(dashboardData), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });

  } catch (error) {
    console.error('Error in dashboard-learning function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
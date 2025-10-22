import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RecommendationRequest {
  user_id: string;
  completed_course_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, completed_course_id } = await req.json() as RecommendationRequest;

    if (!user_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'user_id é obrigatório'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`🎓 [RECOMMEND] Buscando recomendações para usuário ${user_id}`);

    // 1. Buscar cursos já iniciados pelo usuário
    const { data: userProgress } = await supabase
      .from('learning_progress')
      .select(`
        lesson_id,
        learning_lessons!inner(
          module_id,
          learning_modules!inner(
            course_id
          )
        )
      `)
      .eq('user_id', user_id);

    const startedCourseIds = new Set(
      (userProgress || []).map((p: any) => 
        p.learning_lessons?.learning_modules?.course_id
      ).filter(Boolean)
    );

    // 2. Buscar cursos publicados que o usuário ainda não começou
    const { data: availableCourses, error: coursesError } = await supabase
      .from('learning_courses')
      .select('id, title, description, cover_image_url, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (coursesError) {
      console.error('❌ [RECOMMEND] Erro ao buscar cursos:', coursesError);
      throw coursesError;
    }

    // 3. Filtrar cursos não iniciados
    const recommendations = (availableCourses || [])
      .filter(course => !startedCourseIds.has(course.id))
      .slice(0, 3); // Top 3 recomendações

    // 4. Criar notificações para os cursos recomendados
    let notificationsSent = 0;

    for (const course of recommendations) {
      // Verificar se já existe notificação recente para este curso
      const { data: existingNotification } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user_id)
        .eq('type', 'learning_course_recommendation')
        .eq('reference_id', course.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Últimos 30 dias
        .single();

      if (!existingNotification) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id,
            type: 'learning_course_recommendation',
            category: 'learning',
            title: 'Recomendação: ' + course.title,
            message: completed_course_id 
              ? 'Baseado no seu progresso, achamos que você vai gostar deste curso!'
              : 'Este curso pode ser interessante para você!',
            reference_id: course.id,
            reference_type: 'course',
            metadata: {
              course_id: course.id,
              course_title: course.title,
              course_description: course.description,
              cover_image: course.cover_image_url,
              reason: completed_course_id ? 'course_completion' : 'general_interest'
            },
            priority: 'low'
          });

        if (!notificationError) {
          notificationsSent++;
        }
      }
    }

    console.log(`✅ [RECOMMEND] ${notificationsSent} recomendações enviadas de ${recommendations.length} possíveis`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations_sent: notificationsSent,
        recommended_courses: recommendations.map(c => ({
          id: c.id,
          title: c.title
        })),
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ [RECOMMEND] Erro fatal:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

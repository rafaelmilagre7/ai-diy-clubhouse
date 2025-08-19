import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteModuleRequest {
  moduleId: string;
}

Deno.serve(async (req) => {
  console.log('🗑️ [DELETE-MODULE] Iniciando função de exclusão de módulo');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log('👤 [DELETE-MODULE] Usuário autenticado:', user.id);

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        user_roles (
          name
        )
      `)
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    const isAdmin = profile.role === 'admin' || profile.user_roles?.name === 'admin';
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Acesso negado - apenas administradores podem excluir módulos' }), 
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('✅ [DELETE-MODULE] Usuário autorizado como admin');

    // Parse request body
    const body: DeleteModuleRequest = await req.json();
    const { moduleId } = body;

    if (!moduleId) {
      return new Response(
        JSON.stringify({ error: 'Module ID is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('🔍 [DELETE-MODULE] Deletando módulo:', moduleId);

    // Verify module exists
    const { data: module, error: moduleError } = await supabase
      .from('learning_modules')
      .select('id, title')
      .eq('id', moduleId)
      .single();

    if (moduleError || !module) {
      return new Response(
        JSON.stringify({ error: 'Módulo não encontrado' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('📚 [DELETE-MODULE] Módulo encontrado:', module.title);

    // Get all lessons in this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('learning_lessons')
      .select('id')
      .eq('module_id', moduleId);

    if (lessonsError) {
      throw new Error(`Erro ao buscar aulas: ${lessonsError.message}`);
    }

    const lessonIds = lessons?.map(lesson => lesson.id) || [];
    console.log(`📝 [DELETE-MODULE] Encontradas ${lessonIds.length} aulas para deletar`);

    // If there are lessons, delete all related data in cascade
    if (lessonIds.length > 0) {
      console.log('🧹 [DELETE-MODULE] Deletando dados relacionados das aulas...');

      // Delete learning resources
      const { error: resourcesError } = await supabase
        .from('learning_resources')
        .delete()
        .in('lesson_id', lessonIds);

      if (resourcesError) {
        console.error('❌ [DELETE-MODULE] Erro ao deletar recursos:', resourcesError);
        throw new Error(`Erro ao deletar recursos: ${resourcesError.message}`);
      }

      // Delete lesson videos
      const { error: videosError } = await supabase
        .from('learning_lesson_videos')
        .delete()
        .in('lesson_id', lessonIds);

      if (videosError) {
        console.error('❌ [DELETE-MODULE] Erro ao deletar vídeos:', videosError);
        throw new Error(`Erro ao deletar vídeos: ${videosError.message}`);
      }

      // Delete learning progress
      const { error: progressError } = await supabase
        .from('learning_progress')
        .delete()
        .in('lesson_id', lessonIds);

      if (progressError) {
        console.error('❌ [DELETE-MODULE] Erro ao deletar progresso:', progressError);
        throw new Error(`Erro ao deletar progresso: ${progressError.message}`);
      }

      // Delete learning comments
      const { error: commentsError } = await supabase
        .from('learning_comments')
        .delete()
        .in('lesson_id', lessonIds);

      if (commentsError) {
        console.error('❌ [DELETE-MODULE] Erro ao deletar comentários:', commentsError);
        throw new Error(`Erro ao deletar comentários: ${commentsError.message}`);
      }

      // Delete learning lesson NPS
      const { error: npsError } = await supabase
        .from('learning_lesson_nps')
        .delete()
        .in('lesson_id', lessonIds);

      if (npsError) {
        console.error('❌ [DELETE-MODULE] Erro ao deletar NPS:', npsError);
        throw new Error(`Erro ao deletar NPS: ${npsError.message}`);
      }

      // Delete lesson tools if they exist
      try {
        const { error: toolsError } = await supabase
          .from('learning_lesson_tools')
          .delete()
          .in('lesson_id', lessonIds);

        if (toolsError) {
          console.log('⚠️ [DELETE-MODULE] Aviso ao deletar ferramentas:', toolsError.message);
        }
      } catch (error) {
        console.log('⚠️ [DELETE-MODULE] Tabela learning_lesson_tools não existe, continuando...');
      }

      console.log('✅ [DELETE-MODULE] Dados relacionados deletados com sucesso');

      // Delete all lessons
      const { error: deleteLessonsError } = await supabase
        .from('learning_lessons')
        .delete()
        .eq('module_id', moduleId);

      if (deleteLessonsError) {
        console.error('❌ [DELETE-MODULE] Erro ao deletar aulas:', deleteLessonsError);
        throw new Error(`Erro ao deletar aulas: ${deleteLessonsError.message}`);
      }
      
      console.log('✅ [DELETE-MODULE] Aulas deletadas com sucesso');
    }

    // Finally, delete the module
    const { error: deleteModuleError } = await supabase
      .from('learning_modules')
      .delete()
      .eq('id', moduleId);

    if (deleteModuleError) {
      console.error('❌ [DELETE-MODULE] Erro ao deletar módulo:', deleteModuleError);
      throw new Error(`Erro ao deletar módulo: ${deleteModuleError.message}`);
    }

    console.log('✅ [DELETE-MODULE] Módulo deletado com sucesso:', module.title);

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        event_type: 'module_deletion',
        action: 'delete_module_cascade',
        details: {
          moduleId: moduleId,
          moduleTitle: module.title,
          deletedLessons: lessonIds.length,
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Módulo "${module.title}" e ${lessonIds.length} aulas foram excluídos com sucesso`,
        deletedLessons: lessonIds.length
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ [DELETE-MODULE] Erro:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
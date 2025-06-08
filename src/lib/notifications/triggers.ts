
import { supabase } from '@/lib/supabase';

/**
 * Cria notificação quando um usuário completa uma solução
 */
export const createSolutionCompletionNotification = async (userId: string, solutionId: string) => {
  try {
    // Buscar dados da solução
    const { data: solution } = await supabase
      .from('solutions')
      .select('title')
      .eq('id', solutionId)
      .single();

    if (!solution) return;

    // Criar notificação
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'solution_completed',
        title: 'Parabéns! Solução concluída',
        message: `Você concluiu com sucesso a solução "${solution.title}". Agora você pode gerar seu certificado!`,
        data: {
          solution_id: solutionId,
          solution_title: solution.title,
          action_url: `/solution/${solutionId}/certificate`
        }
      });

    console.log('Notificação de conclusão de solução criada para usuário:', userId);
  } catch (error) {
    console.error('Erro ao criar notificação de conclusão:', error);
  }
};

/**
 * Cria notificação quando um usuário recebe uma resposta no fórum
 */
export const createForumReplyNotification = async (topicId: string, postId: string, repliedUserId: string, replyUserId: string) => {
  try {
    if (repliedUserId === replyUserId) return; // Não notificar próprias respostas

    // Buscar dados do tópico e usuário que respondeu
    const [topicResult, userResult] = await Promise.all([
      supabase
        .from('forum_topics')
        .select('title')
        .eq('id', topicId)
        .single(),
      supabase
        .from('profiles')
        .select('name')
        .eq('id', replyUserId)
        .single()
    ]);

    if (!topicResult.data || !userResult.data) return;

    // Criar notificação
    await supabase
      .from('notifications')
      .insert({
        user_id: repliedUserId,
        type: 'forum_reply',
        title: 'Nova resposta no fórum',
        message: `${userResult.data.name} respondeu ao seu tópico "${topicResult.data.title}"`,
        data: {
          topic_id: topicId,
          post_id: postId,
          reply_user_id: replyUserId,
          reply_user_name: userResult.data.name,
          action_url: `/comunidade/topico/${topicId}`
        }
      });

    console.log('Notificação de resposta do fórum criada');
  } catch (error) {
    console.error('Erro ao criar notificação de resposta do fórum:', error);
  }
};

/**
 * Cria notificação quando um usuário completa uma aula
 */
export const createLessonCompletionNotification = async (userId: string, lessonId: string) => {
  try {
    // Buscar dados da aula, módulo e curso separadamente
    const { data: lesson } = await supabase
      .from('learning_lessons')
      .select('title, module_id')
      .eq('id', lessonId)
      .single();

    if (!lesson) return;

    // Buscar módulo
    const { data: module } = await supabase
      .from('learning_modules')
      .select('title, course_id')
      .eq('id', lesson.module_id)
      .single();

    if (!module) return;

    // Buscar curso
    const { data: course } = await supabase
      .from('learning_courses')
      .select('title, id')
      .eq('id', module.course_id)
      .single();

    if (!course) return;

    // Criar notificação
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'lesson_completed',
        title: 'Aula concluída!',
        message: `Você concluiu a aula "${lesson.title}" do curso "${course.title}"`,
        data: {
          lesson_id: lessonId,
          lesson_title: lesson.title,
          course_title: course.title,
          action_url: `/learning/course/${course.id}`
        }
      });

    console.log('Notificação de conclusão de aula criada');
  } catch (error) {
    console.error('Erro ao criar notificação de conclusão de aula:', error);
  }
};

/**
 * Cria notificação quando há um novo evento
 */
export const createNewEventNotification = async (eventId: string, targetRoles: string[] = []) => {
  try {
    // Buscar dados do evento
    const { data: event } = await supabase
      .from('events')
      .select('title, description, start_time')
      .eq('id', eventId)
      .single();

    if (!event) return;

    // Buscar usuários dos papéis alvo
    let usersQuery = supabase
      .from('profiles')
      .select('id');

    if (targetRoles.length > 0) {
      usersQuery = usersQuery
        .in('role', targetRoles);
    }

    const { data: users } = await usersQuery;

    if (!users || users.length === 0) return;

    // Criar notificações para todos os usuários
    const notifications = users.map(user => ({
      user_id: user.id,
      type: 'new_event',
      title: 'Novo evento disponível',
      message: `"${event.title}" foi agendado para ${new Date(event.start_time).toLocaleDateString('pt-BR')}`,
      data: {
        event_id: eventId,
        event_title: event.title,
        event_date: event.start_time,
        action_url: `/events`
      }
    }));

    await supabase
      .from('notifications')
      .insert(notifications);

    console.log(`Notificações de novo evento criadas para ${users.length} usuários`);
  } catch (error) {
    console.error('Erro ao criar notificações de novo evento:', error);
  }
};

/**
 * Cria notificação quando uma nova ferramenta é adicionada
 */
export const createNewToolNotification = async (toolId: string) => {
  try {
    // Buscar dados da ferramenta
    const { data: tool } = await supabase
      .from('tools')
      .select('name, description, category')
      .eq('id', toolId)
      .single();

    if (!tool) return;

    // Buscar todos os usuários ativos
    const { data: users } = await supabase
      .from('profiles')
      .select('id');

    if (!users || users.length === 0) return;

    // Criar notificações
    const notifications = users.map(user => ({
      user_id: user.id,
      type: 'new_tool',
      title: 'Nova ferramenta disponível',
      message: `A ferramenta "${tool.name}" foi adicionada na categoria ${tool.category}`,
      data: {
        tool_id: toolId,
        tool_name: tool.name,
        tool_category: tool.category,
        action_url: `/tools/${toolId}`
      }
    }));

    await supabase
      .from('notifications')
      .insert(notifications);

    console.log(`Notificações de nova ferramenta criadas para ${users.length} usuários`);
  } catch (error) {
    console.error('Erro ao criar notificações de nova ferramenta:', error);
  }
};

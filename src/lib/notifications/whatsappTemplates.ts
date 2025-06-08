
export interface WhatsAppTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

export const whatsappTemplates: Record<string, WhatsAppTemplate> = {
  solution_completed: {
    id: 'solution_completed',
    name: 'Solução Concluída',
    template: 'Parabéns {{1}}! 🎉 Você concluiu a solução "{{2}}". Agora você pode gerar seu certificado em: {{3}}',
    variables: ['nome', 'titulo_solucao', 'link_certificado']
  },
  
  new_event: {
    id: 'new_event',
    name: 'Novo Evento',
    template: 'Olá {{1}}! 📅 Novo evento disponível: "{{2}}" agendado para {{3}}. Veja mais detalhes em: {{4}}',
    variables: ['nome', 'titulo_evento', 'data_evento', 'link_evento']
  },
  
  admin_communication_urgent: {
    id: 'admin_communication_urgent',
    name: 'Comunicado Urgente',
    template: '🚨 URGENTE - {{1}}: {{2}}. Acesse a plataforma para mais detalhes: {{3}}',
    variables: ['titulo', 'mensagem', 'link_plataforma']
  },
  
  forum_reply: {
    id: 'forum_reply',
    name: 'Resposta no Fórum',
    template: 'Oi {{1}}! 💬 {{2}} respondeu ao seu tópico "{{3}}" no fórum. Veja em: {{4}}',
    variables: ['nome', 'nome_usuario_resposta', 'titulo_topico', 'link_topico']
  },
  
  new_tool: {
    id: 'new_tool',
    name: 'Nova Ferramenta',
    template: 'Olá {{1}}! 🛠️ Nova ferramenta disponível: "{{2}}" na categoria {{3}}. Confira em: {{4}}',
    variables: ['nome', 'nome_ferramenta', 'categoria', 'link_ferramenta']
  }
};

export const formatWhatsAppMessage = (templateId: string, variables: Record<string, string>): string => {
  const template = whatsappTemplates[templateId];
  if (!template) {
    throw new Error(`Template WhatsApp não encontrado: ${templateId}`);
  }

  let message = template.template;
  
  // Substituir variáveis no formato {{1}}, {{2}}, etc.
  template.variables.forEach((variableName, index) => {
    const placeholder = `{{${index + 1}}}`;
    const value = variables[variableName] || '';
    message = message.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });

  return message;
};


import { OnboardingData } from '../types/onboardingTypes';

export const generateAIMessage = (
  step: number, 
  data: OnboardingData, 
  memberType: 'club' | 'formacao'
): string => {
  const firstName = data.name?.split(' ')[0] || 'amigo';
  
  if (memberType === 'formacao') {
    return generateFormacaoAIMessage(step, data, firstName);
  } else {
    return generateClubAIMessage(step, data, firstName);
  }
};

const generateFormacaoAIMessage = (step: number, data: OnboardingData, firstName: string): string => {
  switch (step) {
    case 1:
      let message1 = `Oi ${firstName}! 🎉 Que alegria ter você aqui na nossa Formação Viver de IA! `;
      
      if (data.city && data.state) {
        message1 += `Legal saber que você é de ${data.city}/${data.state}! `;
      }
      
      if (data.curiosity) {
        message1 += `Adorei saber que ${data.curiosity.toLowerCase()}! Isso mostra que você tem uma personalidade única. `;
      }
      
      message1 += `Nossa formação foi criada especialmente para pessoas como você que querem dominar a Inteligência Artificial de verdade. Aqui você vai encontrar aulas práticas, projetos reais e uma comunidade incrível de pessoas transformando suas carreiras com IA! 🚀`;
      
      return message1;

    case 2:
      let message2 = `Perfeito, ${firstName}! `;
      
      if (data.businessSector) {
        message2 += `O setor de ${data.businessSector.toLowerCase()} está sendo REVOLUCIONADO pela IA! `;
      }
      
      if (data.position) {
        message2 += `E na sua posição de ${data.position.toLowerCase()}, `;
      }
      
      if (data.areaToImpact) {
        message2 += `implementar IA na área de ${data.areaToImpact.toLowerCase()} pode gerar resultados incríveis! `;
      }
      
      message2 += `Nossa formação tem casos de sucesso específicos do seu segmento. Você vai aprender não só a teoria, mas como aplicar IA na prática no seu dia a dia profissional. Isso é transformação de carreira acontecendo! 💼✨`;
      
      return message2;

    case 3:
      let message3 = `Entendi seu perfil, ${firstName}! `;
      
      if (data.hasImplementedAI === 'yes') {
        message3 += `Que bom que você já tem experiência com IA! `;
        if (data.aiToolsUsed && data.aiToolsUsed.length > 0) {
          message3 += `Vejo que já usa ${data.aiToolsUsed.join(', ')}. `;
        }
        message3 += `Nossa formação vai levar seu conhecimento para o próximo nível com técnicas avançadas! `;
      } else if (data.hasImplementedAI === 'tried-failed') {
        message3 += `Sei que tentou implementar IA antes e não deu certo... Isso é mais comum do que imagina! Nossa formação foi criada justamente para resolver esses problemas. Você vai aprender o passo a passo correto! `;
      } else {
        message3 += `Perfeito para começar do zero! Nossa formação é estruturada para iniciantes chegarem ao nível avançado. `;
      }
      
      if (data.aiKnowledgeLevel) {
        const levelText = {
          'beginner': 'iniciante',
          'intermediate': 'intermediário', 
          'advanced': 'avançado',
          'expert': 'especialista'
        }[data.aiKnowledgeLevel];
        message3 += `Com seu nível ${levelText}, temos um caminho personalizado para você! `;
      }
      
      message3 += `Prepare-se para se tornar um verdadeiro especialista em IA! 🤖🎯`;
      
      return message3;

    case 4:
      let message4 = `Agora estou entendendo seus objetivos, ${firstName}! `;
      
      if (data.mainObjective) {
        const objectiveText = {
          'reduce-costs': 'reduzir custos',
          'increase-sales': 'aumentar vendas', 
          'automate-processes': 'automatizar processos',
          'innovate-products': 'inovar produtos'
        }[data.mainObjective] || data.mainObjective;
        
        message4 += `Seu foco em ${objectiveText} é estratégico! `;
      }
      
      if (data.expectedResult90Days) {
        message4 += `E esperar ${data.expectedResult90Days.toLowerCase()} em 90 dias é totalmente viável! `;
      }
      
      if (data.aiImplementationBudget) {
        message4 += `Com o orçamento que você tem disponível, vamos criar um plano de implementação perfeito para sua realidade. `;
      }
      
      message4 += `Nossa formação inclui mentoria personalizada e acompanhamento dos seus projetos. Você não vai estar sozinho nessa jornada! Vamos transformar seus objetivos em resultados concretos! 🎯💰`;
      
      return message4;

    case 5:
      let message5 = `Última etapa, ${firstName}! `;
      
      if (data.weeklyLearningTime) {
        message5 += `Com ${data.weeklyLearningTime} por semana, você vai conseguir acompanhar perfeitamente nossa formação! `;
      }
      
      if (data.contentPreference) {
        const preferenceText = data.contentPreference === 'theoretical' ? 'teórico' : 'hands-on';
        message5 += `Adorei saber que prefere conteúdo ${preferenceText}! Nossa metodologia equilibra teoria e prática perfeitamente. `;
      }
      
      if (data.wantsNetworking === 'yes') {
        message5 += `E que bom que quer fazer networking! Nossa comunidade de alunos é incrível - você vai conhecer pessoas incríveis que estão na mesma jornada! `;
      }
      
      if (data.bestDays && data.bestDays.length > 0) {
        message5 += `Anotei seus dias preferidos para os encontros ao vivo: ${data.bestDays.join(', ')}. `;
      }
      
      message5 += `Estou MUITO animado para sua jornada! Você está prestes a entrar numa comunidade exclusiva de pessoas que estão transformando suas carreiras com IA! 🚀🎉`;
      
      return message5;

    default:
      return `Olá ${firstName}! Bem-vindo à Formação Viver de IA! 🚀`;
  }
};

const generateClubAIMessage = (step: number, data: OnboardingData, firstName: string): string => {
  switch (step) {
    case 1:
      let message1 = `Oi ${firstName}! 🎉 Que alegria ter você aqui no VIVER DE IA Club! `;
      
      if (data.city && data.state) {
        message1 += `Legal saber que você é de ${data.city}/${data.state}! `;
      }
      
      if (data.curiosity) {
        message1 += `Adorei saber que ${data.curiosity.toLowerCase()}! Isso mostra que você tem uma personalidade única e isso vai ser um diferencial na sua jornada com IA! `;
      }
      
      message1 += `Você está entrando num clube EXCLUSIVO de empresários visionários que estão transformando seus negócios com Inteligência Artificial. Prepare-se para uma experiência incrível! 🚀`;
      
      return message1;

    case 2:
      let message2 = `Perfeito, ${firstName}! `;
      
      if (data.companyName) {
        message2 += `A ${data.companyName} `;
      } else {
        message2 += `Sua empresa `;
      }
      
      if (data.businessSector) {
        message2 += `no setor de ${data.businessSector.toLowerCase()} tem um potencial GIGANTESCO para implementar IA! `;
      }
      
      if (data.companySize) {
        message2 += `Com o porte da sua empresa, as possibilidades são infinitas! `;
      }
      
      message2 += `Nosso clube foi criado especialmente para empresários como você que querem sair na frente da concorrência usando IA estrategicamente! 💼✨`;
      
      return message2;

    case 3:
      let message3 = `Entendi seu perfil, ${firstName}! `;
      
      if (data.hasImplementedAI === 'yes') {
        message3 += `Que bom que você já tem experiência com IA! `;
        if (data.aiToolsUsed && data.aiToolsUsed.length > 0) {
          message3 += `Vejo que já usa ${data.aiToolsUsed.join(', ')}. `;
        }
        message3 += `No nosso clube, você vai descobrir ferramentas ainda mais poderosas e estratégias que vão multiplicar seus resultados! `;
      } else if (data.hasImplementedAI === 'tried-failed') {
        message3 += `Sei que tentou implementar IA antes e não rolou... Relaxa, isso acontece MUITO! No clube, você vai aprender exatamente como fazer dar certo! `;
      } else {
        message3 += `Começar do zero é uma vantagem! Você vai aprender do jeito certo desde o início! `;
      }
      
      message3 += `Prepare-se para se tornar referência em IA no seu mercado! 🤖🎯`;
      
      return message3;

    case 4:
      let message4 = `Agora estou entendendo seus objetivos, ${firstName}! `;
      
      if (data.mainObjective) {
        const objectiveText = {
          'reduce-costs': 'reduzir custos',
          'increase-sales': 'aumentar vendas', 
          'automate-processes': 'automatizar processos',
          'innovate-products': 'inovar produtos'
        }[data.mainObjective] || data.mainObjective;
        
        message4 += `Seu foco em ${objectiveText} é ESTRATÉGICO! `;
      }
      
      if (data.expectedResult90Days) {
        message4 += `E esperar ${data.expectedResult90Days.toLowerCase()} em 90 dias é totalmente viável com as soluções certas! `;
      }
      
      message4 += `No clube, você vai ter acesso a soluções práticas e cases reais que vão acelerar seus resultados! 🎯💰`;
      
      return message4;

    case 5:
      let message5 = `Última etapa, ${firstName}! `;
      
      if (data.weeklyLearningTime) {
        message5 += `Com ${data.weeklyLearningTime} por semana, você vai conseguir implementar tudo que aprender! `;
      }
      
      if (data.wantsNetworking === 'yes') {
        message5 += `E que bom que quer fazer networking! Nosso clube conecta empresários incríveis - você vai fazer parcerias que podem mudar sua vida! `;
      }
      
      message5 += `Você está prestes a entrar num clube EXCLUSIVO de empresários que estão na vanguarda da IA! Prepare-se para uma transformação épica! 🚀🎉`;
      
      return message5;

    default:
      return `Olá ${firstName}! Bem-vindo ao VIVER DE IA Club! 🚀`;
  }
};

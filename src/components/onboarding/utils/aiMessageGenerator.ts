import { OnboardingData } from '../types/onboardingTypes';

export const generatePersonalizedAIMessage = (stepNumber: number, data: OnboardingData): string => {
  switch (stepNumber) {
    case 1:
      let personalMessage = `Olá, ${data.name}! `;
      if (data.city && data.state) {
        personalMessage += `Que bom ter você de ${data.city}/${data.state}! `;
      }
      if (data.curiosity) {
        personalMessage += `Adorei saber que ${data.curiosity}. `;
      }
      personalMessage += "Vamos para a próxima etapa!";
      return personalMessage;

    case 2:
      let businessMessage = `Entendi, ${data.name}! `;
      if (data.companyName) {
        businessMessage += `Sua empresa é a ${data.companyName}, do setor de ${data.businessSector}. `;
      }
      if (data.position) {
        businessMessage += `Vejo que você atua como ${data.position}. `;
      }
      businessMessage += "Vamos agora descobrir seu nível de maturidade em IA.";
      return businessMessage;

    case 3:
      let aiMessage = `Ok, ${data.name}! `;
      if (data.hasImplementedAI === 'yes') {
        aiMessage += "Que bom que você já implementou IA! ";
      } else {
        aiMessage += "Entendi que você ainda não implementou IA. ";
      }
      if (data.aiKnowledgeLevel) {
        aiMessage += `Seu nível de conhecimento é ${data.aiKnowledgeLevel}. `;
      }
      aiMessage += "Vamos agora entender seus objetivos.";
      return aiMessage;

    case 4:
      let objectivesMessage = `Certo, ${data.name}! `;
      if (data.mainObjective) {
        objectivesMessage += `Seu objetivo principal é ${data.mainObjective}. `;
      }
      if (data.areaToImpact) {
        objectivesMessage += `E você quer impactar a área de ${data.areaToImpact}. `;
      }
      objectivesMessage += "Vamos agora personalizar sua experiência de aprendizado.";
      return objectivesMessage;

    case 5:
      let preferencesMessage = `Perfeito, ${data.name}! `;
      
      if (data.weeklyLearningTime) {
        if (data.weeklyLearningTime.includes('1-2')) {
          preferencesMessage += "Vejo que você tem 1-2 horas semanais disponíveis. Vou preparar conteúdos concisos e práticos para maximizar seu aprendizado nesse tempo. ";
        } else if (data.weeklyLearningTime.includes('3-5')) {
          preferencesMessage += "Com 3-5 horas semanais, você terá tempo suficiente para se aprofundar nas implementações de IA. ";
        } else if (data.weeklyLearningTime.includes('6-10')) {
          preferencesMessage += "Com 6-10 horas semanais, você poderá fazer um progresso significativo em IA! ";
        } else {
          preferencesMessage += "Com mais de 10 horas semanais, você está pronto para se tornar um expert em IA rapidamente! ";
        }
      }

      if (data.contentPreference && data.contentPreference.length > 0) {
        if (data.contentPreference.includes('theoretical')) {
          preferencesMessage += "Vou incluir mais fundamentação teórica nos seus materiais. ";
        }
        if (data.contentPreference.includes('hands-on')) {
          preferencesMessage += "Foco em conteúdo prático - você aprende fazendo! ";
        }
        if (data.contentPreference.includes('videos')) {
          preferencesMessage += "Vídeos serão priorizados no seu plano de estudos. ";
        }
        if (data.contentPreference.includes('texts')) {
          preferencesMessage += "Artigos e textos detalhados farão parte da sua jornada. ";
        }
        if (data.contentPreference.includes('interactive')) {
          preferencesMessage += "Conteúdos interativos serão essenciais no seu aprendizado. ";
        }
      }

      if (data.wantsNetworking === 'yes') {
        preferencesMessage += "E que ótimo que você quer fazer networking - vou conectar você com outros membros que têm objetivos similares! ";
      }

      if (data.bestDays && data.bestDays.length > 0) {
        preferencesMessage += `Agendei suas atividades preferencialmente para ${data.bestDays.join(', ')}. `;
      }

      if (data.bestPeriods && data.bestPeriods.length > 0) {
        preferencesMessage += `E no período da ${data.bestPeriods.join(' e ')}. `;
      }

      if (data.acceptsCaseStudy === 'yes') {
        preferencesMessage += "Adorei saber que você toparia ser um case de sucesso - isso vai inspirar outros membros! ";
      }

      preferencesMessage += "Agora vamos finalizar seu perfil e começar sua jornada personalizada!";
      
      return preferencesMessage;

    default:
      return `Obrigado pelas informações, ${data.name}! Estou processando seus dados para criar a melhor experiência possível.`;
  }
};

export const generateFinalAIMessage = (data: OnboardingData): string => {
  let finalMessage = `Parabéns, ${data.name}! Seu perfil está completo e sua jornada personalizada está prestes a começar. `;

  if (data.mainObjective) {
    finalMessage += `Com foco em ${data.mainObjective}, você está no caminho certo para transformar sua empresa. `;
  }

  if (data.contentPreference && data.contentPreference.length > 0) {
    finalMessage += `Preparei materiais ${data.contentPreference.join(', ')} para você. `;
  }

  finalMessage += "Estou aqui para te guiar em cada passo. Vamos juntos!";
  return finalMessage;
};

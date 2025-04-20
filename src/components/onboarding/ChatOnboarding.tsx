
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useOnboardingChat } from '@/hooks/onboarding/useOnboardingChat';
import { useProgress } from '@/hooks/onboarding/useProgress';

// Cor azul principal do VIVER DE IA Club
const MILAGRINHO_BG = "#0ABAB5";

export const ChatOnboarding = () => {
  const { progress } = useProgress();
  const { messages, sendMessage, isLoading } = useOnboardingChat('personal_info');
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [fullText, setFullText] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Mensagem inicial do Milagrinho, gerada localmente para não duplicar o envio para backend
  const nome = progress?.personal_info?.name || '';
  const initialMessage = `E aí${nome ? ` ${nome}` : ""}! Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível de pessoas transformando negócios com IA.`;

  useEffect(() => {
    if (!hasInitialized && messages.length === 0) {
      // Insere a mensagem inicial diretamente no estado local para evitar envio duplicado
      // A mensagem inicial estará no chat, sem duplicar no backend e sem enviar mensagem para o servidor
      // Como não temos um setter do state messages, podemos simular essa mensagem "assistente" adicionando um item localmente para renderizar só.
      setHasInitialized(true);
      // Injetamos essa mensagem virtualmente via setState do hook ou você pode usar uma abordagem interna local:
      // Como o hook não expõe setMessages, precisamos renderizar essa mensagem na UI separadamente:
    }
  }, [hasInitialized, messages.length]);

  // Separar as mensagens da API dos locais - para inicial inicial, combinar o initialMessage
  // Concatenar a mensagem inicial com as mensagens existentes para renderizar sem duplicar
  const renderedMessages = hasInitialized ? [
    { role: 'assistant', content: initialMessage },
    ...messages,
  ] : messages;

  useEffect(() => {
    // Animar digitação só na última mensagem do assistant em mensagens api (excluindo a inicial)
    const apiAssistantMessages = messages.filter(m => m.role === 'assistant');
    if (apiAssistantMessages.length > 0) {
      const lastMessage = apiAssistantMessages[apiAssistantMessages.length - 1].content;
      setFullText(lastMessage);
      setDisplayedText('');
      setTyping(true);
    } else if (hasInitialized && messages.length === 0) {
      // Caso chat vazio mas inicial já setada, anima a mensagem inicial local
      setFullText(initialMessage);
      setDisplayedText('');
      setTyping(true);
    }
  }, [messages, hasInitialized, initialMessage]);

  useEffect(() => {
    if (typing && displayedText.length < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(fullText.substring(0, displayedText.length + 1));
      }, 25);
      return () => clearTimeout(timer);
    } else if (typing && displayedText.length === fullText.length) {
      setTyping(false);
    }
  }, [typing, displayedText, fullText]);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 mb-6">
      {renderedMessages.map((message, index) => (
        <div key={index} className="flex items-start gap-3 mb-4 last:mb-0">
          <div className="flex-shrink-0">
            {/* Avatar fixo azul Milagrinho para assistant, sempre igual */}
            {message.role === 'assistant' ? (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: MILAGRINHO_BG }}
              >
                <User className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
          <div className={`flex-1 text-sm ${message.role === 'assistant' ? 'text-gray-700' : 'text-gray-600'}`}>
            {message.role === 'assistant' && index === renderedMessages.length - 1 && typing
              ? displayedText
              : message.content}
            {isLoading && index === renderedMessages.length - 1 && message.role === 'user' && (
              <span className="ml-2 animate-pulse">...</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

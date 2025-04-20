
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { useOnboardingChat } from '@/hooks/onboarding/useOnboardingChat';
import { useProgress } from '@/hooks/onboarding/useProgress';
import { useAuth } from '@/contexts/auth';
import { MilagrinhoMessage } from './MilagrinhoMessage';

// Cor azul principal do VIVER DE IA Club
const MILAGRINHO_BG = "#0ABAB5";

export const ChatOnboarding = () => {
  const { progress } = useProgress();
  const { user, profile } = useAuth();
  const { messages, sendMessage, isLoading } = useOnboardingChat('personal_info');
  const [typing, setTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [fullText, setFullText] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Obter o nome completo do usuário
  const userName = profile?.name || user?.user_metadata?.name || progress?.personal_info?.name || '';
  
  // Mensagem inicial Milagrinho - local, nunca duplica no backend
  const initialMessage = `Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível de pessoas transformando negócios com IA.`;

  // Só adiciona a mensagem inicial localmente para não duplicar na lista real do chat
  useEffect(() => {
    if (!hasInitialized && messages.length === 0) {
      setHasInitialized(true);
      // Inicializa com a mensagem padrão, sem mandar para o backend
      setFullText(initialMessage);
      setDisplayedText('');
      setTyping(true);
    }
  }, [hasInitialized, messages.length, initialMessage]);

  // Controla a digitação para todas as mensagens do assistant
  useEffect(() => {
    // Se existe uma nova mensagem do assistant que não estamos digitando ainda
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && !typing) {
      const lastMsg = messages[messages.length - 1].content;
      setFullText(lastMsg);
      setDisplayedText('');
      setTyping(true);
    }
  }, [messages, typing]);

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

  // Renderiza o chat: mensagem inicial + mensagens da conversa
  const renderMessages = () => {
    const allMessages = [];
    
    // Adiciona mensagem inicial se já inicializou
    if (hasInitialized) {
      allMessages.push({ role: 'assistant', content: initialMessage, isInitialMessage: true });
    }
    
    // Adiciona mensagens da conversa
    messages.forEach(msg => allMessages.push({...msg, isInitialMessage: false}));
    
    return allMessages.map((message, index) => (
      <div key={index} className="flex items-start gap-3 mb-4 last:mb-0">
        <div className="flex-shrink-0">
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
          {message.role === 'assistant' && 
           ((message.isInitialMessage && typing) || 
            (!message.isInitialMessage && index === allMessages.length - 1 && typing))
            ? displayedText
            : message.content}
          {isLoading && index === allMessages.length - 1 && message.role === 'user' && (
            <span className="ml-2 animate-pulse">...</span>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 mb-6">
      <div className="space-y-4">
        {renderMessages()}
      </div>
    </div>
  );
};

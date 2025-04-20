
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
  const [alreadySentInitial, setAlreadySentInitial] = useState(false);

  // Só dispara a mensagem inicial se ainda não mandou
  useEffect(() => {
    if (
      messages.length === 0 &&
      !alreadySentInitial
    ) {
      const nome = progress?.personal_info?.name || '';
      const mensagem = `E aí${nome ? ` ${nome}` : ""}! Eu sou o Milagrinho, seu assistente de IA do VIVER DE IA Club. Vamos começar conhecendo um pouco sobre você. Estas informações vão me ajudar a personalizar sua experiência, onde você vai encontrar uma comunidade incrível de pessoas transformando negócios com IA.`;
      sendMessage(mensagem);
      setAlreadySentInitial(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress?.personal_info?.name, alreadySentInitial, messages.length]);

  useEffect(() => {
    // Animar digitação só na última mensagem do assistant
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    if (assistantMessages.length > 0) {
      const lastMessage = assistantMessages[assistantMessages.length - 1].content;
      setFullText(lastMessage);
      setDisplayedText('');
      setTyping(true);
    }
  }, [messages]);

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
      {messages.map((message, index) => (
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
            {message.role === 'assistant' && index === messages.length - 1 && typing
              ? displayedText
              : message.content}
            {isLoading && index === messages.length - 1 && message.role === 'user' && (
              <span className="ml-2 animate-pulse">...</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};


import { useEffect } from 'react';
import { User } from 'lucide-react';
import { useOnboardingChat } from '@/hooks/onboarding/useOnboardingChat';
import { useProgress } from '@/hooks/onboarding/useProgress';

export const ChatOnboarding = () => {
  const { progress } = useProgress();
  const { messages, sendMessage, isLoading } = useOnboardingChat('personal_info');

  useEffect(() => {
    if (messages.length === 0) {
      // Envia primeira mensagem quando o componente montar
      sendMessage("Olá!", {
        name: progress?.personal_info?.name,
        currentStep: progress?.current_step
      });
    }
  }, []);

  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 mb-6">
      {messages.map((message, index) => (
        <div key={index} className="flex items-start gap-3 mb-4 last:mb-0">
          <div className="flex-shrink-0">
            {message.role === 'assistant' ? (
              <div className="w-8 h-8 rounded-full bg-viverblue flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-500" />
              </div>
            )}
          </div>
          <div className={`flex-1 text-sm ${message.role === 'assistant' ? 'text-gray-700' : 'text-gray-600'}`}>
            {message.content}
            {isLoading && index === messages.length - 1 && message.role === 'user' && (
              <span className="ml-2 animate-pulse">...</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

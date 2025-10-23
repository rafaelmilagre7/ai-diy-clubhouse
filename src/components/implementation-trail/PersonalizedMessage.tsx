
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

interface PersonalizedMessageProps {
  message: string;
}

export const PersonalizedMessage = ({ message }: PersonalizedMessageProps) => {
  return (
    <Card className="relative overflow-hidden bg-card/80 backdrop-blur-xl border-2 border-aurora-primary/30 shadow-xl">
      <div className="absolute inset-0 bg-gradient-aurora-subtle opacity-20" />
      <CardContent className="relative p-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <img 
              src="/lovable-uploads/693dabd3-1072-42e6-b4d1-385f35dc5d5a.png" 
              alt="Nina" 
              className="w-16 h-16 rounded-full object-cover border-2 border-aurora-primary/40 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-gradient-aurora rounded-full shadow-md">
              <MessageCircle className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-foreground font-semibold text-lg">
                Mensagem da Nina
              </h3>
              <div className="px-2 py-0.5 bg-aurora-primary/20 rounded-full">
                <span className="text-xs font-medium text-aurora-primary">IA Personalizada</span>
              </div>
            </div>
            <div className="text-foreground leading-relaxed space-y-3">
              {message.split('. ').map((sentence, index, array) => {
                if (index === array.length - 1 && sentence.trim() === '') return null;
                const cleanSentence = sentence.trim();
                if (!cleanSentence) return null;
                return (
                  <p key={index} className="text-sm">
                    {cleanSentence}{index < array.length - 1 && !cleanSentence.endsWith('.') ? '.' : ''}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

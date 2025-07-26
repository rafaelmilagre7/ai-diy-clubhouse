
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles } from 'lucide-react';

interface PersonalizedMessageProps {
  message: string;
}

export const PersonalizedMessage = ({ message }: PersonalizedMessageProps) => {
  return (
    <Card className="glass-dark border-2 bg-viverblue/5 border-viverblue/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-viverblue/20 rounded-full">
            <Brain className="h-6 w-6 text-viverblue" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-viverblue" />
              <h3 className="text-high-contrast font-semibold text-lg">
                Mensagem da IA
              </h3>
            </div>
            <div className="text-high-contrast leading-relaxed space-y-3">
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


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface PersonalizedMessageProps {
  message: string;
}

export const PersonalizedMessage = ({ message }: PersonalizedMessageProps) => {
  return (
    <Card className="glass-dark border-2 bg-viverblue/5 border-viverblue/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <img 
              src="/lovable-uploads/693dabd3-1072-42e6-b4d1-385f35dc5d5a.png" 
              alt="Nina" 
              className="w-16 h-16 rounded-full object-cover border-2 border-viverblue/30"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-viverblue" />
              <h3 className="text-high-contrast font-semibold text-lg">
                Mensagem da Nina
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

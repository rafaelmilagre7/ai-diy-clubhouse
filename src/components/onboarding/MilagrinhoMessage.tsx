
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface MilagrinhoMessageProps {
  message: string;
  title?: string;
}

export const MilagrinhoMessage: React.FC<MilagrinhoMessageProps> = ({
  message,
  title
}) => {
  return (
    <Card className="glassmorphism border-viverblue/20 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Milagrinho Avatar */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-viverblue to-blue-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Message Content */}
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-white mb-2">
                {title}
              </h3>
            )}
            <p className="text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

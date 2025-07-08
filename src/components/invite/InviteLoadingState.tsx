import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface InviteLoadingStateProps {
  message?: string;
}

const InviteLoadingState: React.FC<InviteLoadingStateProps> = ({ 
  message = "Validando seu convite..." 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-viverblue/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center space-y-6">
            {/* Logo/Icon */}
            <div className="relative">
              <div className="w-16 h-16 bg-viverblue/10 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
                <Sparkles className="h-8 w-8 text-viverblue" />
              </div>
              <div className="absolute inset-0 w-16 h-16 border-2 border-viverblue/20 rounded-full mx-auto animate-spin" 
                   style={{ animationDuration: '3s' }}>
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-viverblue rounded-full transform -translate-x-1/2 -translate-y-1"></div>
              </div>
            </div>

            {/* Loading Spinner */}
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-viverblue" />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-semibold text-foreground">
                {message}
              </h3>
              <p className="text-muted-foreground">
                Aguarde enquanto verificamos suas credenciais
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-viverblue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-viverblue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-viverblue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteLoadingState;
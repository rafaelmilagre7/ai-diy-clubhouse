import { CheckCircle, Loader2, Mail, Send, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type InviteStep = 'form' | 'creating' | 'sending' | 'success' | 'error';

interface ChannelStatus {
  email?: 'pending' | 'sending' | 'success' | 'error';
  whatsapp?: 'pending' | 'sending' | 'success' | 'error';
}

interface StepInfo {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const steps: Record<InviteStep, StepInfo> = {
  form: {
    label: 'Formulário',
    icon: Mail,
    description: 'Preencher dados do convite'
  },
  creating: {
    label: 'Criando',
    icon: Loader2,
    description: 'Validando dados e criando convite...'
  },
  sending: {
    label: 'Enviando',
    icon: Send,
    description: 'Enviando notificação por email...'
  },
  success: {
    label: 'Concluído',
    icon: CheckCircle,
    description: 'Convite enviado com sucesso!'
  },
  error: {
    label: 'Erro',
    icon: AlertCircle,
    description: 'Ocorreu um erro no processo'
  }
};

interface InviteProgressStepsProps {
  currentStep: InviteStep;
  className?: string;
  channelStatus?: ChannelStatus;
  estimatedTime?: number;
}

export const InviteProgressSteps: React.FC<InviteProgressStepsProps> = ({ 
  currentStep, 
  className,
  channelStatus,
  estimatedTime = 6
}) => {
  const stepOrder: InviteStep[] = ['form', 'creating', 'sending', 'success'];
  const currentIndex = stepOrder.indexOf(currentStep);
  
  if (currentStep === 'form') return null; // Não mostrar durante preenchimento do form

  return (
    <div className={cn("py-4 px-6 bg-muted/50 rounded-lg", className)}>
      <div className="flex items-center justify-between">
        {stepOrder.slice(1).map((step, index) => {
          const stepInfo = steps[step];
          const Icon = stepInfo.icon;
          const stepIndex = index + 1;
          const isActive = step === currentStep;
          const isCompleted = currentIndex > stepIndex;
          const isError = currentStep === 'error';
          
          return (
            <div 
              key={step}
              className={cn(
                "flex flex-col items-center gap-2 flex-1",
                isActive && "text-primary",
                isCompleted && "text-green-600",
                isError && step === 'error' && "text-destructive"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors",
                isActive && "border-primary bg-primary/10",
                isCompleted && "border-green-600 bg-green-600/10",
                !isActive && !isCompleted && "border-muted-foreground/30"
              )}>
                <Icon 
                  className={cn(
                    "h-4 w-4",
                    isActive && step === 'creating' && "animate-spin",
                    isCompleted && "text-green-600",
                    isActive && "text-primary"
                  )} 
                />
              </div>
              <div className="text-center">
                <div className={cn(
                  "text-sm font-medium",
                  isActive && "text-primary",
                  isCompleted && "text-green-600"
                )}>
                  {stepInfo.label}
                </div>
                {isActive && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {stepInfo.description}
                  </div>
                )}
              </div>
              
              {/* Linha conectora */}
              {index < stepOrder.slice(1).length - 1 && (
                <div className={cn(
                  "absolute h-0.5 bg-muted-foreground/20 top-4 w-full left-1/2 transform -translate-x-1/2",
                  "hidden sm:block"
                )} 
                style={{
                  left: `${((index + 1) / stepOrder.slice(1).length) * 100}%`,
                  width: `${100 / stepOrder.slice(1).length}%`
                }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mostrar erro se houver */}
      {currentStep === 'error' && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {steps.error.description}
            </span>
          </div>
        </div>
      )}
      
      {/* Status dos canais quando enviando */}
      {currentStep === 'sending' && channelStatus && (
        <div className="mt-4 p-3 bg-muted/30 rounded-md">
          <div className="text-xs font-medium text-muted-foreground mb-2">Status dos envios:</div>
          <div className="flex gap-4">
            {channelStatus.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3" />
                <span className="text-xs">Email:</span>
                <span className={cn(
                  "text-xs font-medium",
                  channelStatus.email === 'success' && "text-green-600",
                  channelStatus.email === 'error' && "text-destructive",
                  channelStatus.email === 'sending' && "text-primary"
                )}>
                  {channelStatus.email === 'success' ? '✅' : 
                   channelStatus.email === 'error' ? '❌' : '⏳'}
                </span>
              </div>
            )}
            {channelStatus.whatsapp && (
              <div className="flex items-center gap-2">
                <Send className="h-3 w-3" />
                <span className="text-xs">WhatsApp:</span>
                <span className={cn(
                  "text-xs font-medium",
                  channelStatus.whatsapp === 'success' && "text-green-600",
                  channelStatus.whatsapp === 'error' && "text-destructive",
                  channelStatus.whatsapp === 'sending' && "text-primary"
                )}>
                  {channelStatus.whatsapp === 'success' ? '✅' : 
                   channelStatus.whatsapp === 'error' ? '❌' : '⏳'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tempo estimado otimizado */}
      {(currentStep === 'creating' || currentStep === 'sending') && (
        <div className="mt-3 text-center">
          <div className="text-xs text-muted-foreground">
            Tempo estimado: ~{estimatedTime} segundos
          </div>
        </div>
      )}
    </div>
  );
};
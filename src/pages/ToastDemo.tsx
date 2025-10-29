import { useToastModern } from '@/hooks/useToastModern';
import { 
  showModernSuccess, 
  showModernError, 
  showModernWarning, 
  showModernInfo,
  showModernLoading,
  showModernSuccessWithAction,
  showModernErrorWithRetry,
  dismissModernToast,
  toastPatternCreate,
  toastPatternUpdate,
  toastPatternDelete,
} from '@/lib/toast-helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Variant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'loading';
type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export default function ToastDemo() {
  const toast = useToastModern();

  const showBasicToast = (variant: Variant) => {
    const messages = {
      default: { title: 'Notificação Padrão', message: 'Esta é uma notificação padrão do sistema.' },
      success: { title: 'Operação Bem-Sucedida', message: 'Sua ação foi completada com sucesso!' },
      error: { title: 'Erro Detectado', message: 'Não foi possível completar a operação.' },
      warning: { title: 'Atenção Necessária', message: 'Verifique os campos obrigatórios antes de continuar.' },
      info: { title: 'Informação', message: 'Use atalhos de teclado para navegar mais rápido.' },
      loading: { title: 'Processando', message: 'Aguarde enquanto processamos sua solicitação...' },
    };

    const { title, message } = messages[variant];

    switch (variant) {
      case 'success':
        toast.showSuccess(title, message);
        break;
      case 'error':
        toast.showError(title, message);
        break;
      case 'warning':
        toast.showWarning(title, message);
        break;
      case 'info':
        toast.showInfo(title, message);
        break;
      case 'loading':
        const loadingId = toast.showLoading(title, message);
        // Auto dismiss após 3s para demo
        setTimeout(() => toast.dismissToast(loadingId), 3000);
        break;
      default:
        toast.showToast({ title, message, variant: 'default' });
    }
  };

  const showPositionedToast = (position: Position) => {
    toast.showSuccess(
      'Posição Customizada',
      `Toast exibido na posição: ${position}`,
      { position, duration: 3000 }
    );
  };

  const simulateEventCreation = async () => {
    const loadingId = toast.showLoading(
      'Criando evento...',
      'Configurando mentoria na plataforma'
    );

    // Simular operação assíncrona
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast.dismissToast(loadingId);

    toast.showSuccessWithAction(
      'Evento criado!',
      'Mentoria agendada para 15 de Janeiro, 2025 às 14h',
      {
        label: 'Ver Evento',
        onClick: () => {
          console.log('Navegando para evento...');
          toast.showInfo('Navegação', 'Redirecionando para página do evento...');
        },
      }
    );
  };

  const simulateErrorWithRetry = () => {
    toast.showErrorWithRetry(
      'Falha na Conexão',
      'Não foi possível conectar ao servidor. Verifique sua conexão.',
      () => {
        console.log('Tentando novamente...');
        toast.showInfo('Reconectando', 'Tentando estabelecer conexão novamente...');
      }
    );
  };

  const demonstrateCRUDPattern = async () => {
    // CREATE
    const createId = toastPatternCreate.loading('evento');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.dismissToast(createId);
    
    toastPatternCreate.success('Evento', {
      label: 'Ver',
      onClick: () => console.log('Ver evento'),
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // UPDATE
    const updateId = toastPatternUpdate.loading('evento');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.dismissToast(updateId);
    toastPatternUpdate.success('Evento');

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // DELETE
    const deleteId = toastPatternDelete.loading('evento');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.dismissToast(deleteId);
    toastPatternDelete.success('Evento', () => {
      console.log('Desfazer exclusão');
      toast.showInfo('Desfeito', 'Evento restaurado com sucesso');
    });
  };

  const demonstrateHelperFunctions = () => {
    showModernSuccess('Helper Function', 'Usando função helper direta');
    
    setTimeout(() => {
      showModernWarning('Múltiplos Toasts', 'Sistema suporta até 3 toasts simultâneos');
    }, 500);

    setTimeout(() => {
      showModernInfo('Queue System', 'Toasts são organizados em fila automaticamente');
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-6xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Sistema de Toast Moderno</h1>
        <p className="text-muted-foreground text-lg">
          Feedback visual aprimorado com animações, ações inline e posicionamento estratégico
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Variantes Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Variantes de Toast</CardTitle>
            <CardDescription>
              Diferentes tipos para cada contexto de feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {['success', 'error', 'warning', 'info', 'loading'].map((variant) => (
              <Button
                key={variant}
                variant="outline"
                className="w-full"
                onClick={() => showBasicToast(variant as Variant)}
              >
                Toast de {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Posicionamento */}
        <Card>
          <CardHeader>
            <CardTitle>Posicionamento Estratégico</CardTitle>
            <CardDescription>
              6 posições diferentes para contextos específicos
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            {[
              'top-left',
              'top-center',
              'top-right',
              'bottom-left',
              'bottom-center',
              'bottom-right',
            ].map((position) => (
              <Button
                key={position}
                variant="outline"
                size="sm"
                onClick={() => showPositionedToast(position as Position)}
                className="text-xs"
              >
                {position.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Exemplos do Mundo Real */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Exemplos de Uso Real</CardTitle>
            <CardDescription>
              Padrões recomendados para operações comuns na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="default"
              onClick={simulateEventCreation}
              className="w-full"
            >
              📅 Criar Evento (com Ação)
            </Button>
            
            <Button
              variant="destructive"
              onClick={simulateErrorWithRetry}
              className="w-full"
            >
              ⚠️ Erro com Retry
            </Button>

            <Button
              variant="secondary"
              onClick={demonstrateCRUDPattern}
              className="w-full"
            >
              🔄 Padrão CRUD Completo
            </Button>

            <Button
              variant="outline"
              onClick={demonstrateHelperFunctions}
              className="w-full"
            >
              🎯 Funções Helper Diretas
            </Button>
          </CardContent>
        </Card>

        {/* Documentação de Uso */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Como Usar no Código</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 text-sm">1. Usando Hook (dentro de componentes):</h4>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
{`const toast = useToastModern();

toast.showSuccess("Salvo!", "Alterações aplicadas");
toast.showErrorWithRetry("Erro", "Falha", () => retry());`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-sm">2. Usando Helpers (em qualquer lugar):</h4>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
{`import { showModernSuccess, showModernLoading } from '@/lib/toast-helpers';

const id = showModernLoading("Salvando...", "Aguarde");
// ... operação ...
dismissModernToast(id);
showModernSuccess("Pronto!", "Salvo com sucesso");`}
              </pre>
            </div>

            <div>
              <h4 className="font-semibold mb-2 text-sm">3. Usando Padrões CRUD:</h4>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
{`import { toastPatternCreate } from '@/lib/toast-helpers';

const id = toastPatternCreate.loading("evento");
try {
  await createEvent();
  dismissModernToast(id);
  toastPatternCreate.success("Evento", { 
    label: "Ver", 
    onClick: () => navigate('/evento') 
  });
} catch (error) {
  dismissModernToast(id);
  toastPatternCreate.error("evento", () => retry());
}`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recursos do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Recursos Implementados</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 text-sm">
            <li>✅ 6 variantes de toast (success, error, warning, info, loading, default)</li>
            <li>✅ 6 posições estratégicas</li>
            <li>✅ Animações suaves com Framer Motion</li>
            <li>✅ Botões de ação inline</li>
            <li>✅ Loading states infinitos</li>
            <li>✅ Queue system (máx 3 simultâneos)</li>
            <li>✅ Helpers para uso direto</li>
            <li>✅ Padrões CRUD pré-definidos</li>
            <li>✅ Compatibilidade com sistema legado</li>
            <li>✅ Design system integrado</li>
            <li>✅ Auto-dismiss configurável</li>
            <li>✅ Ícones customizáveis</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

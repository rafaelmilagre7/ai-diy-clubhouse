import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToastModern } from "@/hooks/useToastModern";
import { 
  showModernSuccess, 
  showModernError, 
  showModernWarning, 
  showModernInfo,
  showModernLoading,
  dismissModernToast,
} from "@/lib/toast-helpers";
import { CodeBlock } from "./CodeBlock";

type ToastId = string | number;

export function NotificationsSection() {
  const toast = useToastModern();
  const [loadingId, setLoadingId] = useState<ToastId | null>(null);

  const handleBasicSuccess = () => {
    showModernSuccess(
      "Operação concluída",
      "Os dados foram salvos com sucesso"
    );
  };

  const handleBasicError = () => {
    showModernError(
      "Erro ao processar",
      "Não foi possível completar a operação. Tente novamente."
    );
  };

  const handleBasicWarning = () => {
    showModernWarning(
      "Atenção necessária",
      "Esta ação pode ter impacto em outros registros"
    );
  };

  const handleBasicInfo = () => {
    showModernInfo(
      "Informação importante",
      "O sistema será atualizado em breve"
    );
  };

  const handleLoadingState = () => {
    const id = showModernLoading("Processando dados", "Aguarde enquanto carregamos as informações");
    setLoadingId(id);
    
    setTimeout(() => {
      dismissModernToast(id);
      showModernSuccess("Processamento concluído", "Todos os dados foram carregados");
      setLoadingId(null);
    }, 3000);
  };

  const handleSuccessWithAction = () => {
    toast.showSuccessWithAction(
      "Evento criado",
      "O evento foi criado com sucesso",
      {
        label: "Ver eventos",
        onClick: () => console.log("Navegando para eventos...")
      }
    );
  };

  const handleErrorWithRetry = () => {
    toast.showErrorWithRetry(
      "Falha na conexão",
      "Não foi possível conectar ao servidor",
      () => console.log("Tentando novamente...")
    );
  };

  const handleCreatePattern = async () => {
    const loadingId = showModernLoading("Criando evento", "Aguarde enquanto salvamos");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      dismissModernToast(loadingId);
      
      toast.showSuccessWithAction(
        "Evento criado",
        "Evento salvo com sucesso",
        {
          label: "Ver eventos",
          onClick: () => console.log("Navegando...")
        }
      );
    } catch (error) {
      dismissModernToast(loadingId);
      showModernError("Erro ao criar", "Não foi possível criar o evento");
    }
  };

  const handleUpdatePattern = async () => {
    const loadingId = showModernLoading("Atualizando", "Salvando alterações");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      dismissModernToast(loadingId);
      showModernSuccess("Dados atualizados", "Alterações salvas com sucesso");
    } catch (error) {
      dismissModernToast(loadingId);
      showModernError("Erro ao atualizar", "Não foi possível atualizar");
    }
  };

  const handleDeletePattern = async () => {
    const loadingId = showModernLoading("Excluindo", "Removendo item");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      dismissModernToast(loadingId);
      
      toast.showSuccessWithAction(
        "Registro excluído",
        "Item removido com sucesso",
        {
          label: "Desfazer",
          onClick: () => console.log("Desfazendo...")
        }
      );
    } catch (error) {
      dismissModernToast(loadingId);
      showModernError("Erro ao excluir", "Não foi possível excluir");
    }
  };

  const handlePositionTopCenter = () => {
    toast.showInfo("Informação central", "Exibida no topo da tela", { position: "top-center" });
  };

  const handlePositionBottomRight = () => {
    toast.showSuccess("Sucesso", "Posição padrão - canto inferior direito", { position: "bottom-right" });
  };

  const handlePositionBottomLeft = () => {
    toast.showWarning("Aviso", "Exibido no canto inferior esquerdo", { position: "bottom-left" });
  };

  return (
    <div className="space-y-8">
      {/* Introdução */}
      <Card className="surface-elevated border-operational/20">
        <CardHeader>
          <CardTitle className="text-2xl">Sistema de Notificações</CardTitle>
          <CardDescription className="text-base">
            Sistema moderno de toasts com design profissional e feedback contextual.
            Use para comunicar resultados de operações, estados de loading e ações importantes.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Variantes Básicas */}
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>Variantes Básicas</CardTitle>
          <CardDescription>
            Tipos fundamentais de notificações para diferentes contextos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Button 
                onClick={handleBasicSuccess} 
                className="w-full bg-status-success hover:bg-status-success/90"
              >
                Sucesso
              </Button>
              <p className="text-xs text-muted-foreground">Operações completadas</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleBasicError} 
                variant="destructive"
                className="w-full"
              >
                Erro
              </Button>
              <p className="text-xs text-muted-foreground">Falhas e problemas</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleBasicWarning}
                className="w-full bg-status-warning hover:bg-status-warning/90 text-background"
              >
                Aviso
              </Button>
              <p className="text-xs text-muted-foreground">Atenção necessária</p>
            </div>
            
            <div className="space-y-2">
              <Button 
                onClick={handleBasicInfo}
                variant="outline"
                className="w-full"
              >
                Informação
              </Button>
              <p className="text-xs text-muted-foreground">Dados neutros</p>
            </div>
          </div>

          <CodeBlock
            code={`// Importar helpers globais
import { showModernSuccess, showModernError } from '@/lib/toast-helpers';

// Usar em qualquer lugar (sem hook necessário)
showModernSuccess("Operação concluída", "Dados salvos com sucesso");
showModernError("Erro ao processar", "Tente novamente mais tarde");
showModernWarning("Atenção", "Esta ação pode ter impactos");
showModernInfo("Sistema atualizado", "Nova versão disponível");`}
            title="Código - Variantes Básicas"
            language="typescript"
          />
        </CardContent>
      </Card>

      {/* Loading State */}
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>Estado de Carregamento</CardTitle>
          <CardDescription>
            Toast de loading com dismiss manual após conclusão
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4">
            <Button onClick={handleLoadingState} disabled={!!loadingId}>
              {loadingId ? "Processando..." : "Simular Loading"}
            </Button>
          </div>

          <CodeBlock
            code={`import { showModernLoading, dismissModernToast } from '@/lib/toast-helpers';

// Iniciar loading
const loadingId = showModernLoading("Processando dados...");

// Após conclusão, remover e mostrar sucesso
dismissModernToast(loadingId);
showModernSuccess("Processamento concluído", "Dados carregados");`}
            title="Código - Loading State"
            language="typescript"
          />
        </CardContent>
      </Card>

      {/* Toasts com Ações */}
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>Notificações com Ações</CardTitle>
          <CardDescription>
            Adicione botões de ação para navegação ou retry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Button onClick={handleSuccessWithAction} className="w-full">
                Sucesso com Ação
              </Button>
              <p className="text-xs text-muted-foreground">Redirecionar usuário após sucesso</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleErrorWithRetry} variant="destructive" className="w-full">
                Erro com Retry
              </Button>
              <p className="text-xs text-muted-foreground">Permitir nova tentativa</p>
            </div>
          </div>

          <CodeBlock
            code={`// Dentro de um componente React
import { useToastModern } from '@/hooks/useToastModern';

function MyComponent() {
  const toast = useToastModern();

  const handleCreate = () => {
    toast.showSuccessWithAction(
      "Evento criado",
      "O evento foi criado com sucesso",
      "Ver eventos",
      () => navigate('/eventos')
    );
  };

  const handleError = () => {
    toast.showErrorWithRetry(
      "Falha na conexão",
      "Não foi possível conectar ao servidor",
      () => retryOperation()
    );
  };
}`}
            title="Código - Toasts com Ações"
            language="typescript"
          />
        </CardContent>
      </Card>

      {/* Padrões CRUD */}
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>Padrões CRUD Completos</CardTitle>
          <CardDescription>
            Fluxos automatizados para Create, Update e Delete com loading e feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Button onClick={handleCreatePattern} className="w-full bg-operational hover:bg-operational/90">
                CREATE Pattern
              </Button>
              <p className="text-xs text-muted-foreground">Loading → Success → Navegação</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleUpdatePattern} className="w-full bg-operational hover:bg-operational/90">
                UPDATE Pattern
              </Button>
              <p className="text-xs text-muted-foreground">Loading → Success simples</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handleDeletePattern} variant="destructive" className="w-full">
                DELETE Pattern
              </Button>
              <p className="text-xs text-muted-foreground">Loading → Success → Undo</p>
            </div>
          </div>

          <CodeBlock
            code={`import { toastPatternCreate, toastPatternUpdate, toastPatternDelete } from '@/lib/toast-helpers';

// CREATE Pattern - Loading → Success → Navegação com ação
const handleCreate = async () => {
  const result = await toastPatternCreate(
    async () => {
      const response = await createEvent(data);
      return response;
    },
    "Evento criado com sucesso",
    "/eventos",           // URL de redirecionamento
    "Ver eventos"        // Texto do botão
  );
  
  if (result) {
    console.log("Criado:", result);
  }
};

// UPDATE Pattern - Loading → Success simples
const handleUpdate = async () => {
  await toastPatternUpdate(
    async () => await updateEvent(id, data),
    "Dados atualizados com sucesso"
  );
};

// DELETE Pattern - Loading → Success → Botão Desfazer
const handleDelete = async () => {
  await toastPatternDelete(
    async () => await deleteEvent(id),
    "Registro excluído com sucesso",
    () => undoDelete(id)  // Função de undo
  );
};`}
            title="Código - Padrões CRUD"
            language="typescript"
          />
        </CardContent>
      </Card>

      {/* Posicionamento */}
      <Card className="surface-elevated">
        <CardHeader>
          <CardTitle>Posicionamento Estratégico</CardTitle>
          <CardDescription>
            Escolha a posição adequada para cada contexto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Button onClick={handlePositionTopCenter} variant="outline" className="w-full">
                Top Center
              </Button>
              <p className="text-xs text-muted-foreground">Erros críticos, loading principal</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handlePositionBottomRight} variant="outline" className="w-full">
                Bottom Right (Padrão)
              </Button>
              <p className="text-xs text-muted-foreground">Sucessos, informações gerais</p>
            </div>
            
            <div className="space-y-2">
              <Button onClick={handlePositionBottomLeft} variant="outline" className="w-full">
                Bottom Left
              </Button>
              <p className="text-xs text-muted-foreground">Avisos secundários</p>
            </div>
          </div>

          <CodeBlock
            code={`// Posições disponíveis: 
// 'top-left' | 'top-center' | 'top-right' | 
// 'bottom-left' | 'bottom-right' | 'bottom-center'

// Usar hook para controlar posição
const toast = useToastModern();

toast.showError(
  "Erro crítico", 
  "Sistema indisponível",
  "top-center"  // Destaque para erros importantes
);

toast.showSuccess(
  "Salvo", 
  "Alterações aplicadas",
  "bottom-right"  // Posição padrão (opcional)
);`}
            title="Código - Posicionamento"
            language="typescript"
          />
        </CardContent>
      </Card>

      {/* Boas Práticas */}
      <Card className="surface-elevated border-operational/20">
        <CardHeader>
          <CardTitle>Boas Práticas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-status-success">Recomendado</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-status-success">✓</span>
                    <span>Use helpers globais quando possível</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-success">✓</span>
                    <span>Mensagens claras e objetivas</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-success">✓</span>
                    <span>Loading para operações longas (mais de 1s)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-success">✓</span>
                    <span>Ações relevantes em sucessos importantes</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-status-success">✓</span>
                    <span>Botão de retry em erros temporários</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-destructive">Evitar</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Mensagens técnicas para usuários</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Múltiplos toasts simultâneos</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Toast para cada micro-interação</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Duração muito curta (menos de 3s)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-destructive">✗</span>
                    <span>Esquecer de dismissar loading manualmente</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

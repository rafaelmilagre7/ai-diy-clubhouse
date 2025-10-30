import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

// ============================================
// LEGACY TOAST HELPERS (Manter compatibilidade)
// ============================================
export const showSuccessToast = (title: string, description?: string) => {
  toast.success(title, {
    description,
    duration: 4000,
    className: 'toast-aurora-success',
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast.error(title, {
    description,
    duration: 4000,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast.info(title, {
    description,
    duration: 4000,
    className: 'toast-aurora-info',
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast.warning(title, {
    description,
    duration: 4000,
    className: 'toast-aurora-warning',
  });
};

// ============================================
// MODERN TOAST HELPERS (Novo sistema)
// ============================================

/**
 * Sistema de toast moderno com feedback visual aprimorado
 * Use esses helpers para nova funcionalidade
 */

type ToastId = string | number;

interface ActionButton {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

interface ModernToastOptions {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  duration?: number;
  action?: ActionButton;
  highlightTitle?: boolean;
  onDismiss?: () => void;
}

// Placeholder para integração com useToastModern
// Será populado pelo ToastModernProvider
let modernToastInstance: any = null;

export const setModernToastInstance = (instance: any) => {
  modernToastInstance = instance;
};

/**
 * Toast de sucesso moderno
 * @example showModernSuccess("Salvo!", "Suas alterações foram salvas")
 */
export const showModernSuccess = (
  title: string,
  message: string,
  options?: ModernToastOptions
): ToastId => {
  if (!modernToastInstance) {
    console.warn('Modern toast not initialized, falling back to legacy');
    showSuccessToast(title, message);
    return '';
  }
  return modernToastInstance.showSuccess(title, message, options);
};

/**
 * Toast de erro moderno
 * @example showModernError("Erro", "Não foi possível salvar")
 */
export const showModernError = (
  title: string,
  message: string,
  options?: ModernToastOptions
): ToastId => {
  if (!modernToastInstance) {
    console.warn('Modern toast not initialized, falling back to legacy');
    showErrorToast(title, message);
    return '';
  }
  return modernToastInstance.showError(title, message, options);
};

/**
 * Toast de aviso moderno
 * @example showModernWarning("Atenção", "Verifique os campos obrigatórios")
 */
export const showModernWarning = (
  title: string,
  message: string,
  options?: ModernToastOptions
): ToastId => {
  if (!modernToastInstance) {
    console.warn('Modern toast not initialized, falling back to legacy');
    showWarningToast(title, message);
    return '';
  }
  return modernToastInstance.showWarning(title, message, options);
};

/**
 * Toast de informação moderno
 * @example showModernInfo("Dica", "Use atalhos para navegar mais rápido")
 */
export const showModernInfo = (
  title: string,
  message: string,
  options?: ModernToastOptions
): ToastId => {
  if (!modernToastInstance) {
    console.warn('Modern toast not initialized, falling back to legacy');
    showInfoToast(title, message);
    return '';
  }
  return modernToastInstance.showInfo(title, message, options);
};

/**
 * Toast de loading (sem auto-dismiss)
 * @example const id = showModernLoading("Salvando...", "Aguarde enquanto processamos"); dismissModernToast(id);
 */
export const showModernLoading = (
  title: string,
  message: string,
  options?: ModernToastOptions
): ToastId => {
  if (!modernToastInstance) {
    console.warn('Modern toast not initialized');
    return '';
  }
  return modernToastInstance.showLoading(title, message, options);
};

/**
 * Toast de sucesso com botão de ação
 * @example showModernSuccessWithAction("Criado!", "Evento criado", { label: "Ver", onClick: () => navigate(...) })
 */
export const showModernSuccessWithAction = (
  title: string,
  message: string,
  action: ActionButton,
  options?: Omit<ModernToastOptions, 'action'>
): ToastId => {
  if (!modernToastInstance) {
    console.warn('Modern toast not initialized, falling back to legacy');
    showSuccessToast(title, message);
    return '';
  }
  return modernToastInstance.showSuccessWithAction(title, message, action, options);
};

/**
 * Toast de erro com botão "Tentar novamente"
 * @example showModernErrorWithRetry("Falha", "Não foi possível enviar", () => handleRetry())
 */
export const showModernErrorWithRetry = (
  title: string,
  message: string,
  onRetry: () => void,
  options?: Omit<ModernToastOptions, 'action'>
): ToastId => {
  console.log('[DEBUG-TOAST] showModernErrorWithRetry chamado', {
    title,
    isInitialized: !!modernToastInstance,
    instance: modernToastInstance
  });
  
  if (!modernToastInstance) {
    console.warn('🚨 Modern toast not initialized, using sonner fallback');
    toast.error(title, {
      description: message,
      duration: 5000,
    });
    return '';
  }
  return modernToastInstance.showErrorWithRetry(title, message, onRetry, options);
};

/**
 * Dismiss toast específico
 * @example dismissModernToast(toastId)
 */
export const dismissModernToast = (toastId: ToastId): void => {
  if (!modernToastInstance) {
    console.warn('Modern toast not initialized');
    return;
  }
  modernToastInstance.dismissToast(toastId);
};

// ============================================
// PADRÕES DE USO RECOMENDADOS
// ============================================

/**
 * Padrão para operações CRUD - CREATE
 * @example
 * const toastId = showModernLoading("Criando...", "Salvando evento");
 * try {
 *   await createEvent(data);
 *   dismissModernToast(toastId);
 *   showModernSuccessWithAction("Criado!", "Evento salvo", { label: "Ver", onClick: () => navigate(...) });
 * } catch (error) {
 *   dismissModernToast(toastId);
 *   showModernErrorWithRetry("Erro", error.message, () => handleRetry());
 * }
 */
export const toastPatternCreate = {
  loading: (entity: string) => showModernLoading(`Criando ${entity}...`, 'Aguarde enquanto salvamos'),
  success: (entity: string, action?: ActionButton) => 
    action 
      ? showModernSuccessWithAction(`${entity} criado!`, 'Salvo com sucesso', action)
      : showModernSuccess(`${entity} criado!`, 'Salvo com sucesso'),
  error: (entity: string, onRetry?: () => void) =>
    onRetry
      ? showModernErrorWithRetry('Erro ao criar', `Não foi possível criar ${entity}`, onRetry)
      : showModernError('Erro ao criar', `Não foi possível criar ${entity}`),
};

/**
 * Padrão para operações CRUD - UPDATE
 */
export const toastPatternUpdate = {
  loading: (entity: string) => showModernLoading(`Atualizando ${entity}...`, 'Salvando alterações'),
  success: (entity: string) => showModernSuccess(`${entity} atualizado!`, 'Alterações salvas com sucesso'),
  error: (entity: string, onRetry?: () => void) =>
    onRetry
      ? showModernErrorWithRetry('Erro ao atualizar', `Não foi possível atualizar ${entity}`, onRetry)
      : showModernError('Erro ao atualizar', `Não foi possível atualizar ${entity}`),
};

/**
 * Padrão para operações CRUD - DELETE
 */
export const toastPatternDelete = {
  loading: (entity: string) => showModernLoading(`Excluindo ${entity}...`, 'Removendo item'),
  success: (entity: string, onUndo?: () => void) =>
    onUndo
      ? showModernSuccessWithAction(`${entity} excluído!`, 'Item removido com sucesso', { label: 'Desfazer', onClick: onUndo })
      : showModernSuccess(`${entity} excluído!`, 'Item removido com sucesso'),
  error: (entity: string) => showModernError('Erro ao excluir', `Não foi possível excluir ${entity}`),
};

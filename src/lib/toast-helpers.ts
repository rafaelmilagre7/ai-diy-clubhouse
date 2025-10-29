import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

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

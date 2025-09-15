import React, { useState, useCallback, memo, Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

// Lazy loading do conteúdo do modal
const CreateInviteContent = React.lazy(() => import('./CreateInviteContent'));

interface OptimizedCreateInviteDialogProps {
  roles: any[];
  onInviteCreated: () => void;
}

const OptimizedCreateInviteDialog = memo<OptimizedCreateInviteDialogProps>(({ roles, onInviteCreated }) => {
  const [open, setOpen] = useState(false);

  // 🚀 Pré-carregar o conteúdo quando o usuário faz hover no botão
  const [shouldPreload, setShouldPreload] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setShouldPreload(true);
  }, []);

  const handleOpenChange = useCallback((newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setShouldPreload(true);
    }
  }, []);

  const handleInviteCreated = useCallback(() => {
    setOpen(false);
    onInviteCreated();
  }, [onInviteCreated]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button onMouseEnter={handleMouseEnter}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="dark max-w-md max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
        <Suspense fallback={
          <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative mb-4">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Carregando...</h3>
            <p className="text-gray-400 text-center text-sm">
              Preparando formulário de convite
            </p>
          </div>
        }>
          {(open || shouldPreload) && (
            <CreateInviteContent 
              roles={roles}
              onInviteCreated={handleInviteCreated}
              onClose={() => setOpen(false)}
            />
          )}
        </Suspense>
      </DialogContent>
    </Dialog>
  );
});

OptimizedCreateInviteDialog.displayName = 'OptimizedCreateInviteDialog';

export default OptimizedCreateInviteDialog;
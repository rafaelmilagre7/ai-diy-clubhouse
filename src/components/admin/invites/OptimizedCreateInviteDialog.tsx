import React, { useState, useCallback, memo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateInviteContent from './CreateInviteContent';

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
      <DialogContent className="dark max-w-md max-h-modal-lg overflow-y-auto bg-surface-elevated text-foreground border-border">
        {open && (
          <CreateInviteContent 
            roles={roles}
            onInviteCreated={handleInviteCreated}
            onClose={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
});

OptimizedCreateInviteDialog.displayName = 'OptimizedCreateInviteDialog';

export default OptimizedCreateInviteDialog;
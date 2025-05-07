
import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import AulaStepWizard, { AulaFormValues } from "./AulaStepWizard";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface AulaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleId: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const AulaDialog: React.FC<AulaDialogProps> = ({
  open,
  onOpenChange,
  moduleId,
  onClose,
  onSuccess
}) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleComplete = (data: AulaFormValues) => {
    if (onSuccess) onSuccess();
    onOpenChange(false);
  };
  
  const handleCancel = () => {
    if (onClose) onClose();
    onOpenChange(false);
  };

  // Usamos Sheet para mobile e Dialog para desktop
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto p-0">
          <div className="p-4 h-full">
            <AulaStepWizard 
              onComplete={handleComplete} 
              onCancel={handleCancel}
              defaultValues={{ 
                difficulty: "medium", 
                videos: [],
                materials: [],
                is_published: false,
                is_featured: false
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <AulaStepWizard 
          onComplete={handleComplete} 
          onCancel={handleCancel}
          defaultValues={{ 
            difficulty: "medium", 
            videos: [],
            materials: [],
            is_published: false,
            is_featured: false
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AulaDialog;


import { useState } from "react";
import { toast } from "sonner";

export const useReporting = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openReportModal = (type: "topic" | "post", itemId: string, userId: string) => {
    // Por enquanto, apenas mostrar um toast
    toast.info("Funcionalidade de reportar em desenvolvimento");
    console.log("Report:", { type, itemId, userId });
  };

  return {
    isOpen,
    setIsOpen,
    openReportModal
  };
};


import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { ReferralForm } from "./ReferralForm";
import { useState } from "react";

export function ReferralDialog({ onSuccess }: { onSuccess?: () => void }) {
  const [open, setOpen] = useState(false);
  
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Indicar Amigo</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Indicar um Amigo</DialogTitle>
          <DialogDescription>
            Convide amigos para o Viver de IA e ganhe benefícios exclusivos quando
            eles se inscreverem.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ReferralForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

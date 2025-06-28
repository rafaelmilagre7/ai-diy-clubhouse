
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { FormacaoSidebar } from "./FormacaoSidebar";
import { FormacaoContent } from "./FormacaoContent";

interface FormacaoLayoutProps {
  children: ReactNode;
}

const FormacaoLayout = ({ children }: FormacaoLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      <FormacaoSidebar />
      <FormacaoContent>
        {children}
      </FormacaoContent>
      <Toaster />
    </div>
  );
};

export default FormacaoLayout;

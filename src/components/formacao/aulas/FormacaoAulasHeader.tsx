
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface FormacaoAulasHeaderProps {
  titulo?: string;
  onNovaAula?: () => void;
  breadcrumb?: boolean;
  moduloId?: string;
  children?: React.ReactNode; // Adicionado a propriedade children
}

export const FormacaoAulasHeader: React.FC<FormacaoAulasHeaderProps> = ({
  titulo = "Aulas",
  onNovaAula,
  breadcrumb = false,
  moduloId,
  children, // Adicionado ao destructuring
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="space-y-2">
        {breadcrumb && (
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/formacao">Formação</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/formacao/aulas">Aulas</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{titulo}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}
        <h1 className="text-2xl font-bold">{titulo}</h1>
        <p className="text-muted-foreground">
          Gerencie as aulas disponíveis na plataforma
        </p>
      </div>
      {children ? (
        children
      ) : (
        onNovaAula && (
          <Button onClick={onNovaAula}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula
          </Button>
        )
      )}
    </div>
  );
};

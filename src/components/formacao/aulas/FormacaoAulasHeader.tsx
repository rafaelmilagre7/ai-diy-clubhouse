
import { Button } from "@/components/ui/button";
import { ChevronLeft, PlusCircle } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface FormacaoAulasHeaderProps {
  onNovaAula?: () => void;
  titulo?: string;
  breadcrumb?: boolean;
  moduloId?: string;
  cursoId?: string;
}

export const FormacaoAulasHeader = ({
  onNovaAula,
  titulo = "Gerenciamento de Aulas",
  breadcrumb = false,
  moduloId,
  cursoId
}: FormacaoAulasHeaderProps) => {
  return (
    <div className="flex flex-col gap-4">
      {breadcrumb ? (
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/formacao/cursos">Cursos</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {cursoId ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/formacao/cursos/${cursoId}`}>Detalhes do Curso</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : moduloId ? (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to={`/formacao/cursos/${moduloId}`}>Detalhes do Curso</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            ) : null}
            <BreadcrumbItem>
              <BreadcrumbPage>{titulo}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
        </div>
      )}

      <div className="flex justify-between items-center">
        {breadcrumb ? (
          <h1 className="text-3xl font-bold tracking-tight">{titulo}</h1>
        ) : (
          <Button variant="ghost" size="sm" asChild>
            <Link to="/formacao">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Link>
          </Button>
        )}

        {onNovaAula && (
          <Button onClick={onNovaAula}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nova Aula
          </Button>
        )}
      </div>
    </div>
  );
};

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Database, Loader2 } from "lucide-react";

interface DataStatusIndicatorProps {
  isDataReal?: boolean;
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  className?: string;
}

export const DataStatusIndicator = ({ 
  isDataReal, 
  loading, 
  error, 
  isEmpty,
  className = ""
}: DataStatusIndicatorProps) => {
  if (loading) {
    return (
      <Badge variant="outline" className={`gap-1 ${className}`}>
        <Loader2 className="h-3 w-3 animate-spin" />
        Carregando dados reais...
      </Badge>
    );
  }

  if (error) {
    return (
      <Badge variant="destructive" className={`gap-1 ${className}`}>
        <AlertCircle className="h-3 w-3" />
        Erro ao carregar
      </Badge>
    );
  }

  if (isEmpty) {
    return (
      <Badge variant="secondary" className={`gap-1 ${className}`}>
        <Database className="h-3 w-3" />
        Sem dados disponíveis
      </Badge>
    );
  }

  if (isDataReal) {
    return (
      <Badge variant="default" className={`gap-1 bg-success text-success-foreground ${className}`}>
        <CheckCircle2 className="h-3 w-3" />
        Dados Reais
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      <Database className="h-3 w-3" />
      Status indefinido
    </Badge>
  );
};
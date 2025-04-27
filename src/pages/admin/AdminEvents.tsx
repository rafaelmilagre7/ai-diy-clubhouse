
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminEventsHeader } from "@/components/admin/events/AdminEventsHeader";
import { EventsTable } from "@/components/admin/events/EventsTable";
import { useHandleGoogleCalendarAuth } from "@/hooks/admin/useHandleGoogleCalendarAuth";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

const AdminEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isProcessing, authError, isAuthenticated } = useHandleGoogleCalendarAuth();
  
  useEffect(() => {
    if (searchParams.has('code') || searchParams.has('state') || searchParams.has('error')) {
      // Limpa os parâmetros da URL após processar
      // Corrigido: Criando um objeto URLSearchParams vazio para limpar parâmetros
      // e garantindo que o tipo é compatível com o esperado
      setSearchParams(new URLSearchParams(), { replace: true });
    }
  }, [searchParams, setSearchParams]);
  
  return (
    <div className="space-y-6">
      {isProcessing && (
        <Alert>
          <LoadingSpinner size="sm" />
          <AlertDescription>
            Processando autenticação do Google Calendar...
          </AlertDescription>
        </Alert>
      )}
      
      {authError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro na autenticação do Google Calendar: {authError}
          </AlertDescription>
        </Alert>
      )}

      <AdminEventsHeader isCalendarAuthenticated={isAuthenticated} />
      <EventsTable />
    </div>
  );
};

export default AdminEvents;

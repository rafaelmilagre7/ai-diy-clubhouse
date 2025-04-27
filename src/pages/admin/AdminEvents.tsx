
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { AdminEventsHeader } from "@/components/admin/events/AdminEventsHeader";
import { EventsTable } from "@/components/admin/events/EventsTable";
import { toast } from "sonner";

const AdminEvents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  useEffect(() => {
    // Capturar parâmetros de autenticação do Google Calendar
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const authError = searchParams.get('authError');
    
    // Limpar os parâmetros da URL sem recarregar a página
    if (code || state || authError) {
      setSearchParams({}, { replace: true });
    }
    
    if (authError) {
      console.error('Erro de autenticação retornado:', authError);
      toast.error(`Falha na autenticação: ${authError}`);
    }
  }, [searchParams, setSearchParams]);
  
  return (
    <div className="space-y-6">
      <AdminEventsHeader />
      <EventsTable />
    </div>
  );
};

export default AdminEvents;

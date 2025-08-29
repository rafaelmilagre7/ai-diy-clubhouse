import { WhatsAppDiagnosticPanel } from '@/components/admin/invites/WhatsAppDiagnosticPanel';

const WhatsAppDiagnosticTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Diagnóstico WhatsApp</h2>
        <p className="text-muted-foreground">
          Verificação completa do sistema de convites via WhatsApp
        </p>
      </div>
      
      <WhatsAppDiagnosticPanel />
    </div>
  );
};

export default WhatsAppDiagnosticTab;
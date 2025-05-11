
import { RefreshCw } from "lucide-react";
import { TrustedDomain } from "@/hooks/admin/domains/types";
import DomainsList from "./DomainsList";
import { useTrustedDomainDelete } from "@/hooks/admin/domains/useTrustedDomainDelete";
import { useTrustedDomainToggle } from "@/hooks/admin/domains/useTrustedDomainToggle";

interface DomainsTabProps {
  domains: TrustedDomain[];
  loading: boolean;
  onDomainsChange: () => void;
}

const DomainsTab = ({ domains, loading, onDomainsChange }: DomainsTabProps) => {
  const { deleteDomain } = useTrustedDomainDelete();
  const { toggleDomainStatus } = useTrustedDomainToggle();

  const handleDeleteDomain = async (id: string) => {
    const confirmed = window.confirm("Tem certeza que deseja excluir este domínio?");
    if (confirmed) {
      await deleteDomain(id);
      onDomainsChange();
    }
  };

  const handleDomainToggle = async (id: string, currentStatus: boolean) => {
    await toggleDomainStatus(id, currentStatus);
    onDomainsChange();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DomainsList
      domains={domains}
      onDelete={handleDeleteDomain}
      onToggleStatus={handleDomainToggle}
    />
  );
};

export default DomainsTab;

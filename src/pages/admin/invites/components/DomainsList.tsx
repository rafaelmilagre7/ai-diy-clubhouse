
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TrustedDomain } from "@/hooks/admin/domains/types";

interface DomainsListProps {
  domains: TrustedDomain[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

const DomainsList = ({ domains, onDelete, onToggleStatus }: DomainsListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Domínio</TableHead>
          <TableHead>Papel</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {domains.length > 0 ? (
          domains.map((domain) => (
            <TableRow key={domain.id}>
              <TableCell className="font-medium">{domain.domain}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {domain.role?.name || "Desconhecido"}
                </Badge>
              </TableCell>
              <TableCell>{domain.description || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Switch 
                    checked={domain.is_active} 
                    onCheckedChange={() => onToggleStatus(domain.id, domain.is_active)}
                  />
                  <span>{domain.is_active ? "Ativo" : "Inativo"}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(domain.id)}
                  title="Excluir domínio"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
              Nenhum domínio confiável encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DomainsList;

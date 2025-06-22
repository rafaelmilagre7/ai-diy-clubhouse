
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface RoleSegmentation {
  roleId: string;
  roleName: string;
  conversionRate: number;
  avgOnboardingTime: number;
  retentionRate: number;
}

interface RoleSegmentationTableProps {
  data: RoleSegmentation[];
}

export const RoleSegmentationTable: React.FC<RoleSegmentationTableProps> = ({ data }) => {
  const getConversionBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-500">Excelente</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-500">Bom</Badge>;
    if (rate >= 40) return <Badge className="bg-orange-500">Regular</Badge>;
    return <Badge variant="destructive">Baixo</Badge>;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Papel/Role</TableHead>
            <TableHead>Taxa de Conversão</TableHead>
            <TableHead>Tempo Médio Onboarding</TableHead>
            <TableHead>Taxa de Retenção</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((role) => (
            <TableRow key={role.roleId}>
              <TableCell className="font-medium">{role.roleName}</TableCell>
              <TableCell>{role.conversionRate.toFixed(1)}%</TableCell>
              <TableCell>
                {role.avgOnboardingTime > 0 
                  ? `${role.avgOnboardingTime.toFixed(1)}h`
                  : 'N/A'
                }
              </TableCell>
              <TableCell>
                {role.retentionRate > 0 
                  ? `${role.retentionRate.toFixed(1)}%`
                  : 'N/A'
                }
              </TableCell>
              <TableCell>{getConversionBadge(role.conversionRate)}</TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Nenhum dado disponível
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

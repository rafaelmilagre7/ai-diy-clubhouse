
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, X, HelpCircle } from 'lucide-react';

interface SecurityStatusRow {
  table_name: string;
  rls_enabled: boolean;
  has_policies: boolean;
  policy_count: number;
  security_status: string;
}

interface SecurityStatusTableProps {
  data: SecurityStatusRow[];
}

export const SecurityStatusTable: React.FC<SecurityStatusTableProps> = ({ data }) => {
  const getStatusIcon = (status: string) => {
    if (status.includes('SEGURO')) return <Shield className="h-4 w-4 text-green-600" />;
    if (status.includes('RLS DESABILITADO')) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    if (status.includes('SEM PROTEÇÃO')) return <X className="h-4 w-4 text-red-600" />;
    return <HelpCircle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('SEGURO')) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Seguro</Badge>;
    }
    if (status.includes('RLS DESABILITADO')) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">RLS Desabilitado</Badge>;
    }
    if (status.includes('SEM PROTEÇÃO')) {
      return <Badge variant="destructive">Sem Proteção</Badge>;
    }
    return <Badge variant="outline">Verificar</Badge>;
  };

  const secureCount = data.filter(row => row.security_status.includes('SEGURO')).length;
  const warningCount = data.filter(row => row.security_status.includes('RLS DESABILITADO')).length;
  const dangerCount = data.filter(row => row.security_status.includes('SEM PROTEÇÃO')).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Tabelas</p>
              <p className="text-2xl font-bold text-gray-900">{data.length}</p>
            </div>
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Seguras</p>
              <p className="text-2xl font-bold text-green-900">{secureCount}</p>
            </div>
            <Shield className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">RLS Desabilitado</p>
              <p className="text-2xl font-bold text-yellow-900">{warningCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Sem Proteção</p>
              <p className="text-2xl font-bold text-red-900">{dangerCount}</p>
            </div>
            <X className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Tabela</TableHead>
              <TableHead className="text-center">RLS Habilitado</TableHead>
              <TableHead className="text-center">Tem Políticas</TableHead>
              <TableHead className="text-center">Nº Políticas</TableHead>
              <TableHead>Status de Segurança</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.table_name}>
                <TableCell className="font-mono text-sm">{row.table_name}</TableCell>
                <TableCell className="text-center">
                  {row.rls_enabled ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">Sim</Badge>
                  ) : (
                    <Badge variant="destructive">Não</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.has_policies ? (
                    <Badge variant="default" className="bg-blue-100 text-blue-800">Sim</Badge>
                  ) : (
                    <Badge variant="outline">Não</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {row.policy_count}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(row.security_status)}
                    {getStatusBadge(row.security_status)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

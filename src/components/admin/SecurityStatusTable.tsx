
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
    if (status.includes('SEGURO')) return <Shield className="h-4 w-4 text-green-400" />;
    if (status.includes('RLS DESABILITADO')) return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    if (status.includes('SEM PROTEÇÃO')) return <X className="h-4 w-4 text-red-400" />;
    return <HelpCircle className="h-4 w-4 text-neutral-400" />;
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('SEGURO')) {
      return <Badge className="bg-green-600 text-white hover:bg-green-700">Seguro</Badge>;
    }
    if (status.includes('RLS DESABILITADO')) {
      return <Badge className="bg-yellow-600 text-white hover:bg-yellow-700">RLS Desabilitado</Badge>;
    }
    if (status.includes('SEM PROTEÇÃO')) {
      return <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700">Sem Proteção</Badge>;
    }
    return <Badge variant="outline" className="border-neutral-500 text-neutral-300">Verificar</Badge>;
  };

  const secureCount = data.filter(row => row.security_status.includes('SEGURO')).length;
  const warningCount = data.filter(row => row.security_status.includes('RLS DESABILITADO')).length;
  const dangerCount = data.filter(row => row.security_status.includes('SEM PROTEÇÃO')).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-800/50 border border-neutral-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-300">Total de Tabelas</p>
              <p className="text-2xl font-bold text-white">{data.length}</p>
            </div>
            <Shield className="h-8 w-8 text-viverblue" />
          </div>
        </div>
        
        <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-400">Seguras</p>
              <p className="text-2xl font-bold text-green-300">{secureCount}</p>
            </div>
            <Shield className="h-8 w-8 text-green-400" />
          </div>
        </div>
        
        <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-400">RLS Desabilitado</p>
              <p className="text-2xl font-bold text-yellow-300">{warningCount}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-red-900/20 border border-red-500/30 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-400">Sem Proteção</p>
              <p className="text-2xl font-bold text-red-300">{dangerCount}</p>
            </div>
            <X className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-neutral-800/30 border border-neutral-700 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-neutral-700">
              <TableHead className="w-[200px] text-white">Tabela</TableHead>
              <TableHead className="text-center text-white">RLS Habilitado</TableHead>
              <TableHead className="text-center text-white">Tem Políticas</TableHead>
              <TableHead className="text-center text-white">Nº Políticas</TableHead>
              <TableHead className="text-white">Status de Segurança</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.table_name} className="border-neutral-700 hover:bg-neutral-800/50">
                <TableCell className="font-mono text-sm text-viverblue">{row.table_name}</TableCell>
                <TableCell className="text-center">
                  {row.rls_enabled ? (
                    <Badge className="bg-green-600 text-white hover:bg-green-700">Sim</Badge>
                  ) : (
                    <Badge variant="destructive" className="bg-red-600 text-white hover:bg-red-700">Não</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.has_policies ? (
                    <Badge className="bg-blue-600 text-white hover:bg-blue-700">Sim</Badge>
                  ) : (
                    <Badge variant="outline" className="border-neutral-500 text-neutral-300">Não</Badge>
                  )}
                </TableCell>
                <TableCell className="text-center font-mono text-white">
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

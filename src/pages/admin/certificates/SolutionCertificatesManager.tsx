import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Download, Eye, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useDynamicSEO } from "@/hooks/seo/useDynamicSEO";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SolutionCertificatesManager() {
  const [searchTerm, setSearchTerm] = useState("");

  useDynamicSEO({
    title: 'Certificados de Soluções',
    description: 'Gerencie certificados de implementações de IA.',
    keywords: 'certificados, soluções, implementações'
  });

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['solution-certificates-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solution_certificates')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          ),
          solutions:solution_id (
            title
          )
        `)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredCertificates = certificates?.filter(cert => {
    const searchLower = searchTerm.toLowerCase();
    return (
      cert.profiles?.name?.toLowerCase().includes(searchLower) ||
      cert.profiles?.email?.toLowerCase().includes(searchLower) ||
      cert.solutions?.title?.toLowerCase().includes(searchLower) ||
      cert.validation_code?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <FileText className="h-8 w-8 text-primary" />
          Certificados de Soluções
        </h1>
        <p className="text-muted-foreground mt-2">
          Gerencie certificados de implementações de IA
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{certificates?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total de Certificados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-status-success" />
              <div>
                <p className="text-2xl font-bold">
                  {certificates?.filter(c => {
                    const hoje = new Date();
                    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                    return new Date(c.issued_at) >= inicioMes;
                  }).length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Emitidos Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Eye className="h-8 w-8 text-strategy" />
              <div>
                <p className="text-2xl font-bold">
                  {new Set(certificates?.map(c => c.solution_id)).size || 0}
                </p>
                <p className="text-sm text-muted-foreground">Soluções Diferentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, solução ou código de validação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Certificados Emitidos</CardTitle>
          <CardDescription>
            Lista completa de certificados de soluções
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando certificados...
            </div>
          ) : filteredCertificates && filteredCertificates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Solução</TableHead>
                    <TableHead>Data de Implementação</TableHead>
                    <TableHead>Data de Emissão</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{cert.profiles?.name}</div>
                          <div className="text-xs text-muted-foreground">{cert.profiles?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{cert.solutions?.title || 'N/A'}</TableCell>
                      <TableCell>
                        {cert.implementation_date 
                          ? format(new Date(cert.implementation_date), 'dd/MM/yyyy', { locale: ptBR })
                          : 'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        {format(new Date(cert.issued_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {cert.validation_code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cert.certificate_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(cert.certificate_url!, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {cert.certificate_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = cert.certificate_url!;
                                link.download = `certificado-${cert.validation_code}.pdf`;
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum certificado encontrado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

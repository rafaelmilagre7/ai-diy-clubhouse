import { useState, useCallback } from "react";
import { Upload, FileText, UserPlus, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContactDataCleaner } from "@/hooks/admin/invites/useContactDataCleaner";
import { useRoleMapping } from "@/hooks/admin/invites/useRoleMapping";
import { DataCleaningResults } from "./DataCleaningResults";
import { toast } from "sonner";
import { type ContactData, type CleanedContact } from "@/utils/contactDataCleaner";

interface UserRole {
  id: string;
  name: string;
  description?: string;
}

interface BulkInviteUploadProps {
  roles: UserRole[];
  rolesLoading?: boolean;
  onProceedWithContacts: (contacts: CleanedContact[], roleId: string) => void;
}

export function BulkInviteUpload({ roles, rolesLoading = false, onProceedWithContacts }: BulkInviteUploadProps) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [manualContacts, setManualContacts] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [rawContacts, setRawContacts] = useState<ContactData[]>([]);
  
  const { processContacts, clearResults, isProcessing, cleaningResult } = useContactDataCleaner();
  const { validateRole, getAvailableRoles } = useRoleMapping();

  // Usar roles reais vindos do banco de dados
  const availableRoles = roles || [];

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error('Por favor, selecione um arquivo CSV válido');
        return;
      }
      setCsvFile(file);
      toast.success('Arquivo CSV carregado com sucesso');
    }
  }, []);

  const parseCsvData = (csvText: string): ContactData[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    // Assume primeira linha como cabeçalho
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const emailIndex = headers.findIndex(h => h.includes('email') || h.includes('e-mail'));
    const phoneIndex = headers.findIndex(h => h.includes('telefone') || h.includes('phone') || h.includes('whatsapp'));
    const roleIndex = headers.findIndex(h => h.includes('papel') || h.includes('role') || h.includes('cargo'));
    const channelIndex = headers.findIndex(h => h.includes('canal') || h.includes('channel') || h.includes('envio'));
    const expiresIndex = headers.findIndex(h => h.includes('validade') || h.includes('expires') || h.includes('expira'));
    const notesIndex = headers.findIndex(h => h.includes('observ') || h.includes('notes') || h.includes('nota'));

    if (emailIndex === -1) {
      throw new Error('CSV deve conter coluna "Email"');
    }

    const contacts: ContactData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      if (values.length > emailIndex && values[emailIndex]) {
        contacts.push({
          email: values[emailIndex],
          phone: phoneIndex >= 0 ? values[phoneIndex] : undefined,
          role: roleIndex >= 0 ? values[roleIndex] : undefined,
          channel: channelIndex >= 0 ? (values[channelIndex] as 'email' | 'whatsapp' | 'both') : undefined,
          expires_in: expiresIndex >= 0 ? values[expiresIndex] : undefined,
          notes: notesIndex >= 0 ? values[notesIndex] : undefined
        });
      }
    }

    return contacts;
  };

  const parseManualData = (text: string): ContactData[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const contacts: ContactData[] = [];

    for (const line of lines) {
      // Formatos aceitos:
      // nome@email.com
      // Nome <nome@email.com>
      // Nome, nome@email.com, (11) 99999-9999
      const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      
      if (emailMatch) {
        const email = emailMatch[1];
        let name = '';
        let phone = '';

        // Tenta extrair nome
        if (line.includes('<') && line.includes('>')) {
          // Formato: Nome <email@domain.com>
          name = line.substring(0, line.indexOf('<')).trim();
        } else if (line.includes(',')) {
          // Formato CSV: Nome, email, telefone
          const parts = line.split(',').map(p => p.trim());
          name = parts[0] || email.split('@')[0];
          if (parts.length > 2) {
            phone = parts[2];
          }
        } else {
          // Só email, usa parte antes do @
          name = email.split('@')[0];
        }

        // Tenta extrair telefone se não foi encontrado
        if (!phone) {
          const phoneMatch = line.match(/(\+?55\s*)?(\(?1[1-9]\)?[\s-]?9?\d{4}[\s-]?\d{4})/);
          if (phoneMatch) {
            phone = phoneMatch[0];
          }
        }

        contacts.push({
          email,
          phone: phone || undefined
        });
      }
    }

    return contacts;
  };

  const handleProcessCsv = async () => {
    if (!csvFile) {
      toast.error('Selecione um arquivo CSV');
      return;
    }

    try {
      const text = await csvFile.text();
      const contacts = parseCsvData(text);
      
      if (contacts.length === 0) {
        toast.error('Nenhum contato válido encontrado no arquivo');
        return;
      }

      setRawContacts(contacts);
      await processContacts(contacts);
    } catch (error: any) {
      toast.error('Erro ao processar CSV: ' + error.message);
    }
  };

  const handleProcessManual = async () => {
    if (!manualContacts.trim()) {
      toast.error('Digite os contatos');
      return;
    }

    try {
      const contacts = parseManualData(manualContacts);
      
      if (contacts.length === 0) {
        toast.error('Nenhum contato válido encontrado');
        return;
      }

      setRawContacts(contacts);
      await processContacts(contacts);
    } catch (error: any) {
      toast.error('Erro ao processar contatos: ' + error.message);
    }
  };

  const handleProceedWithContacts = (contacts: CleanedContact[]) => {
    // Verificar se contatos têm papéis individuais válidos
    const hasIndividualRoles = contacts.some(contact => 
      contact.cleaned.role && contact.cleaned.role !== 'convidado'
    );

    // Validar papéis se existirem
    if (hasIndividualRoles) {
      const invalidRoles = contacts
        .map(c => c.cleaned.role)
        .filter((role, index, arr) => role && arr.indexOf(role) === index) // únicos
        .filter(role => role && !validateRole(role));

      if (invalidRoles.length > 0) {
        toast.error(`Papéis inválidos encontrados: ${invalidRoles.join(', ')}`);
        return;
      }
    }

    // Se não há papéis individuais e nenhum papel global selecionado, usar padrão
    const finalRoleId = hasIndividualRoles 
      ? 'individual' // Flag para indicar processamento individual
      : selectedRoleId || 'default';

    console.log(`🎯 [UPLOAD] Procedendo com ${contacts.length} contatos, papel: ${finalRoleId}`);
    
    clearResults();
    onProceedWithContacts(contacts, finalRoleId);
  };

  const downloadSampleCsv = () => {
    const csvContent = [
      'Email,Telefone,Papel,Canal,Validade,Observacoes',
      'joao@example.com,(11) 99999-9999,convidado,email,7 days,Contato via LinkedIn',
      'maria@example.com,+55 11 88888-8888,admin,both,14 days,Gerente de vendas',
      'pedro@example.com,,hands_on,email,30 days,Workshop presencial',
      'ana@example.com,(21) 77777-7777,lovable_course,whatsapp,3 days,Curso online',
      'carlos@example.com,+55 21 99999-0000,convidado,both,1 day,Convite urgente'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo-convites.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (cleaningResult) {
    return (
      <DataCleaningResults
        result={cleaningResult}
        onApproveCorrections={handleProceedWithContacts}
        onProceedWithValid={handleProceedWithContacts}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Convites em Massa
          </CardTitle>
            <CardDescription>
              Importe uma lista de contatos para enviar convites em lote. 
              Formato esperado: Email, Telefone, Papel, Canal, Validade, Observações.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Novo formato CSV padronizado:</p>
                <p className="text-xs text-muted-foreground">
                  O sistema foi atualizado para aceitar campos individuais por convite. 
                  Use o botão "Baixar exemplo" para ver todas as opções disponíveis.
                </p>
              </div>

            <Tabs defaultValue="csv" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload CSV
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Inserção Manual
                </TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <div className="text-center space-y-4">
                      <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
                      <div>
                        <Label htmlFor="csv-upload" className="cursor-pointer">
                          <div className="font-medium">Clique para selecionar arquivo CSV</div>
                          <div className="text-sm text-muted-foreground">
                            Formato: Email, Telefone, Papel, Canal, Validade, Observações
                          </div>
                        </Label>
                        <input
                          id="csv-upload"
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </div>
                      {csvFile && (
                        <div className="text-sm text-green-600">
                          ✓ {csvFile.name} carregado
                        </div>
                      )}
                    </div>
                  </div>

                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadSampleCsv}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar exemplo CSV completo
                    </Button>
                    <div className="text-xs text-muted-foreground max-w-md">
                      <p><strong>Campos obrigatórios:</strong> Email</p>
                      <p><strong>Campos opcionais:</strong> Telefone, Papel (admin/convidado/hands_on/lovable_course), Canal (email/whatsapp/both), Validade (1-30 days), Observações</p>
                    </div>
                  </div>

                  <Button
                    onClick={handleProcessCsv}
                    disabled={!csvFile || isProcessing}
                  >
                    {isProcessing ? 'Processando...' : 'Processar CSV'}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-4">
                <div>
                  <Label htmlFor="manual-contacts">Lista de contatos</Label>
                  <Textarea
                    id="manual-contacts"
                    placeholder={`Insira os contatos nos formatos:
• joao@example.com
• João Silva <joao@example.com>  
• Maria, maria@example.com, (11) 99999-9999
• pedro@example.com (11) 88888-8888

Um contato por linha`}
                    value={manualContacts}
                    onChange={(e) => setManualContacts(e.target.value)}
                    rows={10}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleProcessManual}
                    disabled={!manualContacts.trim() || isProcessing}
                  >
                    {isProcessing ? 'Processando...' : 'Processar Lista'}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
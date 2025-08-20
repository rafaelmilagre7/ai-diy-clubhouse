import { CheckCircle, AlertTriangle, XCircle, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type DataCleaningResult, type CleanedContact } from "@/utils/contactDataCleaner";

interface DataCleaningResultsProps {
  result: DataCleaningResult;
  onApproveCorrections: (contacts: CleanedContact[]) => void;
  onProceedWithValid: (contacts: CleanedContact[]) => void;
}

export function DataCleaningResults({ 
  result, 
  onApproveCorrections, 
  onProceedWithValid 
}: DataCleaningResultsProps) {
  const { valid, corrected, invalid, duplicates, summary } = result;

  const ContactCard = ({ contact }: { contact: CleanedContact }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{contact.cleaned.name}</p>
              <p className="text-sm text-muted-foreground">{contact.cleaned.email}</p>
              {contact.cleaned.phone && (
                <p className="text-sm text-muted-foreground">{contact.cleaned.phone}</p>
              )}
            </div>
            <Badge 
              variant={
                contact.status === 'valid' ? 'secondary' :
                contact.status === 'corrected' ? 'default' : 'destructive'
              }
            >
              {contact.status === 'valid' ? 'Válido' :
               contact.status === 'corrected' ? 'Corrigido' : 'Inválido'}
            </Badge>
          </div>
          
          {contact.corrections.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-orange-700">Correções aplicadas:</p>
              <ul className="text-xs text-orange-600 ml-2">
                {contact.corrections.map((correction, idx) => (
                  <li key={idx}>• {correction}</li>
                ))}
              </ul>
            </div>
          )}
          
          {contact.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-700">Problemas encontrados:</p>
              <ul className="text-xs text-red-600 ml-2">
                {contact.errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          {contact.status === 'corrected' && (
            <div className="mt-2 p-2 bg-orange-50 rounded text-xs">
              <p className="font-medium">Original:</p>
              <p>Nome: {contact.original.name}</p>
              <p>E-mail: {contact.original.email}</p>
              {contact.original.phone && <p>Tel: {contact.original.phone}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const DuplicateGroup = ({ group, index }: { group: CleanedContact[], index: number }) => (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Grupo de Duplicatas #{index + 1}</CardTitle>
        <CardDescription>E-mail: {group[0].cleaned.email}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {group.map((contact, idx) => (
          <div key={idx} className="p-2 border rounded text-sm">
            <p className="font-medium">{contact.cleaned.name}</p>
            {contact.cleaned.phone && <p className="text-muted-foreground">{contact.cleaned.phone}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resultado da Limpeza de Dados
          </CardTitle>
          <CardDescription>
            Processados {summary.total} contatos com os seguintes resultados:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{summary.validCount}</div>
              <div className="text-sm text-muted-foreground">Válidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{summary.correctedCount}</div>
              <div className="text-sm text-muted-foreground">Corrigidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{summary.invalidCount}</div>
              <div className="text-sm text-muted-foreground">Inválidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{summary.duplicateCount}</div>
              <div className="text-sm text-muted-foreground">Duplicatas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-3">
        {(valid.length > 0 || corrected.length > 0) && (
          <Button 
            onClick={() => onProceedWithValid([...valid, ...corrected])}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Prosseguir com {valid.length + corrected.length} contatos válidos
          </Button>
        )}
        
        {corrected.length > 0 && (
          <Button 
            variant="outline" 
            onClick={() => onApproveCorrections(corrected)}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Revisar {corrected.length} correções
          </Button>
        )}
      </div>

      {/* Detalhes em abas */}
      <Tabs defaultValue="corrected" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="valid" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Válidos ({valid.length})
          </TabsTrigger>
          <TabsTrigger value="corrected" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Corrigidos ({corrected.length})
          </TabsTrigger>
          <TabsTrigger value="invalid" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Inválidos ({invalid.length})
          </TabsTrigger>
          <TabsTrigger value="duplicates" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Duplicatas ({duplicates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="valid" className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {valid.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum contato válido encontrado.</p>
              ) : (
                valid.map((contact, index) => (
                  <ContactCard key={index} contact={contact} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="corrected" className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {corrected.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma correção necessária.</p>
              ) : (
                corrected.map((contact, index) => (
                  <ContactCard key={index} contact={contact} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="invalid" className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {invalid.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum contato inválido.</p>
              ) : (
                invalid.map((contact, index) => (
                  <ContactCard key={index} contact={contact} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="duplicates" className="mt-4">
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {duplicates.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma duplicata encontrada.</p>
              ) : (
                duplicates.map((group, index) => (
                  <DuplicateGroup key={index} group={group} index={index} />
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
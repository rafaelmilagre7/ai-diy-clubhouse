import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CSVValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    uniqueMasters: number;
    uniqueMembers: number;
    emptyRows: number;
  };
}

interface CSVPreviewProps {
  file: File;
  validation: CSVValidation;
}

export const CSVPreview: React.FC<CSVPreviewProps> = ({ file, validation }) => {
  const [preview, setPreview] = useState<{ masters: string[], members: Map<string, string[]> } | null>(null);

  useEffect(() => {
    const readFile = async () => {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const masterIndex = headers.findIndex(h => h.includes('usuario_master') || h.includes('master'));
      const memberIndex = headers.findIndex(h => h.includes('usuario_adicional') || h.includes('adicional'));

      const masters = new Set<string>();
      const membersMap = new Map<string, string[]>();

      lines.slice(1).forEach(line => {
        const values = line.split(',').map(v => v.trim());
        const masterEmail = values[masterIndex]?.toLowerCase().trim();
        const memberEmail = values[memberIndex]?.toLowerCase().trim();

        if (masterEmail) {
          masters.add(masterEmail);
          
          if (!membersMap.has(masterEmail)) {
            membersMap.set(masterEmail, []);
          }
          
          if (memberEmail && memberEmail !== masterEmail) {
            membersMap.get(masterEmail)!.push(memberEmail);
          }
        }
      });

      setPreview({
        masters: Array.from(masters).slice(0, 10),
        members: membersMap
      });
    };

    readFile();
  }, [file]);

  if (!preview) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Preview do CSV
        </CardTitle>
        <CardDescription>
          Primeiros 10 masters encontrados no arquivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{validation.stats.uniqueMasters}</div>
              <div className="text-sm text-muted-foreground">Masters</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <UserPlus className="w-8 h-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{validation.stats.uniqueMembers}</div>
              <div className="text-sm text-muted-foreground">Membros</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">{validation.stats.totalRows}</div>
              <div className="text-sm text-muted-foreground">Total de linhas</div>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          <div className="space-y-4">
            {preview.masters.map((master, index) => {
              const members = preview.members.get(master) || [];
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" className="font-mono text-xs">
                      Master
                    </Badge>
                    <span className="text-sm font-medium">{master}</span>
                    <Badge variant="outline" className="ml-auto">
                      {members.length} membro{members.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  
                  {members.length > 0 && (
                    <div className="ml-8 space-y-1">
                      {members.slice(0, 5).map((member, mIndex) => (
                        <div key={mIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                          {member}
                        </div>
                      ))}
                      {members.length > 5 && (
                        <div className="text-xs text-muted-foreground ml-4">
                          ... e mais {members.length - 5} membro{members.length - 5 !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {index < preview.masters.length - 1 && (
                    <div className="border-b my-3" />
                  )}
                </div>
              );
            })}
            
            {validation.stats.uniqueMasters > 10 && (
              <div className="text-center text-sm text-muted-foreground py-4">
                ... e mais {validation.stats.uniqueMasters - 10} masters no arquivo
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

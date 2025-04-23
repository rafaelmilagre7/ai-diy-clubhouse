
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utils/date";

interface ImplementationProfile {
  id: string;
  name: string;
  email: string;
  company_name: string;
  company_size: string;
  ai_knowledge_level: number;
  created_at: string;
  is_completed: boolean;
}

interface ImplementationProfilesTableProps {
  profiles: ImplementationProfile[];
  onViewProfile: (id: string) => void;
}

export const ImplementationProfilesTable: React.FC<ImplementationProfilesTableProps> = ({
  profiles,
  onViewProfile,
}) => {
  const getCompletionBadgeVariant = (isCompleted: boolean) => {
    return isCompleted ? "default" : "secondary";
  };

  const getAiLevelBadgeVariant = (level: number) => {
    return level >= 7 ? "default" : "secondary";
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Porte</TableHead>
            <TableHead>Nível de IA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data de Cadastro</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {profiles.map((profile) => (
            <TableRow
              key={profile.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewProfile(profile.id)}
            >
              <TableCell>
                <div>
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
              </TableCell>
              <TableCell>{profile.company_name}</TableCell>
              <TableCell>{profile.company_size}</TableCell>
              <TableCell>
                <Badge variant={getAiLevelBadgeVariant(profile.ai_knowledge_level)}>
                  {profile.ai_knowledge_level}/10
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getCompletionBadgeVariant(profile.is_completed)}>
                  {profile.is_completed ? "Completo" : "Incompleto"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(profile.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileEdit } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

interface ProfileHeaderProps {
  profileName: string | null;
  profileEmail: string | null;
  profileAvatar: string | undefined;
  createdAt: string;
  totalSolutions: number;
  completedSolutions: number;
  completionRate: number;
  avatarInitials: string;
}

export const ProfileHeader = ({
  profileName,
  profileEmail,
  profileAvatar,
  createdAt,
  totalSolutions,
  completedSolutions,
  completionRate,
  avatarInitials
}: ProfileHeaderProps) => {
  return (
    <Card className="md:col-span-1">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profileAvatar || undefined} />
            <AvatarFallback className="text-2xl">{avatarInitials}</AvatarFallback>
          </Avatar>
          <h2 className="mt-4 text-xl font-semibold">{profileName || "Usuário"}</h2>
          <p className="text-sm text-muted-foreground mt-1">{profileEmail || ""}</p>
          
          <div className="w-full mt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Membro desde</span>
              <span className="font-medium">{formatDate(createdAt || new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Implementações</span>
              <span className="font-medium">{totalSolutions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Concluídas</span>
              <span className="font-medium">{completedSolutions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxa de conclusão</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
          </div>
          
          <div className="w-full mt-6">
            <Progress value={completionRate} className="h-2" />
          </div>
          
          <Button className="mt-6" variant="outline" size="sm">
            <FileEdit className="mr-2 h-4 w-4" />
            Editar Perfil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

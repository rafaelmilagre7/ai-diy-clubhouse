
import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail } from "lucide-react";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-viverblue rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle>Você foi convidado!</CardTitle>
          <CardDescription>
            Junte-se à comunidade Viver de IA e comece sua jornada de implementação de inteligência artificial.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {token ? (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Token de convite válido detectado
              </p>
              <Button className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Aceitar Convite
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Entre em contato com quem te convidou para obter o link correto
              </p>
              <Button variant="outline" className="w-full">
                Fazer Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

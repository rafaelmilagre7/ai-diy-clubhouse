
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RoleCourseAccessProps {
  roleId: string;
}

export const RoleCourseAccess: React.FC<RoleCourseAccessProps> = ({ roleId }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acesso a Cursos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Funcionalidade de controle de acesso a cursos será implementada em breve.
        </p>
      </CardContent>
    </Card>
  );
};

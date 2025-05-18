
import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ForumLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export const ForumLayout = ({ children, title, description }: ForumLayoutProps) => {
  return (
    <div className="container mx-auto py-6">
      <Card className="bg-card shadow-sm border-none">
        {title && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              {description && <p className="text-muted-foreground mt-1">{description}</p>}
            </CardHeader>
            <Separator />
          </>
        )}
        <CardContent className="p-6 pt-4">
          {children}
        </CardContent>
      </Card>
    </div>
  );
};

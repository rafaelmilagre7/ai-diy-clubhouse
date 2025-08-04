import React from "react";
import { ExternalLink, LinkIcon, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface LinkAuxiliar {
  title: string;
  description: string;
  url: string;
}

interface LinksAuxiliaresProps {
  links: LinkAuxiliar[];
}

export const LinksAuxiliares = ({ links }: LinksAuxiliaresProps) => {
  const handleOpenLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!links || links.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="bg-primary/20 text-primary p-2 rounded-md">
          <Globe className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-semibold">Links Auxiliares</h3>
          <p className="text-muted-foreground">
            Recursos externos úteis para implementar esta solução
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {links.map((link, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-md group-hover:bg-primary/20 transition-colors">
                    <LinkIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">
                      {link.title}
                    </CardTitle>
                    <CardDescription className="mt-1 text-muted-foreground">
                      {link.description}
                    </CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenLink(link.url)}
                  className="ml-4 bg-transparent border-primary/20 text-primary hover:bg-primary/10 hover:border-primary transition-all group-hover:scale-105"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <span className="truncate font-mono bg-muted px-2 py-1 rounded text-xs">
                  {link.url}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb, 
  BreadcrumbList, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbSeparator, 
  BreadcrumbPage 
} from "@/components/ui/breadcrumb";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backUrl?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  backUrl,
  backLabel = "Voltar",
  actions,
  className
}) => {
  return (
    <div className={cn("space-y-4 pb-6", className)}>
      {/* Breadcrumbs ou botão de voltar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink asChild>
                      <Link to={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      
      {backUrl && !breadcrumbs && (
        <Button variant="ghost" size="sm" asChild className="w-fit -ml-2">
          <Link to={backUrl} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      )}

      {/* Header principal */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Text variant="page" textColor="primary" className="font-bold">
            {title}
          </Text>
          {description && (
            <Text variant="body" textColor="secondary" className="max-w-2xl">
              {description}
            </Text>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

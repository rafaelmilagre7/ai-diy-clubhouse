
import React from 'react';
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Home, Plus, MessagesSquare } from 'lucide-react';

interface ForumHeaderProps {
  title: string;
  description?: string;
  showNewTopicButton?: boolean;
  categorySlug?: string;
  breadcrumbs?: {
    name: string;
    href: string;
  }[];
}

export const ForumHeader = ({ 
  title, 
  description, 
  showNewTopicButton = false,
  categorySlug,
  breadcrumbs = []
}: ForumHeaderProps) => {
  const { profile } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:space-y-0">
        <div>
          {breadcrumbs.length > 0 && (
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/forum">
                      <Home className="h-4 w-4" />
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.name}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-2">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex items-center">
          {showNewTopicButton && (
            <Button asChild disabled={!profile?.id}>
              <Link to={categorySlug ? `/forum/categoria/${categorySlug}/novo` : '/forum/novo'}>
                <Plus className="mr-2 h-4 w-4" />
                Novo Tópico
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex items-center text-muted-foreground">
        <MessagesSquare className="mr-2 h-4 w-4" />
        Fórum
      </div>
      
      <hr className="my-4" />
    </div>
  );
};

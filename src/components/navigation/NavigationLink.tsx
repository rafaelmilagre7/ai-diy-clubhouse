
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavigationLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({
  to,
  children,
  external = false,
  className,
  ...props
}) => {
  // Se for link externo, usar <a>
  if (external || to.startsWith('http') || to.startsWith('mailto:')) {
    return (
      <a 
        href={to} 
        className={className}
        target="_blank" 
        rel="noopener noreferrer"
        {...(props as any)}
      >
        {children}
      </a>
    );
  }

  // Para navegação interna, sempre usar <Link>
  return (
    <Link 
      to={to} 
      className={className}
      {...props}
    >
      {children}
    </Link>
  );
};

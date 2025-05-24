
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ForumBreadcrumbsProps {
  categoryName?: string;
  categorySlug?: string;
  topicTitle?: string;
  section?: string;
  sectionTitle?: string;
}

export const ForumBreadcrumbs = ({ 
  categoryName, 
  categorySlug, 
  topicTitle,
  section,
  sectionTitle 
}: ForumBreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link 
        to="/comunidade" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        Comunidade
      </Link>
      
      {section && sectionTitle && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span>{sectionTitle}</span>
        </>
      )}
      
      {categoryName && categorySlug && (
        <>
          <ChevronRight className="h-4 w-4" />
          <Link 
            to={`/comunidade/categoria/${categorySlug}`}
            className="hover:text-foreground transition-colors"
          >
            {categoryName}
          </Link>
        </>
      )}
      
      {topicTitle && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium line-clamp-1">
            {topicTitle}
          </span>
        </>
      )}
    </nav>
  );
};

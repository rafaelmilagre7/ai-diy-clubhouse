
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useForumCategories } from "@/hooks/community/useForumCategories";

interface ForumBreadcrumbsProps {
  categorySlug?: string;
  topicTitle?: string;
  section?: string;
  sectionTitle?: string;
}

export const ForumBreadcrumbs = ({ 
  categorySlug, 
  topicTitle, 
  section,
  sectionTitle
}: ForumBreadcrumbsProps) => {
  const { categories } = useForumCategories();
  
  // Encontrar a categoria atual com base no slug
  const currentCategory = categorySlug 
    ? categories?.find(cat => cat.slug === categorySlug)
    : null;
  
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/comunidade">Comunidade</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {section && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{sectionTitle || section}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
        
        {currentCategory && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {topicTitle ? (
                <BreadcrumbLink asChild>
                  <Link to={`/comunidade/categoria/${categorySlug}`}>
                    {currentCategory.name}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{currentCategory.name}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
        
        {topicTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{topicTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

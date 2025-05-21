
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

export interface ForumBreadcrumbsProps {
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
  const { categories } = useForumCategories();
  
  // Encontrar a categoria atual com base no slug ou nome fornecido
  const currentCategory = categorySlug 
    ? categories?.find(cat => cat.slug === categorySlug)
    : categoryName 
      ? categories?.find(cat => cat.name === categoryName) 
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
        
        {(currentCategory || categoryName) && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {topicTitle ? (
                <BreadcrumbLink asChild>
                  <Link to={`/comunidade/categoria/${categorySlug || currentCategory?.slug}`}>
                    {currentCategory?.name || categoryName}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{currentCategory?.name || categoryName}</BreadcrumbPage>
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

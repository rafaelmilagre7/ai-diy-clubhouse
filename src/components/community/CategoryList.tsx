
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { CategoryCard } from "./CategoryCard";
import { CategoryLoading } from "./CategoryLoading";
import { CategoryError } from "./CategoryError";
import { EmptyCategories } from "./EmptyCategories";
import { ForumCategory } from "@/types/forumTypes";

interface CategoryListProps {
  onCategorySelect?: (categorySlug: string) => void;
}

export const CategoryList = ({ onCategorySelect }: CategoryListProps) => {
  const { categories, isLoading, error, refetch } = useForumCategories();
  
  // Estado de carregamento
  if (isLoading) {
    return <CategoryLoading />;
  }
  
  // Estado de erro
  if (error) {
    return <CategoryError onRetry={refetch} />;
  }
  
  // Estado vazio
  if (!categories || categories.length === 0) {
    return <EmptyCategories />;
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {categories.map((category) => (
        <CategoryCard 
          key={category.id} 
          id={category.id}
          name={category.name}
          description={category.description}
          slug={category.slug}
          icon={category.icon}
          onClick={() => onCategorySelect && onCategorySelect(category.slug)}
        />
      ))}
    </div>
  );
};

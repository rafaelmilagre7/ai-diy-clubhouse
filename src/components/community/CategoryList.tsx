
import { useForumCategories } from "@/hooks/community/useForumCategories";
import { CategoryCard } from "./CategoryCard";
import { CategoryLoading } from "./CategoryLoading";
import { CategoryError } from "./CategoryError";
import { EmptyCategories } from "./EmptyCategories";

export const CategoryList = () => {
  const { categories, isLoading, error } = useForumCategories();

  if (isLoading) {
    return <CategoryLoading />;
  }

  if (error) {
    return <CategoryError />;
  }

  if (!categories || categories.length === 0) {
    return <EmptyCategories />;
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <CategoryCard 
          key={category.id}
          id={category.id}
          name={category.name}
          description={category.description}
          slug={category.slug}
          icon={category.icon}
        />
      ))}
    </div>
  );
};

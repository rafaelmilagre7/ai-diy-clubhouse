
interface CardContentProps {
  title: string;
  description: string;
}

export const CardContentSection = ({ title, description }: CardContentProps) => {
  return (
    <>
      <h3 className="font-heading font-semibold text-lg line-clamp-2 text-neutral-800">{title}</h3>
      <p className="text-neutral-600 text-sm line-clamp-2 mt-1">
        {description}
      </p>
    </>
  );
};

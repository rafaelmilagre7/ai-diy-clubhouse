
interface CardContentProps {
  title: string;
  description: string;
}

export const CardContentSection = ({ title, description }: CardContentProps) => {
  return (
    <>
      <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
      <p className="text-muted-foreground text-sm line-clamp-2">
        {description}
      </p>
    </>
  );
};


import { Card } from "@/components/ui/card";

interface CourseHeaderProps {
  title: string;
  description: string | null;
  coverImage: string | null;
}

export const CourseHeader = ({ title, description, coverImage }: CourseHeaderProps) => {
  return (
    <Card className="overflow-hidden border-0 bg-transparent shadow-none">
      <div className="relative">
        <div
          className="h-64 w-full bg-cover bg-center rounded-t-lg"
          style={{
            backgroundImage: coverImage
              ? `url(${coverImage})`
              : "url('https://via.placeholder.com/1200x400?text=Curso')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 rounded-t-lg">
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          {description && (
            <p className="text-white/90 max-w-2xl">{description}</p>
          )}
        </div>
      </div>
    </Card>
  );
};

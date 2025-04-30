
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  coverImage: string | null;
  progress: number;
}

export const CourseCard = ({
  id,
  title,
  description,
  coverImage,
  progress
}: CourseCardProps) => {
  return (
    <Link to={`/learning/course/${id}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
        <div
          className="h-48 w-full bg-cover bg-center"
          style={{
            backgroundImage: coverImage
              ? `url(${coverImage})`
              : "url('https://via.placeholder.com/400x200?text=Curso')"
          }}
        />
        <CardHeader className="p-4 pb-2">
          <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
            {title}
          </h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col items-start">
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{progress > 0 ? "Em progresso" : "Não iniciado"}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};

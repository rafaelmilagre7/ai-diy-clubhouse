
import React, { useState, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Course {
  id: string;
  title: string;
  coverImageUrl: string;
  instructor?: string;
  date?: string;
  slug?: string;
  type?: 'course' | 'hotseat' | 'tutorial';
}

interface CourseRowProps {
  title: string;
  courses: Course[];
  type?: 'course' | 'hotseat' | 'tutorial';
}

const CoursesCarousel: React.FC<CourseRowProps> = ({ title, courses, type = 'course' }) => {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  
  // Função para rolagem horizontal
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainer.current) {
      const scrollAmount = 320; // Largura aproximada de card + margem
      
      if (direction === 'left') {
        scrollContainer.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainer.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };
  
  // Monitorar posição do scroll para exibir/ocultar setas
  const handleScroll = () => {
    if (!scrollContainer.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.current;
    
    // Mostrar botão esquerdo se tiver rolado para longe do início
    setShowLeftButton(scrollLeft > 20);
    
    // Ocultar botão direito quando chegar ao final
    setShowRightButton(scrollLeft < scrollWidth - clientWidth - 20);
  };

  return (
    <div className="mb-16">
      <h2 className="text-2xl font-bold mb-4 px-4 text-white">{title}</h2>
      
      <div className="relative">
        {/* Botão para rolar para a esquerda */}
        {showLeftButton && (
          <Button 
            className="absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 z-10 rounded-full p-2 h-10 w-10"
            onClick={() => scroll('left')}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>
        )}
        
        {/* Container dos cards com rolagem horizontal */}
        <div 
          ref={scrollContainer}
          className="flex overflow-x-auto hide-scrollbar gap-4 px-4 py-2"
          onScroll={handleScroll}
        >
          {courses.map((course, index) => (
            <Link 
              to={`/${type}/${course.slug || course.id}`} 
              key={course.id}
              className="flex-shrink-0 w-72 transition-transform duration-300 hover:scale-105"
            >
              <Card className="h-[380px] border-none relative overflow-hidden group">
                <img 
                  src={course.coverImageUrl} 
                  alt={course.title}
                  className="w-full h-full object-cover rounded-md transition-all duration-500 group-hover:brightness-75"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{course.title}</h3>
                  
                  {course.instructor && (
                    <p className="text-sm text-white/80 mb-2">{course.instructor}</p>
                  )}
                  
                  {course.date && (
                    <div className="flex items-center text-xs text-white/70 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{course.date}</span>
                    </div>
                  )}
                  
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute inset-0 flex items-center justify-center">
                    <Button variant="default" size="lg" className="rounded-full w-16 h-16 bg-viverblue hover:bg-viverblue/90">
                      <Play fill="white" className="h-8 w-8" />
                    </Button>
                  </div>
                </div>
                
                <div className="absolute top-3 right-3">
                  <span className="bg-viverblue text-white text-xs px-2 py-1 rounded-sm">
                    {index + 1}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        
        {/* Botão para rolar para a direita */}
        {showRightButton && (
          <Button 
            className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/70 hover:bg-black/90 z-10 rounded-full p-2 h-10 w-10"
            onClick={() => scroll('right')}
            size="icon"
            variant="ghost"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default CoursesCarousel;

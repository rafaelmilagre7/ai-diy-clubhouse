
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, 
  Clock, 
  Star, 
  BookOpen, 
  Target, 
  Zap, 
  Award,
  Play,
  CheckCircle,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface InteractiveTrailCardProps {
  item: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    category?: string;
    difficulty?: string;
    priority?: number;
    estimatedTime?: number;
    tags?: string[];
    type: 'solution' | 'lesson';
    isCompleted?: boolean;
    isFavorited?: boolean;
  };
  onClick: (id: string) => void;
  onFavorite?: (id: string) => void;
}

export const InteractiveTrailCard: React.FC<InteractiveTrailCardProps> = ({
  item,
  onClick,
  onFavorite
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPriorityConfig = () => {
    switch (item.priority) {
      case 1:
        return {
          gradient: "from-viverblue/20 to-emerald-400/10",
          border: "border-viverblue/40",
          badge: "bg-viverblue/20 text-viverblue",
          icon: Target,
          label: "Alta Prioridade"
        };
      case 2:
        return {
          gradient: "from-amber-500/20 to-orange-400/10",
          border: "border-amber-500/40",
          badge: "bg-amber-500/20 text-amber-400",
          icon: Zap,
          label: "Prioridade Média"
        };
      case 3:
        return {
          gradient: "from-gray-600/20 to-gray-500/10",
          border: "border-gray-600/40",
          badge: "bg-gray-600/20 text-gray-300",
          icon: Award,
          label: "Complementar"
        };
      default:
        return {
          gradient: "from-gray-700/20 to-gray-600/10",
          border: "border-gray-700/30",
          badge: "bg-gray-700/20 text-gray-300",
          icon: BookOpen,
          label: "Recomendado"
        };
    }
  };

  const getDifficultyColor = () => {
    switch (item.difficulty?.toLowerCase()) {
      case 'easy':
      case 'beginner':
        return "text-emerald-400 bg-emerald-400/10";
      case 'medium':
      case 'intermediate':
        return "text-amber-400 bg-amber-400/10";
      case 'hard':
      case 'advanced':
        return "text-red-400 bg-red-400/10";
      default:
        return "text-gray-400 bg-gray-400/10";
    }
  };

  const config = getPriorityConfig();
  const PriorityIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card 
        className={cn(
          "group cursor-pointer transition-all duration-300 border-0 overflow-hidden",
          "bg-gradient-to-br backdrop-blur-sm",
          config.gradient,
          config.border,
          isHovered && "shadow-xl shadow-viverblue/10",
          item.isCompleted && "ring-2 ring-emerald-400/50"
        )}
        onClick={() => onClick(item.id)}
      >
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              {item.thumbnail_url ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-16 h-16 rounded-xl object-cover ring-2 ring-gray-700/50"
                />
              ) : (
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center",
                  "bg-gradient-to-br from-viverblue/20 to-emerald-400/10"
                )}>
                  {item.type === 'lesson' ? (
                    <Play className="h-6 w-6 text-viverblue" />
                  ) : (
                    <Target className="h-6 w-6 text-viverblue" />
                  )}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Header with badges */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={cn("text-xs", config.badge)} variant="outline">
                    <PriorityIcon className="h-3 w-3 mr-1" />
                    {config.label}
                  </Badge>
                  
                  {item.difficulty && (
                    <Badge className={cn("text-xs", getDifficultyColor())} variant="outline">
                      {item.difficulty}
                    </Badge>
                  )}

                  {item.type === 'lesson' && (
                    <Badge className="text-xs bg-blue-500/20 text-blue-400" variant="outline">
                      <BookOpen className="h-3 w-3 mr-1" />
                      Aula
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {item.isCompleted && (
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                  )}
                  {onFavorite && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-700/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavorite(item.id);
                      }}
                    >
                      <Heart 
                        className={cn(
                          "h-4 w-4",
                          item.isFavorited ? "fill-red-400 text-red-400" : "text-gray-400"
                        )} 
                      />
                    </Button>
                  )}
                </div>
              </div>

              {/* Title */}
              <h3 className="font-semibold text-white mb-2 group-hover:text-viverblue transition-colors line-clamp-2">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {item.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  {item.estimatedTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {item.estimatedTime}min
                    </div>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {item.tags[0]}
                    </div>
                  )}
                </div>

                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="h-4 w-4 text-viverblue" />
                </motion.div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

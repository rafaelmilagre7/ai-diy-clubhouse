
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLessonNPS } from "@/hooks/learning/useLessonNPS";
import { useSimpleAuth } from "@/contexts/auth/SimpleAuthProvider";
import { Star } from "lucide-react";

interface LessonNPSFormProps {
  lessonId: string;
  onNPSSubmitted?: () => void;
}

export const LessonNPSForm = ({ lessonId, onNPSSubmitted }: LessonNPSFormProps) => {
  const { user } = useSimpleAuth();
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState("");
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  
  const {
    existingNPS,
    isLoading,
    submitNPS,
    getUserNPS,
    isSubmitting
  } = useLessonNPS(lessonId);

  useEffect(() => {
    if (user?.id) {
      getUserNPS(user.id);
    }
  }, [user?.id, getUserNPS]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    const success = await submitNPS(rating, feedback);
    if (success) {
      setRating(0);
      setFeedback("");
      onNPSSubmitted?.();
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingNPS) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Obrigado pela sua avaliação!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Sua avaliação de {existingNPS.rating}/10 foi registrada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Avalie esta lição</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              De 0 a 10, o quanto você recomendaria esta lição?
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`w-10 h-10 rounded border-2 transition-colors ${
                    value <= (hoveredRating || rating)
                      ? "bg-yellow-400 border-yellow-400 text-white"
                      : "border-gray-300 hover:border-yellow-400"
                  }`}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Comentários adicionais (opcional)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Compartilhe seus comentários sobre esta lição..."
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={rating === 0 || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

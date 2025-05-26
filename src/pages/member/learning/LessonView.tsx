
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Pause,
  Volume2,
  Maximize,
  BookOpen,
  MessageSquare,
  Download,
  Clock
} from 'lucide-react';

const LessonView = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  // Mock data - in real app, fetch based on course and lesson IDs
  const course = {
    id: courseId,
    title: "Fundamentos de IA para Negócios",
    progress: 65,
    totalLessons: 12,
    completedLessons: 8
  };

  const lesson = {
    id: lessonId,
    title: "O que é IA?",
    description: "Nesta aula, você aprenderá os conceitos fundamentais da Inteligência Artificial e como ela se aplica no mundo dos negócios.",
    duration: "15 min",
    videoUrl: "https://example.com/video", // In real app, this would be a real video URL
    transcription: `
Bem-vindos à primeira aula do nosso curso sobre Fundamentos de IA para Negócios.

Nesta aula, vamos explorar o que é realmente a Inteligência Artificial e por que ela é tão importante para o mundo dos negócios hoje.

A IA é uma tecnologia que permite que máquinas realizem tarefas que tradicionalmente requeriam inteligência humana...
    `.trim(),
    resources: [
      { name: "Slides da Aula", type: "PDF", url: "#" },
      { name: "Material Complementar", type: "PDF", url: "#" },
      { name: "Exercícios Práticos", type: "DOC", url: "#" }
    ],
    nextLessonId: "2",
    prevLessonId: null,
    completed: false
  };

  const handleMarkComplete = () => {
    // In real app, mark lesson as completed in backend
    console.log("Lesson marked as complete");
    if (lesson.nextLessonId) {
      navigate(`/learning/curso/${courseId}/aula/${lesson.nextLessonId}`);
    } else {
      navigate(`/learning/curso/${courseId}`);
    }
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const targetId = direction === 'next' ? lesson.nextLessonId : lesson.prevLessonId;
    if (targetId) {
      navigate(`/learning/curso/${courseId}/aula/${targetId}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black text-white">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-white hover:bg-gray-800">
              <Link to={`/learning/curso/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Curso
              </Link>
            </Button>
            <div>
              <h1 className="font-semibold">{lesson.title}</h1>
              <p className="text-sm text-gray-400">{course.title}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Aula {lessonId} de {course.totalLessons}
            </span>
            <Progress value={(parseInt(lessonId || '1') / course.totalLessons) * 100} className="w-32" />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 h-[calc(100vh-80px)]">
          {/* Video Player */}
          <div className="lg:col-span-3 bg-black flex items-center justify-center">
            <div className="w-full max-w-4xl aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative">
              {/* Mock Video Player */}
              <div className="text-white text-center">
                <div className="text-6xl mb-4">🎥</div>
                <h3 className="text-xl font-semibold mb-2">{lesson.title}</h3>
                <p className="text-gray-400 mb-4">{lesson.description}</p>
                
                {/* Video Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-gray-800"
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </Button>
                  <span className="text-sm">0:00 / {lesson.duration}</span>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white border-l overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Lesson Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                </div>
                <h2 className="font-semibold text-lg mb-2">{lesson.title}</h2>
                <p className="text-sm text-muted-foreground">{lesson.description}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button className="w-full" onClick={handleMarkComplete}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Concluída
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowNotes(!showNotes)}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {showNotes ? 'Ocultar' : 'Ver'} Transcrição
                </Button>
              </div>

              {/* Navigation */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleNavigation('prev')}
                  disabled={!lesson.prevLessonId}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleNavigation('next')}
                  disabled={!lesson.nextLessonId}
                >
                  Próxima
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              {/* Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Materiais da Aula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lesson.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Download className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{resource.name}</p>
                          <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Transcription */}
              {showNotes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Transcrição da Aula</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-2 max-h-60 overflow-y-auto">
                      {lesson.transcription.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Discussion */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Discussão
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Dúvidas sobre esta aula? Discuta com outros alunos.
                  </p>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/comunidade">
                      Ir para o Fórum
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;

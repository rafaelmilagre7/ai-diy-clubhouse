
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth';
import AulaPlayer from '@/components/learning/member/AulaPlayer';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const MemberAulaPage: React.FC = () => {
  const { aulaId } = useParams<{ aulaId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState<any>(null);
  const [nextAula, setNextAula] = useState<any>(null);
  const [prevAula, setPrevAula] = useState<any>(null);
  const [modulo, setModulo] = useState<any>(null);
  
  useEffect(() => {
    const fetchAula = async () => {
      try {
        setLoading(true);
        
        if (!aulaId) {
          toast.error('ID da aula não fornecido');
          return;
        }
        
        // Buscar a aula atual
        const { data: aulaData, error: aulaError } = await supabase
          .from('learning_lessons')
          .select(`
            id,
            title,
            description,
            cover_image_url,
            module_id
          `)
          .eq('id', aulaId)
          .eq('published', true)
          .single();
        
        if (aulaError || !aulaData) {
          console.error('Erro ao carregar aula:', aulaError);
          toast.error('Erro ao carregar a aula');
          return;
        }
        
        // Buscar o módulo
        const { data: moduloData } = await supabase
          .from('learning_modules')
          .select(`
            id,
            title,
            course_id
          `)
          .eq('id', aulaData.module_id)
          .single();
        
        setModulo(moduloData);
        
        // Buscar vídeos da aula
        const { data: videosData } = await supabase
          .from('learning_lesson_videos')
          .select('*')
          .eq('lesson_id', aulaId)
          .order('order_index', { ascending: true });
        
        // Buscar materiais da aula
        const { data: materiaisData } = await supabase
          .from('learning_resources')
          .select('*')
          .eq('lesson_id', aulaId)
          .order('order_index', { ascending: true });
        
        // Buscar aulas anterior e próxima no mesmo módulo
        const { data: aulasModulo } = await supabase
          .from('learning_lessons')
          .select('id, title, order_index')
          .eq('module_id', aulaData.module_id)
          .eq('published', true)
          .order('order_index', { ascending: true });
        
        if (aulasModulo && aulasModulo.length > 0) {
          const currentIndex = aulasModulo.findIndex(a => a.id === aulaId);
          
          if (currentIndex > 0) {
            setPrevAula(aulasModulo[currentIndex - 1]);
          }
          
          if (currentIndex < aulasModulo.length - 1) {
            setNextAula(aulasModulo[currentIndex + 1]);
          }
        }
        
        // Atualizar progresso do usuário
        if (user) {
          const { error: progressError } = await supabase
            .from('learning_progress')
            .upsert({
              user_id: user.id,
              lesson_id: aulaId,
              started_at: new Date().toISOString(),
              progress_percentage: 10, // Inicial
            }, { onConflict: 'user_id,lesson_id' });
          
          if (progressError) {
            console.error('Erro ao registrar progresso:', progressError);
          }
        }
        
        // Construir objeto completo da aula
        const aulaCompleta = {
          ...aulaData,
          videos: videosData || [],
          materials: materiaisData || [],
        };
        
        setAula(aulaCompleta);
      } catch (error) {
        console.error('Erro ao carregar dados da aula:', error);
        toast.error('Ocorreu um erro ao carregar a aula');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAula();
  }, [aulaId, user]);
  
  const handleVoltar = () => {
    if (modulo?.course_id) {
      navigate(`/membro/curso/${modulo.course_id}`);
    } else {
      navigate('/membro/cursos');
    }
  };
  
  const handleNextAula = () => {
    if (nextAula?.id) {
      navigate(`/membro/aula/${nextAula.id}`);
    }
  };
  
  const handlePrevAula = () => {
    if (prevAula?.id) {
      navigate(`/membro/aula/${prevAula.id}`);
    }
  };
  
  if (loading) {
    return (
      <div className="container max-w-5xl py-8 space-y-6">
        <Button variant="ghost" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-[400px] w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }
  
  if (!aula) {
    return (
      <div className="container max-w-5xl py-8">
        <Button variant="ghost" onClick={handleVoltar} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Aula não encontrada</h2>
          <p className="text-muted-foreground">
            A aula que você está tentando acessar não existe ou foi removida.
          </p>
          <Button onClick={handleVoltar} className="mt-4">
            Voltar para cursos
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl py-8 space-y-6">
      <div>
        <Button variant="ghost" onClick={handleVoltar} className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Voltar para o curso
        </Button>
        
        {modulo && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">{modulo.title}</p>
            <h1 className="text-2xl font-bold">{aula.title}</h1>
          </div>
        )}
      </div>
      
      <AulaPlayer
        aula={aula}
        onNext={nextAula ? handleNextAula : undefined}
        onPrevious={prevAula ? handlePrevAula : undefined}
        isFirst={!prevAula}
        isLast={!nextAula}
      />
    </div>
  );
};

export default MemberAulaPage;

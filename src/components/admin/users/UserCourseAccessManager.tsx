import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Shield, ShieldCheck, ShieldX, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUserCourseAccess, CourseAccessStatus } from '@/hooks/admin/useUserCourseAccess';
import { UserProfile } from '@/lib/supabase';

interface UserCourseAccessManagerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export const UserCourseAccessManager: React.FC<UserCourseAccessManagerProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [courses, setCourses] = useState<CourseAccessStatus[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseAccessStatus | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>();
  const [notes, setNotes] = useState('');
  const [showExpiry, setShowExpiry] = useState(false);
  
  const {
    loading,
    getUserCourseAccess,
    grantCourseAccess,
    denyCourseAccess,
    removeOverride
  } = useUserCourseAccess();

  // Carregar dados quando abrir o modal
  useEffect(() => {
    if (isOpen && user.id) {
      loadCourseAccess();
    }
  }, [isOpen, user.id]);

  const loadCourseAccess = async () => {
    const courseStatuses = await getUserCourseAccess(user.id);
    setCourses(courseStatuses);
  };

  const handleGrantAccess = async () => {
    if (!selectedCourse) return;
    
    const success = await grantCourseAccess(
      user.id,
      selectedCourse.course.id,
      expiryDate,
      notes.trim() || undefined
    );
    
    if (success) {
      await loadCourseAccess();
      setSelectedCourse(null);
      setExpiryDate(undefined);
      setNotes('');
      setShowExpiry(false);
    }
  };

  const handleDenyAccess = async () => {
    if (!selectedCourse) return;
    
    const success = await denyCourseAccess(
      user.id,
      selectedCourse.course.id,
      notes.trim() || undefined
    );
    
    if (success) {
      await loadCourseAccess();
      setSelectedCourse(null);
      setNotes('');
    }
  };

  const handleRemoveOverride = async () => {
    if (!selectedCourse) return;
    
    const success = await removeOverride(user.id, selectedCourse.course.id);
    
    if (success) {
      await loadCourseAccess();
      setSelectedCourse(null);
      setNotes('');
    }
  };

  const getAccessBadge = (courseStatus: CourseAccessStatus) => {
    if (courseStatus.hasOverride) {
      if (courseStatus.overrideType === 'granted') {
        const isExpired = courseStatus.overrideExpiresAt && 
          new Date(courseStatus.overrideExpiresAt) <= new Date();
        
        return (
          <Badge variant={isExpired ? "outline" : "default"} className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
            <ShieldCheck className="w-3 h-3 mr-1" />
            {isExpired ? 'Expirado' : 'Concedido'}
          </Badge>
        );
      } else {
        return (
          <Badge variant="destructive" className="bg-red-500/10 text-red-700 border-red-500/20">
            <ShieldX className="w-3 h-3 mr-1" />
            Negado
          </Badge>
        );
      }
    }
    
    if (courseStatus.hasRoleAccess) {
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/20">
          <Shield className="w-3 h-3 mr-1" />
          Por Papel
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Sem Acesso
      </Badge>
    );
  };

  const resetForm = () => {
    setSelectedCourse(null);
    setExpiryDate(undefined);
    setNotes('');
    setShowExpiry(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            📚 Gerenciar Acesso aos Cursos - {user.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Papel atual: <strong>{user.user_roles?.name || 'Não definido'}</strong>
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando cursos...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Cursos */}
            <div className="space-y-4">
              <h3 className="font-semibold">Cursos Disponíveis</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {courses.map((courseStatus) => (
                  <div
                    key={courseStatus.course.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm",
                      selectedCourse?.course.id === courseStatus.course.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedCourse(courseStatus)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {courseStatus.course.title}
                        </h4>
                        {courseStatus.course.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {courseStatus.course.description}
                          </p>
                        )}
                        {courseStatus.overrideExpiresAt && (
                          <p className="text-xs text-amber-600 mt-1">
                            Expira: {format(new Date(courseStatus.overrideExpiresAt), 'dd/MM/yyyy', { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        {getAccessBadge(courseStatus)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Painel de Ações */}
            <div className="space-y-4">
              <h3 className="font-semibold">Gerenciar Acesso</h3>
              
              {selectedCourse ? (
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-medium mb-2">{selectedCourse.course.title}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Acesso por papel:</span>
                        <span className={selectedCourse.hasRoleAccess ? "text-emerald-600" : "text-red-600"}>
                          {selectedCourse.hasRoleAccess ? "Sim" : "Não"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Override ativo:</span>
                        <span className={selectedCourse.hasOverride ? "text-blue-600" : "text-muted-foreground"}>
                          {selectedCourse.hasOverride ? `${selectedCourse.overrideType}` : "Nenhum"}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Acesso final:</span>
                        <span className={selectedCourse.finalAccess ? "text-emerald-600" : "text-red-600"}>
                          {selectedCourse.finalAccess ? "Permitido" : "Negado"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Formulário de Ações */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Motivo para esta ação..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    {/* Opção de Data de Expiração */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showExpiry"
                        checked={showExpiry}
                        onChange={(e) => setShowExpiry(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="showExpiry" className="text-sm">
                        Definir data de expiração
                      </Label>
                    </div>

                    {showExpiry && (
                      <div>
                        <Label>Data de Expiração</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal mt-1",
                                !expiryDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {expiryDate ? format(expiryDate, 'dd/MM/yyyy', { locale: ptBR }) : "Selecionar data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={expiryDate}
                              onSelect={setExpiryDate}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}

                    <Separator />

                    {/* Botões de Ação */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        onClick={handleGrantAccess}
                        disabled={loading}
                        className="w-full"
                        size="sm"
                      >
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Conceder
                      </Button>
                      
                      <Button
                        onClick={handleDenyAccess}
                        disabled={loading}
                        variant="destructive"
                        className="w-full"
                        size="sm"
                      >
                        <ShieldX className="w-4 h-4 mr-2" />
                        Negar
                      </Button>
                    </div>

                    {selectedCourse.hasOverride && (
                      <Button
                        onClick={handleRemoveOverride}
                        disabled={loading}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Remover Override
                      </Button>
                    )}

                    <Button
                      onClick={resetForm}
                      variant="ghost"
                      className="w-full"
                      size="sm"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Selecione um curso para gerenciar o acesso</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface LMSSettings {
  platform_name: string;
  default_course_duration: number;
  auto_certificate_generation: boolean;
  email_notifications: boolean;
  student_progress_tracking: boolean;
  course_completion_threshold: number;
}

const FormacaoConfiguracoes = () => {
  const [settings, setSettings] = useState<LMSSettings>({
    platform_name: 'Viver de IA Learning',
    default_course_duration: 60,
    auto_certificate_generation: true,
    email_notifications: true,
    student_progress_tracking: true,
    course_completion_threshold: 80
  });
  
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Configurações LMS</h1>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações Gerais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform_name">Nome da Plataforma</Label>
              <Input
                id="platform_name"
                value={settings.platform_name}
                onChange={(e) => setSettings(prev => ({ ...prev, platform_name: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="default_duration">Duração Padrão do Curso (minutos)</Label>
              <Input
                id="default_duration"
                type="number"
                value={settings.default_course_duration}
                onChange={(e) => setSettings(prev => ({ ...prev, default_course_duration: parseInt(e.target.value) }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="completion_threshold">Limite de Conclusão do Curso (%)</Label>
              <Input
                id="completion_threshold"
                type="number"
                min="0"
                max="100"
                value={settings.course_completion_threshold}
                onChange={(e) => setSettings(prev => ({ ...prev, course_completion_threshold: parseInt(e.target.value) }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto_certificate">Geração Automática de Certificados</Label>
              <Switch
                id="auto_certificate"
                checked={settings.auto_certificate_generation}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, auto_certificate_generation: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="email_notifications">Notificações por Email</Label>
              <Switch
                id="email_notifications"
                checked={settings.email_notifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="progress_tracking">Acompanhamento de Progresso do Estudante</Label>
              <Switch
                id="progress_tracking"
                checked={settings.student_progress_tracking}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, student_progress_tracking: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FormacaoConfiguracoes;

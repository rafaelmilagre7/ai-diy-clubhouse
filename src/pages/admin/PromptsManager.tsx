import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAIPrompts, AIPrompt } from '@/hooks/admin/useAIPrompts';
import { 
  MessageSquare, 
  Save, 
  RefreshCw, 
  Sparkles,
  ChevronRight,
  Settings,
  Zap,
  Clock,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import LoadingScreen from '@/components/common/LoadingScreen';

const AI_MODELS = [
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (Melhor qualidade)', category: 'google' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash (Balanceado)', category: 'google' },
  { value: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite (Mais rápido)', category: 'google' },
  { value: 'openai/gpt-5', label: 'GPT-5 (Premium)', category: 'openai' },
  { value: 'openai/gpt-5-mini', label: 'GPT-5 Mini (Balanceado)', category: 'openai' },
  { value: 'openai/gpt-5-nano', label: 'GPT-5 Nano (Rápido)', category: 'openai' },
];

const CATEGORIES = [
  { value: 'builder', label: 'Builder', color: 'bg-aurora-primary/10 text-aurora-primary' },
  { value: 'networking', label: 'Networking', color: 'bg-operational/10 text-operational' },
  { value: 'learning', label: 'Learning', color: 'bg-info/10 text-info' },
  { value: 'general', label: 'Geral', color: 'bg-neutral-500/10 text-neutral-400' },
];

export default function PromptsManager() {
  const { prompts, isLoading, updatePrompt } = useAIPrompts();
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<Partial<AIPrompt>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectPrompt = (prompt: AIPrompt) => {
    setSelectedPrompt(prompt);
    setEditedPrompt({
      prompt_content: prompt.prompt_content,
      model: prompt.model,
      temperature: prompt.temperature,
      max_tokens: prompt.max_tokens,
      timeout_seconds: prompt.timeout_seconds,
      retry_attempts: prompt.retry_attempts,
      is_active: prompt.is_active,
    });
  };

  const handleSave = async () => {
    if (!selectedPrompt) return;

    setIsSaving(true);
    try {
      await updatePrompt.mutateAsync({
        id: selectedPrompt.id,
        updates: editedPrompt
      });
      
      // Atualizar o prompt selecionado com as mudanças
      setSelectedPrompt({ ...selectedPrompt, ...editedPrompt });
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!selectedPrompt) return;
    setEditedPrompt({
      prompt_content: selectedPrompt.prompt_content,
      model: selectedPrompt.model,
      temperature: selectedPrompt.temperature,
      max_tokens: selectedPrompt.max_tokens,
      timeout_seconds: selectedPrompt.timeout_seconds,
      retry_attempts: selectedPrompt.retry_attempts,
      is_active: selectedPrompt.is_active,
    });
    toast.info('Alterações descartadas');
  };

  const hasChanges = selectedPrompt && JSON.stringify(editedPrompt) !== JSON.stringify({
    prompt_content: selectedPrompt.prompt_content,
    model: selectedPrompt.model,
    temperature: selectedPrompt.temperature,
    max_tokens: selectedPrompt.max_tokens,
    timeout_seconds: selectedPrompt.timeout_seconds,
    retry_attempts: selectedPrompt.retry_attempts,
    is_active: selectedPrompt.is_active,
  });

  if (isLoading) {
    return <LoadingScreen message="Carregando prompts..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-surface-elevated/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-aurora-primary" />
              Gerenciador de Prompts de IA
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Configure prompts e modelos de IA para todo o sistema
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Sparkles className="h-3 w-3" />
            {prompts?.length || 0} prompts
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Prompts */}
          <Card className="lg:col-span-1 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">Prompts Disponíveis</CardTitle>
              <CardDescription>Selecione um prompt para editar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
              {prompts?.map((prompt) => {
                const category = CATEGORIES.find(c => c.value === prompt.category);
                const isSelected = selectedPrompt?.id === prompt.id;
                
                return (
                  <button
                    key={prompt.id}
                    onClick={() => handleSelectPrompt(prompt)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? 'border-aurora-primary bg-aurora-primary/10' 
                        : 'border-border hover:border-aurora-primary/50 bg-surface-elevated/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {prompt.name}
                          </p>
                          {!prompt.is_active && (
                            <Badge variant="outline" className="text-xs">Inativo</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {prompt.description || 'Sem descrição'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={`text-xs ${category?.color}`}>
                            {category?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">v{prompt.version}</span>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 flex-shrink-0 transition-transform ${
                        isSelected ? 'text-aurora-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Editor */}
          <Card className="lg:col-span-2 border-border bg-card">
            {selectedPrompt ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedPrompt.name}</CardTitle>
                      <CardDescription>{selectedPrompt.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {hasChanges && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                          className="gap-2"
                        >
                          <RotateCcw className="h-4 w-4" />
                          Descartar
                        </Button>
                      )}
                      <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                        className="gap-2"
                      >
                        {isSaving ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Salvar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Configurações de Modelo */}
                  <div className="space-y-4 p-4 bg-surface-elevated/30 rounded-lg border border-border">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Settings className="h-4 w-4 text-aurora-primary" />
                      Configurações do Modelo de IA
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="model" className="flex items-center gap-2">
                          <Sparkles className="h-3 w-3" />
                          Modelo de IA
                        </Label>
                        <Select
                          value={editedPrompt.model}
                          onValueChange={(value) => setEditedPrompt({ ...editedPrompt, model: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                              Google Gemini
                            </div>
                            {AI_MODELS.filter(m => m.category === 'google').map(model => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground mt-2">
                              OpenAI GPT
                            </div>
                            {AI_MODELS.filter(m => m.category === 'openai').map(model => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="temperature" className="flex items-center gap-2">
                          <Zap className="h-3 w-3" />
                          Temperature (0-2)
                        </Label>
                        <Input
                          id="temperature"
                          type="number"
                          step="0.1"
                          min="0"
                          max="2"
                          placeholder="Padrão do modelo"
                          value={editedPrompt.temperature ?? ''}
                          onChange={(e) => setEditedPrompt({ 
                            ...editedPrompt, 
                            temperature: e.target.value ? parseFloat(e.target.value) : null 
                          })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Deixe vazio para usar padrão
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timeout" className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Timeout (segundos)
                        </Label>
                        <Input
                          id="timeout"
                          type="number"
                          min="1"
                          max="60"
                          value={editedPrompt.timeout_seconds ?? 15}
                          onChange={(e) => setEditedPrompt({ 
                            ...editedPrompt, 
                            timeout_seconds: parseInt(e.target.value) 
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="retry" className="flex items-center gap-2">
                          <RefreshCw className="h-3 w-3" />
                          Tentativas (retry)
                        </Label>
                        <Input
                          id="retry"
                          type="number"
                          min="0"
                          max="5"
                          value={editedPrompt.retry_attempts ?? 2}
                          onChange={(e) => setEditedPrompt({ 
                            ...editedPrompt, 
                            retry_attempts: parseInt(e.target.value) 
                          })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="max_tokens">
                          Max Tokens
                        </Label>
                        <Input
                          id="max_tokens"
                          type="number"
                          placeholder="Padrão do modelo"
                          value={editedPrompt.max_tokens ?? ''}
                          onChange={(e) => setEditedPrompt({ 
                            ...editedPrompt, 
                            max_tokens: e.target.value ? parseInt(e.target.value) : null 
                          })}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={editedPrompt.is_active ?? true}
                          onCheckedChange={(checked) => setEditedPrompt({ 
                            ...editedPrompt, 
                            is_active: checked 
                          })}
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                          Prompt Ativo
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Editor de Prompt */}
                  <div className="space-y-2">
                    <Label htmlFor="prompt_content">Conteúdo do Prompt</Label>
                    <Textarea
                      id="prompt_content"
                      value={editedPrompt.prompt_content ?? ''}
                      onChange={(e) => setEditedPrompt({ 
                        ...editedPrompt, 
                        prompt_content: e.target.value 
                      })}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="Digite o prompt aqui..."
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{editedPrompt.prompt_content?.length || 0} caracteres</span>
                      <span>~{Math.ceil((editedPrompt.prompt_content?.length || 0) / 4)} tokens</span>
                    </div>
                  </div>

                  {/* Metadados */}
                  <div className="pt-4 border-t border-border">
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Key:</span> {selectedPrompt.key}
                      </div>
                      <div>
                        <span className="font-medium">Versão:</span> {selectedPrompt.version}
                      </div>
                      <div>
                        <span className="font-medium">Criado:</span>{' '}
                        {new Date(selectedPrompt.created_at).toLocaleString('pt-BR')}
                      </div>
                      <div>
                        <span className="font-medium">Atualizado:</span>{' '}
                        {new Date(selectedPrompt.updated_at).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[600px]">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um prompt para começar a editar</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

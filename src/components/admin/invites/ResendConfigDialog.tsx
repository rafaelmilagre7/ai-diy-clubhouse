
import { useState } from 'react';
import { Settings, Key, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useResendConfig } from '@/hooks/admin/invites/useResendConfig';

export const ResendConfigDialog = () => {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { configureResendKey, isConfiguring } = useResendConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    const success = await configureResendKey(apiKey);
    if (success) {
      setApiKey('');
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Configurar Resend
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Configurar Chave Resend API
            </DialogTitle>
            <DialogDescription>
              Configure sua chave da API do Resend para envio de emails de convite.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>Para configurar o Resend:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Acesse <a href="https://resend.com/api-keys" target="_blank" className="text-blue-600 hover:underline">resend.com/api-keys</a></li>
                    <li>Crie uma nova API Key</li>
                    <li>Valide seu domínio em <a href="https://resend.com/domains" target="_blank" className="text-blue-600 hover:underline">resend.com/domains</a></li>
                    <li>Cole a chave abaixo</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid gap-2">
              <Label htmlFor="apiKey">Chave da API Resend</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="re_..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                A chave será armazenada de forma segura no Supabase Edge Functions
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isConfiguring || !apiKey.trim()}>
              {isConfiguring ? "Configurando..." : "Configurar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

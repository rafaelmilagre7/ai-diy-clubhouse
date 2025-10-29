import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToastModern } from "@/hooks/useToastModern";
import { useOrganization } from '@/hooks/useOrganization';
import { Building, Users, Crown } from 'lucide-react';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  planType: string;
}

export const CreateOrganizationDialog = ({ 
  open, 
  onOpenChange 
}: CreateOrganizationDialogProps) => {
  const { createOrganization } = useOrganization();
  const { showSuccess, showError } = useToastModern();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      planType: 'basic'
    }
  });

  const selectedPlan = watch('planType');

  const plans = [
    {
      id: 'basic',
      name: 'Básico',
      maxUsers: 5,
      price: 'Gratuito',
      description: 'Ideal para equipes pequenas'
    },
    {
      id: 'premium',
      name: 'Premium',
      maxUsers: 20,
      price: 'R$ 99/mês',
      description: 'Para equipes em crescimento'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      maxUsers: 50,
      price: 'R$ 299/mês',
      description: 'Para grandes organizações'
    }
  ];

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const result = await createOrganization(data.name, data.planType);
      if (result) {
        showSuccess("Organização criada!", `${data.name} foi criada com sucesso.`);
        onOpenChange(false);
      }
    } catch (error) {
      showError("Erro ao criar organização", "Tente novamente em alguns instantes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Criar Organização
          </DialogTitle>
          <DialogDescription>
            Configure sua organização para começar a gerenciar sua equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome da Organização */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Organização *</Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                placeholder="Ex: Minha Empresa Ltda"
                className="pl-10"
                {...register("name", { 
                  required: "Nome da organização é obrigatório",
                  minLength: { value: 2, message: "Nome deve ter pelo menos 2 caracteres" }
                })}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Seleção de Plano */}
          <div className="space-y-3">
            <Label>Escolha seu Plano</Label>
            <div className="grid gap-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlan === plan.id 
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                  onClick={() => setValue('planType', plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPlan === plan.id 
                          ? 'border-primary bg-primary' 
                          : 'border-muted-foreground'
                      }`}>
                        {selectedPlan === plan.id && (
                          <div className="w-full h-full rounded-full bg-primary scale-50"></div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{plan.price}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {plan.maxUsers} usuários
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Criando..." : "Criar Organização"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
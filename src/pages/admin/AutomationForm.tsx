import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Save, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToastModern } from "@/hooks/useToastModern";
import { supabase } from "@/integrations/supabase/client";
import { UnifiedAutomationForm } from "@/components/automations/UnifiedAutomationForm";

interface AutomationFormData {
  name: string;
  description: string;
  rule_type: string;
  is_active: boolean;
  priority: number;
  conditions: any;
  actions: any[];
}

const AutomationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastModern();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<AutomationFormData>({
    defaultValues: {
      name: "",
      description: "",
      rule_type: "webhook",
      is_active: true,
      priority: 1,
      conditions: {},
      actions: []
    }
  });

  const watchedValues = watch();

  useEffect(() => {
    if (isEditing) {
      loadRule();
    }
  }, [id]);

  const loadRule = async () => {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setValue('name', data.name);
        setValue('description', data.description || '');
        setValue('rule_type', data.rule_type);
        setValue('is_active', data.is_active);
        setValue('priority', data.priority);
        setValue('conditions', data.conditions);
        setValue('actions', data.actions);
      }
    } catch (error) {
      showError("Erro", "Não foi possível carregar a regra");
      navigate('/admin/automations');
    }
  };

  const onSubmit = async (data: AutomationFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      let error;
      if (isEditing) {
        ({ error } = await supabase
          .from('automation_rules')
          .update(payload)
          .eq('id', id));
      } else {
        ({ error } = await supabase
          .from('automation_rules')
          .insert([payload]));
      }

      if (error) throw error;

      showSuccess("Sucesso", `Regra ${isEditing ? 'atualizada' : 'criada'} com sucesso`);

      navigate('/admin/automations');
    } catch (error) {
      showError("Erro", `Não foi possível ${isEditing ? 'atualizar' : 'criar'} a regra`);
    } finally {
      setLoading(false);
    }
  };

  const testRule = async () => {
    showSuccess("Teste iniciado", "Executando teste da regra com dados mock...");
    // TODO: Implementar lógica de teste
  };

  return <UnifiedAutomationForm />;
};

export default AutomationForm;
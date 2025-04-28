
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useOnboardingStats } from "@/hooks/admin/useOnboardingStats"
import { UsersIcon, CheckCircle, AlertCircle, Clock } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Badge } from "@/components/ui/badge"

export const OnboardingOverview = () => {
  const { stats, loading } = useOnboardingStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-[180px] w-full" />
          <Skeleton className="h-[180px] w-full" />
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const getStepLabel = (step: string) => {
    const stepLabels: Record<string, string> = {
      'personal': 'Dados Pessoais',
      'professional': 'Dados Profissionais',
      'business_context': 'Contexto do Negócio',
      'business_goals': 'Objetivos',
      'ai_experience': 'Experiência com IA',
      'experience_personalization': 'Personalização',
      'complementary_info': 'Informações Complementares',
      'review': 'Revisão',
      'completed': 'Concluído'
    };
    return stepLabels[step] || step;
  };

  const getStepBadgeColor = (step: string, isCompleted: boolean) => {
    if (isCompleted) return "bg-green-500";
    switch (step) {
      case 'personal':
        return "bg-blue-500";
      case 'professional':
        return "bg-purple-500";
      case 'business_context':
        return "bg-yellow-500";
      case 'business_goals':
        return "bg-indigo-500";
      case 'ai_experience':
        return "bg-pink-500";
      case 'experience_personalization':
        return "bg-orange-500";
      case 'complementary_info':
        return "bg-teal-500";
      case 'review':
        return "bg-cyan-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Progresso de Onboarding</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <UsersIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total de Usuários:</span>
                  <span className="font-medium">{stats.totalUsers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Onboarding Concluído:</span>
                  <span className="font-medium">{stats.completedOnboarding}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">Taxa de Conclusão:</span>
                  <span className="font-medium">{stats.completionRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Usuários Pendentes</p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">Aguardando Conclusão:</span>
                  <span className="font-medium">{stats.pendingUsers}</span>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <p className="text-sm text-muted-foreground">Distribuição por Etapa:</p>
                  {Object.entries(stats.usersByStep).map(([step, count]) => (
                    <div key={step} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{getStepLabel(step)}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Detalhamento por Usuário</h3>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Etapa Atual</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Última Atividade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.company_name || '-'}</TableCell>
                  <TableCell>
                    <Badge 
                      className={getStepBadgeColor(user.current_step, user.is_completed)}
                    >
                      {getStepLabel(user.current_step)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.is_completed ? (
                      <Badge className="bg-green-500">Concluído</Badge>
                    ) : (
                      <Badge variant="outline">Em Andamento</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.started_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.last_activity), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

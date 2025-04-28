
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useOnboardingStats } from "@/hooks/admin/useOnboardingStats"
import { UsersIcon, CheckCircle, AlertCircle, Clock } from "lucide-react"

export const OnboardingOverview = () => {
  const { stats, loading } = useOnboardingStats();

  if (loading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Skeleton className="h-[180px] w-full" />
        <Skeleton className="h-[180px] w-full" />
      </div>
    )
  }

  return (
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
                    <span className="text-muted-foreground capitalize">{step.replace('_', ' ')}:</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}


import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReferralDialog } from "./ReferralDialog";
import { useReferrals } from "@/hooks/referrals/useReferrals";
import { UserPlus, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export function ReferralWidget() {
  const { stats, loading } = useReferrals();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Programa de Indicação</span>
          <UserPlus className="h-4 w-4 text-muted-foreground" />
        </CardTitle>
        <CardDescription>
          Indique amigos e ganhe benefícios exclusivos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-pulse text-muted-foreground">Carregando...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Total de Indicações</div>
                  <div className="text-xl font-bold">{stats.total}</div>
                </div>
                <div className="p-3 border rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">Concluídas</div>
                  <div className="text-xl font-bold">{stats.completed}</div>
                </div>
              </div>

              <div className="space-y-3">
                <ReferralDialog />
                <Link to="/referrals">
                  <Button variant="outline" className="w-full gap-2 text-sm">
                    <span>Ver indicações</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

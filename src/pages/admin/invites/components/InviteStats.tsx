
import { Mail, Users, Clock, CheckCircle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Invite } from "@/hooks/admin/invites/types";

interface InviteStatsProps {
  invites: Invite[];
}

const InviteStats = ({ invites }: InviteStatsProps) => {
  const totalInvites = invites.length;
  const usedInvites = invites.filter(invite => invite.used_at).length;
  const activeInvites = invites.filter(invite => 
    !invite.used_at && new Date(invite.expires_at) > new Date()
  ).length;
  const expiredInvites = invites.filter(invite => 
    !invite.used_at && new Date(invite.expires_at) <= new Date()
  ).length;

  const conversionRate = totalInvites > 0 ? Math.round((usedInvites / totalInvites) * 100) : 0;

  const stats = [
    {
      label: "Total de Convites",
      value: totalInvites,
      icon: Mail,
      gradient: "from-aurora/20 to-aurora-primary/10",
      iconColor: "text-aurora",
      border: "border-aurora/30",
      glow: "aurora-glow"
    },
    {
      label: "Convites Utilizados",
      value: usedInvites,
      icon: CheckCircle,
      gradient: "from-green-500/20 to-emerald-500/10",
      iconColor: "text-green-500",
      border: "border-green-500/30",
      glow: "hover:shadow-green-500/20"
    },
    {
      label: "Convites Ativos",
      value: activeInvites,
      icon: Clock,
      gradient: "from-warning/20 to-warning-light/10",
      iconColor: "text-warning",
      border: "border-warning/30",
      glow: "hover:shadow-amber-500/20"
    },
    {
      label: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      gradient: "from-revenue/20 to-operational/10",
      iconColor: "text-revenue",
      border: "border-revenue/30",
      glow: "hover:shadow-revenue/20"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={stat.label} 
          className={`aurora-glass rounded-2xl border ${stat.border} backdrop-blur-md overflow-hidden group cursor-pointer transition-all duration-500 hover:scale-[1.02] ${stat.glow} hover:shadow-2xl animate-fade-in`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Gradient Header */}
          <div className={`bg-gradient-to-r ${stat.gradient} p-4 border-b border-border/30`}>
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-xl aurora-glass bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold aurora-text-gradient group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {stat.label}
            </p>
            
            {/* Progress indicator for conversion rate */}
            {stat.label.includes("Conversão") && (
              <div className="mt-3">
                <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-revenue to-operational rounded-full transition-all duration-1000 aurora-glow"
                    style={{ 
                      width: `${conversionRate}%`,
                      animationDelay: '500ms' 
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      ))}
    </div>
  );
};

export default InviteStats;

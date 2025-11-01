import { Helmet } from "react-helmet-async";
import { ConnectionsHub } from "@/components/networking/connections/ConnectionsHub";

const NetworkingConnections = () => {
  return (
    <>
      <Helmet>
        <title>Minhas Conexões | Viver de IA</title>
        <meta name="description" content="Gerencie suas conexões, solicitações pendentes e descubra novos membros" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <div className="container mx-auto py-8 space-y-8">
          {/* Header Premium com Glassmorphism */}
          <div className="relative overflow-hidden rounded-2xl bg-card/95 backdrop-blur-xl border border-border/30 p-8 shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent"></div>
            <div className="absolute inset-0 bg-dot-pattern opacity-5"></div>
            <div className="relative space-y-3">
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Conexões
              </h1>
              <p className="text-lg text-muted-foreground/80 max-w-2xl">
                Conecte-se com outros membros, gerencie suas conexões e expanda sua rede profissional
              </p>
            </div>
          </div>

          {/* Hub de Conexões com Tabs Premium */}
          <ConnectionsHub />
        </div>
      </div>
    </>
  );
};

export default NetworkingConnections;

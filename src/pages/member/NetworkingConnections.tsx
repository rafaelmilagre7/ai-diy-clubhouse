import { Helmet } from "react-helmet-async";
import { ConnectionsHub } from "@/components/networking/connections/ConnectionsHub";

const NetworkingConnections = () => {
  return (
    <>
      <Helmet>
        <title>Minhas Conexões | Viver de IA</title>
        <meta name="description" content="Gerencie suas conexões, solicitações pendentes e descubra novos membros" />
      </Helmet>

      <div className="container py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
            Conexões
          </h1>
          <p className="text-muted-foreground">
            Conecte-se com outros membros, gerencie suas conexões e expanda sua rede
          </p>
        </div>

        {/* Hub de Conexões com Tabs */}
        <ConnectionsHub />
      </div>
    </>
  );
};

export default NetworkingConnections;

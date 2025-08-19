
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { CreateTopicDialog } from "./CreateTopicDialog";
import { useState } from "react";
import { motion } from "framer-motion";

export const CommunitySidebarModern = () => {
  const [createTopicOpen, setCreateTopicOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Próximos Eventos Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-xl border-primary/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximos Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="p-3 bg-primary/10 rounded-xl mb-3 mx-auto w-fit">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Fique atento aos próximos eventos da comunidade
              </p>
              <Button variant="outline" size="sm" className="text-xs">
                Ver Agenda
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <CreateTopicDialog open={createTopicOpen} onOpenChange={setCreateTopicOpen} />
    </div>
  );
};

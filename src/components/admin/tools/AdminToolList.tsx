import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Tool } from "@/lib/supabase/types";

// Usando uma solução temporária para o AdminToolList
// que foi apontada no erro de build
export function AdminToolList() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);

        // Usando um tipo mais genérico para resolver o erro de tipo com "tools"
        const { data, error } = await supabase
          .from("tools" as any)
          .select("*");

        if (error) throw error;
        
        if (data) {
          setTools(data as unknown as Tool[]);
        }
      } catch (error) {
        console.error("Erro ao carregar ferramentas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  // Resto do componente...
  return (
    <div>
      {loading ? (
        <p>Carregando ferramentas...</p>
      ) : (
        <div>
          {tools.length === 0 ? (
            <p>Nenhuma ferramenta encontrada.</p>
          ) : (
            <ul>
              {tools.map((tool) => (
                <li key={tool.id}>{tool.name}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminToolList;

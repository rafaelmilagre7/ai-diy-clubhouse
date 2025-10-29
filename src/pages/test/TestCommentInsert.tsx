import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function TestCommentInsert() {
  const [topicId, setTopicId] = useState("750e0b46-08e2-4601-be07-2e5944c80ecc");
  const [content, setContent] = useState("Teste de comentário isolado");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testInsert = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log("🧪 [TEST] ===== TESTE DE INSERT ISOLADO =====");
      
      // 1. Verificar sessão
      console.log("🔐 [TEST] Verificando sessão...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Não há sessão ativa");
      }
      
      console.log("✅ [TEST] Sessão válida:", {
        userId: session.user.id,
        email: session.user.email
      });
      
      // 2. Verificar usuário
      console.log("👤 [TEST] Verificando usuário...");
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error(`Erro de autenticação: ${authError?.message || "Usuário não encontrado"}`);
      }
      
      console.log("✅ [TEST] Usuário autenticado:", user.id);
      
      // 3. Verificar tópico
      console.log("🔍 [TEST] Verificando tópico...");
      const { data: topic, error: topicError } = await supabase
        .from("community_topics")
        .select("*")
        .eq("id", topicId)
        .maybeSingle();
      
      if (topicError) {
        throw new Error(`Erro ao buscar tópico: ${topicError.message}`);
      }
      
      if (!topic) {
        throw new Error("Tópico não encontrado");
      }
      
      console.log("✅ [TEST] Tópico encontrado:", {
        id: topic.id,
        title: topic.title,
        is_locked: topic.is_locked
      });
      
      if (topic.is_locked) {
        throw new Error("Tópico está bloqueado");
      }
      
      // 4. Inserir comentário
      console.log("💾 [TEST] Inserindo comentário...");
      const insertData = {
        content: content.trim(),
        topic_id: topicId,
        user_id: user.id
      };
      
      console.log("📦 [TEST] Dados para INSERT:", insertData);
      
      const { data: insertedPost, error: insertError } = await supabase
        .from("community_posts")
        .insert([insertData])
        .select()
        .single();
      
      if (insertError) {
        console.error("❌ [TEST] Erro no INSERT:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });
        throw new Error(`Erro no INSERT: ${insertError.message}`);
      }
      
      console.log("✅ [TEST] Comentário inserido com sucesso:", insertedPost);
      
      setResult({
        success: true,
        data: insertedPost,
        message: "✅ Comentário inserido com sucesso!"
      });
      
      toast({
        title: "Sucesso!",
        description: "Comentário inserido com sucesso"
      });
      
    } catch (error: any) {
      console.error("❌ [TEST] Erro no teste:", error);
      
      setResult({
        success: false,
        error: error.message,
        fullError: JSON.stringify(error, null, 2)
      });
      
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de INSERT de Comentário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Topic ID</label>
            <input
              type="text"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Conteúdo</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            onClick={testInsert} 
            disabled={isLoading || !topicId || !content}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Testando...
              </>
            ) : (
              "Executar Teste de INSERT"
            )}
          </Button>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>
              {result.success ? "✅ Resultado do Teste" : "❌ Erro no Teste"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              {JSON.stringify(result, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>📝 Instruções</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>Esta página testa o INSERT de comentários de forma isolada.</p>
          <p><strong>Verificações realizadas:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Validação de sessão ativa</li>
            <li>Validação de usuário autenticado</li>
            <li>Verificação de existência do tópico</li>
            <li>Verificação se tópico não está bloqueado</li>
            <li>INSERT na tabela community_posts</li>
          </ul>
          <p className="mt-4"><strong>Console:</strong> Abra o console do navegador (F12) para ver logs detalhados.</p>
        </CardContent>
      </Card>
    </div>
  );
}

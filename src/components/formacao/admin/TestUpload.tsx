import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export const TestUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testDirectUpload = async (file: File) => {
    console.log("🧪 TESTE DIRETO - Iniciando upload...");
    setUploading(true);
    setResult(null);

    try {
      const fileName = `test-${Date.now()}-${file.name}`;
      const filePath = `aulas/${fileName}`;

      console.log("📁 Testando upload direto para learning_covers");
      console.log("📄 Arquivo:", file.name, "Tamanho:", file.size);
      console.log("📍 Caminho:", filePath);

      // Teste 1: Verificar se o bucket existe
      console.log("🔍 Verificando buckets disponíveis...");
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("❌ Erro ao listar buckets:", bucketsError);
        throw new Error(`Erro ao listar buckets: ${bucketsError.message}`);
      }

      console.log("📦 Buckets disponíveis:", buckets?.map(b => b.id));
      
      const learningCoversBucket = buckets?.find(b => b.id === 'learning_covers');
      if (!learningCoversBucket) {
        console.log("⚠️ Bucket learning_covers não encontrado, criando...");
        
        const { data: createData, error: createError } = await supabase.storage.createBucket('learning_covers', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: ['image/*']
        });

        if (createError) {
          console.error("❌ Erro ao criar bucket:", createError);
          throw new Error(`Erro ao criar bucket: ${createError.message}`);
        }
        
        console.log("✅ Bucket criado:", createData);
      } else {
        console.log("✅ Bucket learning_covers encontrado:", learningCoversBucket);
      }

      // Teste 2: Upload direto
      console.log("📤 Iniciando upload...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('learning_covers')
        .upload(filePath, file, { 
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error("❌ Erro no upload:", uploadError);
        throw new Error(`Erro no upload: ${uploadError.message}`);
      }

      console.log("✅ Upload concluído:", uploadData);

      // Teste 3: Obter URL pública
      console.log("🔗 Obtendo URL pública...");
      const { data: urlData } = supabase.storage
        .from('learning_covers')
        .getPublicUrl(filePath);

      console.log("🌐 URL pública:", urlData.publicUrl);

      // Teste 4: Verificar se o arquivo existe
      console.log("🔍 Verificando se o arquivo foi salvo...");
      const { data: fileList, error: listError } = await supabase.storage
        .from('learning_covers')
        .list('aulas');

      if (listError) {
        console.warn("⚠️ Erro ao listar arquivos:", listError);
      } else {
        console.log("📋 Arquivos na pasta aulas:", fileList?.map(f => f.name));
        const uploadedFile = fileList?.find(f => f.name === fileName);
        console.log(uploadedFile ? "✅ Arquivo encontrado!" : "❌ Arquivo não encontrado");
      }

      const testResult = {
        success: true,
        uploadData,
        publicUrl: urlData.publicUrl,
        fileName,
        filePath,
        bucketExists: !!learningCoversBucket,
        fileSize: file.size,
        fileType: file.type
      };

      setResult(testResult);
      toast.success("Upload de teste concluído com sucesso!");

    } catch (error: any) {
      console.error("💥 ERRO NO TESTE:", error);
      
      const errorResult = {
        success: false,
        error: error.message,
        stack: error.stack
      };
      
      setResult(errorResult);
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      testDirectUpload(file);
    }
  };

  return (
    <div className="p-6 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">🧪 Teste de Upload Direto</h3>
      
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          id="test-upload"
        />
        
        <Button
          onClick={() => document.getElementById("test-upload")?.click()}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando upload...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Selecionar arquivo para teste
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Resultado do Teste:</h4>
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
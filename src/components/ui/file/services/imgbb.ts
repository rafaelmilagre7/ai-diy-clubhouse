
// Serviço específico para upload de imagens no ImgBB
export const uploadImageToImgBB = async (
  file: File,
  apiKey: string,
  onProgressUpdate?: (progress: number) => void
) => {
  try {
    if (onProgressUpdate) onProgressUpdate(10);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("key", apiKey);

    if (onProgressUpdate) onProgressUpdate(40);

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (onProgressUpdate) onProgressUpdate(80);

    if (!response.ok) {
      throw new Error(`Erro na API do ImgBB: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Falha no upload da imagem");
    }

    if (onProgressUpdate) onProgressUpdate(100);

    return {
      publicUrl: data.data.url,
      fileName: file.name,
      displayUrl: data.data.display_url,
      thumbnailUrl: data.data.thumb?.url || data.data.url
    };
  } catch (error) {
    console.error("Erro ao fazer upload da imagem:", error);
    throw error;
  }
};

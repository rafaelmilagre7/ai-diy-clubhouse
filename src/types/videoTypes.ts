
export interface VideoItem {
  id: string;
  name: string;
  url: string;
  type: string;
  metadata?: {
    source?: "youtube" | "upload";
    youtube_id?: string;
    thumbnail_url?: string;
    description?: string;
  };
}

// Tipos TypeScript para a API do PandaVideo

export interface PandaPlayerConfig {
  video_id?: string;
  width?: string | number;
  height?: string | number;
  responsive?: boolean;
  autoplay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
}

export interface PandaPlayer {
  onReady(callback: () => void): void;
  onPlay(callback: () => void): void;
  onPause(callback: () => void): void;
  onEnded(callback: () => void): void;
  onProgress(callback: (progress: { percent: number; currentTime: number; duration: number }) => void): void;
  onTimeUpdate(callback: (time: { currentTime: number; duration: number }) => void): void;
  onError(callback: (error: any) => void): void;
  
  play(): void;
  pause(): void;
  setCurrentTime(time: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unmute(): void;
  destroy(): void;
}

declare global {
  interface Window {
    PandaPlayer: new (
      containerId: string,
      config: PandaPlayerConfig
    ) => PandaPlayer;
  }
}

export {};

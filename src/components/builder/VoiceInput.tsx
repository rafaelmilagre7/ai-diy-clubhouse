import { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({ onTranscription, disabled = false }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(32).fill(0));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    
    if (isRecording) {
      intervalId = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const visualizeAudio = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const animate = () => {
      if (!isRecording) return;
      
      analyser.getByteFrequencyData(dataArray);
      
      // Pegar 32 valores distribuídos ao longo do espectro
      const step = Math.floor(bufferLength / 32);
      const levels = Array.from({ length: 32 }, (_, i) => {
        const index = i * step;
        const value = dataArray[index] || 0;
        // Normalizar para 0-1 e ajustar sensibilidade
        return Math.min(1, (value / 255) * 1.5);
      });
      
      setAudioLevels(levels);
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Configurar Web Audio API para análise
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;
      source.connect(analyserRef.current);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        setRecordingTime(0);
        setAudioLevels(new Array(32).fill(0));
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      visualizeAudio();

      toast.success('Gravação iniciada', {
        description: 'Fale sua ideia claramente'
      });

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      toast.error('Erro ao acessar microfone', {
        description: 'Verifique as permissões do navegador'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
      });

      reader.readAsDataURL(audioBlob);
      const base64Audio = await base64Promise;

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { audio: base64Audio }
      });

      if (error) {
        console.error('Erro ao transcrever:', error);
        throw error;
      }

      if (!data?.success || !data?.text) {
        throw new Error('Transcrição falhou');
      }

      const transcription = data.text.trim();

      if (transcription.length < 30) {
        toast.warning('Transcrição muito curta', {
          description: 'Por favor, grave uma descrição mais detalhada'
        });
        return;
      }

      toast.success('Transcrição concluída! 🎉');
      onTranscription(transcription);

    } catch (error) {
      console.error('Erro na transcrição:', error);
      toast.error('Erro ao transcrever áudio', {
        description: 'Tente novamente ou digite sua ideia'
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    if (isTranscribing) return "Transcrevendo...";
    if (isRecording) return "Gravando...";
    return "Gravar áudio";
  };

  return (
    <div className="w-full py-1">
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200",
            isRecording || isTranscribing
              ? "bg-surface-elevated/50"
              : "bg-surface-elevated/50 hover:bg-surface-elevated border border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled}
          title={getStatusText()}
        >
          {isRecording ? (
            <div className="w-4 h-4 rounded-sm bg-primary animate-pulse" />
          ) : isTranscribing ? (
            <div
              className="w-4 h-4 rounded-sm animate-spin bg-primary/50"
              style={{ animationDuration: "1s" }}
            />
          ) : (
            <Mic className="w-4 h-4 text-foreground/70 group-hover:text-primary transition-colors" />
          )}
        </button>

        {(isRecording || isTranscribing) && (
          <>
            <span className="font-mono text-xs text-muted-foreground">
              {formatTime(recordingTime)}
            </span>

            {isRecording && (
              <div className="h-3 w-48 flex items-center justify-center gap-0.5">
                {audioLevels.map((level, i) => {
                  const height = Math.max(20, level * 100);
                  return (
                    <div
                      key={i}
                      className="w-0.5 rounded-full bg-primary/50 transition-all duration-75"
                      style={{
                        height: `${height}%`,
                      }}
                    />
                  );
                })}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {getStatusText()}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

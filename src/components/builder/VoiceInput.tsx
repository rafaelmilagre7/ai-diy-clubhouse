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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

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
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);

    try {
      // Converter blob para base64
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

      // Chamar edge function
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
    <div className="w-full py-2">
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200",
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
            <div
              className="w-5 h-5 rounded-sm bg-primary animate-pulse"
            />
          ) : isTranscribing ? (
            <div
              className="w-5 h-5 rounded-sm animate-spin bg-primary/50"
              style={{ animationDuration: "1s" }}
            />
          ) : (
            <Mic className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
          )}
        </button>

        {(isRecording || isTranscribing) && (
          <>
            <span className="font-mono text-xs text-muted-foreground">
              {formatTime(recordingTime)}
            </span>

            {isRecording && (
              <div className="h-3 w-48 flex items-center justify-center gap-0.5">
                {[...Array(32)].map((_, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-full transition-all duration-300 bg-primary/40 animate-pulse"
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
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

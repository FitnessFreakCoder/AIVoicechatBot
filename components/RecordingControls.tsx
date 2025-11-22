import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash2, AlertCircle } from 'lucide-react';
import { formatTime, getSupportedMimeType } from '../utils/audioHelper';
import AudioVisualizer from './AudioVisualizer';
import { MAX_RECORDING_TIME } from '../constants';

interface RecordingControlsProps {
  onRecordingComplete: (blob: Blob) => void;
  disabled: boolean;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({ onRecordingComplete, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  // Fix: Use 'number' instead of 'NodeJS.Timeout' for browser compatibility
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(stream);
      
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setStream(null);
        
        // Only complete if we have data and weren't cancelled
        if (chunksRef.current.length > 0) {
             // We handle the "send" action manually via the UI button now, 
             // but here we just finalize the blob state if needed.
             // Actually, simpler flow: Stop -> Creates Blob -> Ready to send.
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setElapsedTime(0);

      timerRef.current = window.setInterval(() => {
        setElapsedTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = (shouldSend: boolean = false) => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Delay slightly to ensure onstop fires and processes data
      setTimeout(() => {
        if (shouldSend && chunksRef.current.length > 0) {
            const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
            onRecordingComplete(blob);
        }
      }, 200);
    }
  };

  const cancelRecording = () => {
    stopRecording(false);
    chunksRef.current = [];
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4">
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm mb-4 bg-red-400/10 p-2 rounded-lg">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isRecording ? (
        <div className="w-full bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-slate-300 font-mono text-sm">{formatTime(elapsedTime)} / {formatTime(MAX_RECORDING_TIME)}</span>
             </div>
             <div className="text-xs text-slate-400 uppercase tracking-widest font-bold">Recording Voice Message</div>
          </div>

          <div className="flex justify-center items-center py-4 bg-slate-900/50 rounded-lg mb-4 border border-slate-700/50">
            <AudioVisualizer stream={stream} isRecording={isRecording} />
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={cancelRecording}
              className="p-3 rounded-full bg-slate-700 text-slate-300 hover:bg-red-500/20 hover:text-red-400 transition-colors"
              title="Cancel"
            >
              <Trash2 size={20} />
            </button>
            
            <button
              onClick={() => stopRecording(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow-lg hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={18} />
              <span>Send Voice Note</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={startRecording}
          disabled={disabled}
          className={`
            group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl transition-all duration-300
            ${disabled 
              ? 'bg-slate-700 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-110 hover:shadow-indigo-500/50 cursor-pointer'}
          `}
        >
          {!disabled && <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:animate-ping group-hover:opacity-20"></div>}
          <Mic size={28} className="text-white" />
        </button>
      )}
      
      {!isRecording && (
        <div className="mt-4 text-slate-400 text-sm font-medium">
            Tap microphone to speak
        </div>
      )}
    </div>
  );
};

export default RecordingControls;
export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string; // The transcribed text or the model response
  audioUrl?: string; // URL to the recorded audio blob (for user messages)
  timestamp: Date;
  isProcessing?: boolean;
}

export interface AudioState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
}

export enum AppStatus {
  IDLE = 'idle',
  RECORDING = 'recording',
  PROCESSING = 'processing',
  ERROR = 'error',
}
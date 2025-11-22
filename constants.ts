export const MAX_RECORDING_TIME = 60; // seconds
export const VISUALIZER_BAR_COUNT = 30;
export const SAMPLE_RATE = 16000; // 16kHz is good for speech

// Supported MIME types for MediaRecorder in order of preference
export const AUDIO_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4', // Safari
  'audio/ogg',
];
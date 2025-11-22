import React, { useState, useRef, useEffect } from 'react';
import { Message, AppStatus } from './types';
import { processVoiceMessage } from './services/geminiService';
import MessageBubble from './components/MessageBubble';
import RecordingControls from './components/RecordingControls';
import { Radio, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your AI voice assistant. You can speak to me, and I'll listen and respond. Press the microphone button to start recording.",
      timestamp: new Date(),
    }
  ]);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      audioUrl: audioUrl,
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages(prev => [...prev, newUserMsg]);
    setStatus(AppStatus.PROCESSING);

    // Create a placeholder for the bot response
    const loadingMsgId = (Date.now() + 1).toString();
    const loadingMsg: Message = {
      id: loadingMsgId,
      role: 'model',
      isProcessing: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, loadingMsg]);

    try {
      // Call the AI Service (Simulating Backend)
      // Note: In a real backend-flask scenario, we would upload the file here using FormData
      // const formData = new FormData();
      // formData.append('file', audioBlob);
      // await fetch('/api/process-voice', { method: 'POST', body: formData });
      
      // Direct Gemini API call
      const responseText = await processVoiceMessage(audioBlob, messages);

      // Update the placeholder with actual text
      setMessages(prev => prev.map(msg => {
        if (msg.id === loadingMsgId) {
          return {
            ...msg,
            text: responseText,
            isProcessing: false
          };
        }
        return msg;
      }));
      
      setStatus(AppStatus.IDLE);

    } catch (error) {
      console.error("Processing error:", error);
      setMessages(prev => prev.map(msg => {
        if (msg.id === loadingMsgId) {
          return {
            ...msg,
            text: "Sorry, I had trouble understanding that audio. Please try again.",
            isProcessing: false
          };
        }
        return msg;
      }));
      setStatus(AppStatus.IDLE);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden selection:bg-indigo-500/30">
      
      {/* Header */}
      <header className="flex-shrink-0 h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
            <Radio size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">EchoVoice AI</h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Online & Listening
            </p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-500">
           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
              <Sparkles size={12} className="text-purple-400"/>
              <span>Powered by Gemini 2.5</span>
           </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide p-4 md:p-6 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={chatEndRef} />
        </div>
      </main>

      {/* Footer / Controls */}
      <footer className="flex-shrink-0 bg-slate-900 border-t border-slate-800 pb-safe-area">
        <div className="max-w-3xl mx-auto w-full">
           <RecordingControls 
             onRecordingComplete={handleRecordingComplete} 
             disabled={status === AppStatus.PROCESSING} 
           />
        </div>
      </footer>

    </div>
  );
};

export default App;
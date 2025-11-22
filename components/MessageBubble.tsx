import React from 'react';
import { Message } from '../types';
import { Play, User, Bot, Mic } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>

        {/* Bubble */}
        <div 
          className={`
            p-4 rounded-2xl shadow-lg 
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-br-none' 
              : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'}
          `}
        >
          {/* Audio Player for User Voice Messages */}
          {message.audioUrl && (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1 text-xs opacity-80 uppercase tracking-wider font-semibold">
                <Mic size={12} />
                <span>Voice Message</span>
              </div>
              <audio 
                controls 
                src={message.audioUrl} 
                className="h-10 w-full min-w-[200px] max-w-[300px] rounded bg-transparent"
                style={{ filter: isUser ? 'brightness(1.2)' : 'invert(0.9)' }}
              />
            </div>
          )}

          {/* Text Content */}
          {message.text && (
            <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
              {message.text}
            </div>
          )}

          {/* Loading Indicator */}
          {message.isProcessing && (
            <div className="flex space-x-1 mt-2 h-4 items-center">
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-[10px] mt-2 text-right ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
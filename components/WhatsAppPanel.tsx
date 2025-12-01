




import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icon';

export interface Message {
  id: number;
  sender: string; // Changed to string to be flexible
  text: string;
  time: string;
}

interface WhatsAppPanelProps {
  contactName: string;
  messages: Message[];
  onSendMessage: (text: string) => void;
  myRole?: 'admin' | 'contador'; // New prop to know who 'I' am
  onReceiveMessage?: (text: string) => void; // New: Callback for testing AI
  onRequestAiSuggestion?: () => void; // New: Callback for AI suggestions
}

export const WhatsAppPanel: React.FC<WhatsAppPanelProps> = ({ 
  contactName, 
  messages, 
  onSendMessage,
  myRole = 'admin', // Default
  onReceiveMessage,
  onRequestAiSuggestion
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // DEV TOOL: Simulate Incoming
  const [simText, setSimText] = useState('');
  const [showSim, setShowSim] = useState(false);

  // Allow parent to set input text (for AI suggestion)
  // We can't easily expose setInputText, so we rely on prop update if needed,
  // or more simply, we assume the parent doesn't need to control it unless we add another prop.
  // For the requested feature, the button will be inside this component, so we can access setInputText directly.

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSimulateIncoming = () => {
    if (simText.trim() && onReceiveMessage) {
        onReceiveMessage(simText);
        setSimText('');
    }
  };

  // Internal handler for AI Suggestion to fill input
  const handleAiSuggestClick = () => {
      if (onRequestAiSuggestion) {
          // In a real app, this would be async. For MVP, we can assume the parent sets a state or returns a string.
          // However, props are read-only. We need a way to get the string back.
          // Let's assume onRequestAiSuggestion returns the string synchronously for the mock.
          const suggestion = (onRequestAiSuggestion as any)(); 
          if (typeof suggestion === 'string') {
              setInputText(suggestion);
          }
      }
  };

  return (
    <div className="flex flex-col h-full bg-[#efeae2] dark:bg-slate-900 rounded-3xl overflow-hidden shadow-soft border border-slate-200 dark:border-slate-800 relative">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 p-4 flex items-center justify-between shadow-sm z-10 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-md">
             <Icon name="users" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{contactName}</h3>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> 
              En línea (WhatsApp)
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-slate-400 items-center">
           {/* Developer Tool: Test Chat */}
           <button 
             onClick={() => setShowSim(!showSim)} 
             className={`p-2 rounded-full transition-colors ${showSim ? 'bg-amber-100 text-amber-600' : 'hover:bg-slate-50'}`}
             title="Herramienta de Pruebas: Simular Cliente"
           >
              <Icon name="settings" size={20} />
           </button>
           <button className="p-2 hover:bg-slate-50 rounded-full transition-colors"><Icon name="search" size={20} /></button>
           <button className="p-2 hover:bg-slate-50 rounded-full transition-colors"><Icon name="more" size={20} /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50 pb-20">
        {messages.length === 0 ? (
          <div className="flex justify-center mt-10">
            <span className="bg-white/80 dark:bg-slate-800 backdrop-blur-sm text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl text-xs shadow-sm font-medium">
              Inicia la conversación con {contactName}
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            // Logic to determine alignment
            const isMe = msg.sender === myRole; 
            
            return (
              <div 
                key={msg.id} 
                className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  max-w-[85%] sm:max-w-[70%] p-3 px-4 shadow-sm relative text-sm sm:text-base
                  ${isMe 
                    ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-none' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-none'
                  }
                `}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[10px] block text-right mt-1 opacity-70 font-medium`}>
                    {msg.time}
                    {isMe && <Icon name="check" size={12} className="inline ml-1" />}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Dev Simulator Overlay */}
      {showSim && onReceiveMessage && (
         <div className="absolute bottom-24 left-4 right-4 bg-amber-50 dark:bg-amber-900/95 p-3 rounded-xl border border-amber-200 flex flex-col gap-2 z-20 shadow-xl animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold text-amber-600">
               <span>🔧 Modo Pruebas (Simulador)</span>
               <button onClick={() => setShowSim(false)}><Icon name="close" size={14}/></button>
            </div>
            <div className="flex gap-2">
              <input 
                 type="text" 
                 className="flex-1 p-2 rounded-lg text-xs border border-amber-300 dark:bg-slate-800 dark:border-amber-700 dark:text-white"
                 placeholder="Escribe como si fueras el cliente..."
                 value={simText}
                 onChange={e => setSimText(e.target.value)}
                 onKeyDown={(e) => { if(e.key === 'Enter') handleSimulateIncoming() }}
              />
              <button onClick={handleSimulateIncoming} className="bg-amber-500 text-white px-3 rounded-lg text-xs font-bold">Enviar</button>
            </div>
         </div>
      )}

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-800 p-3 flex items-center gap-2 border-t border-slate-100 dark:border-slate-700 absolute bottom-0 w-full z-10">
        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Icon name="add-user" size={24} /> {/* Placeholder for attachment */}
        </button>
        
        {/* AI Suggest Button (Visible if callback provided) */}
        {onRequestAiSuggestion && (
            <button 
                onClick={handleAiSuggestClick}
                className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
                title="Sugerir Respuesta IA"
            >
                <Icon name="sparkles" size={24} />
            </button>
        )}

        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe un mensaje..."
          className="flex-1 p-3.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all placeholder-slate-400"
        />
        <button 
          onClick={handleSend}
          disabled={!inputText.trim()}
          className="p-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full shadow-lg transition-all active:scale-95"
        >
          <Icon name="save" size={20} className="rotate-90" /> {/* Send Icon lookalike */}
        </button>
      </div>
    </div>
  );
};
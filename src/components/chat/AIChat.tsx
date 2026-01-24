import { useState, useRef } from 'react';
import { Send, Mic, Volume2, VolumeX, Trash2, Paperclip, X } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface Attachment {
  name: string;
  type: string;
  data: string;
  category: 'image' | 'pdf' | 'text' | 'other';
}

interface AIChatProps {
  chatHistory: Message[];
  isAiThinking: boolean;
  isSpeaking: boolean;
  isListening: boolean;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  onVoiceInput: () => void;
  onSendMessage: (message: string, attachment?: Attachment | null) => void;
  onClearChat: () => void;
}

const AIChat = ({ 
  chatHistory, 
  isAiThinking, 
  isSpeaking,
  isListening,
  isTtsEnabled,
  onToggleTts,
  onVoiceInput,
  onSendMessage,
  onClearChat
}: AIChatProps) => {

  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Data = (e.target?.result as string).split(',')[1];
        let category: Attachment['category'] = 'other';
        if (file.type.startsWith('image/')) category = 'image';
        else if (file.type === 'application/pdf') category = 'pdf';
        else if (file.type.startsWith('text/')) category = 'text';
        
        setAttachment({ name: file.name, type: file.type, data: base64Data, category });
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset file input
  };

  const handleSend = () => {
    if (message.trim() || attachment) {
      onSendMessage(message, attachment);
      setMessage('');
      setAttachment(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="animate-slide-in-bottom flex flex-col h-[calc(100vh-200px)] max-h-[700px] glass-card p-4">
      
      <div className="flex justify-between items-center pb-4 border-b border-white/10">
        <h2 className="text-xl font-bold">AI Chat</h2>
        <div className="flex items-center gap-2">
          <button onClick={onToggleTts} className="btn-icon" title={isTtsEnabled ? "Disable TTS" : "Enable TTS"}>
            {isTtsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={onClearChat} className="btn-icon text-destructive" title="Clear Chat">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 mt-1"></div>}
            <div className={`max-w-md p-3 rounded-xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isAiThinking && (
          <div className="flex gap-3 items-start justify-start">
            <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 mt-1 animate-pulse"></div>
            <div className="max-w-md p-3 rounded-xl bg-muted/50">
              <p className="text-sm">Leo is typing...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        {attachment && (
            <div className="mb-2 flex items-center justify-between bg-secondary/50 px-3 py-2 rounded-lg text-sm">
                <p className="font-semibold">Attached: <span className="font-light text-muted-foreground">{attachment.name}</span></p>
                <button onClick={() => setAttachment(null)} className="btn-icon h-7 w-7"><X size={16}/></button>
            </div>
        )}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-white/10 focus-within:border-primary transition-colors">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask or upload a file..."
              className="flex-grow bg-transparent focus:outline-none px-2"
              disabled={isAiThinking}
            />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="btn-icon" title="Attach File" disabled={isAiThinking}>
              <Paperclip size={20} />
            </button>
            <button onClick={onVoiceInput} className={`btn-icon ${isListening ? 'text-destructive' : ''}`} title="Voice Input" disabled={isAiThinking}>
              <Mic size={20} />
            </button>
            <button onClick={handleSend} className="btn-icon bg-primary text-primary-foreground" title="Send" disabled={isAiThinking || (!message.trim() && !attachment)}>
              <Send size={20} />
            </button>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-2">StudentLifeOS AI can make mistakes. Please verify important info.</p>
    </div>
  );
}

export default AIChat;

import { useState, useRef } from 'react';
import { Send, Mic, MicOff, Plus, X, Loader2, Volume2, VolumeX, FileText } from 'lucide-react';

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
}: AIChatProps) => {
  const [chatInput, setChatInput] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    const isText = file.type.startsWith('text/') || file.name.endsWith('.md');

    reader.onload = (event) => {
      setAttachment({
        name: file.name,
        type: file.type,
        data: event.target?.result as string,
        category: isImage ? 'image' : (isPdf ? 'pdf' : (isText ? 'text' : 'other'))
      });
    };

    if (isText) {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!chatInput.trim() && !attachment) return;
    onSendMessage(chatInput, attachment);
    setChatInput('');
    setAttachment(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] sm:h-[calc(100vh-220px)] md:h-[600px] animate-fade-in relative">
      <div className="absolute top-0 right-4 flex items-center gap-2 z-10">
        <button 
          onClick={onToggleTts}
          className={`p-2 rounded-full transition-all ${isTtsEnabled ? 'text-primary bg-primary/20' : 'text-muted-foreground bg-secondary'}`}
          title={isTtsEnabled ? "Mute Voice" : "Enable Voice"}
        >
          {isTtsEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      <div className="flex-1 glass-card p-2 sm:p-4 overflow-y-auto space-y-4 mb-4 mt-10 md:mt-0">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-2.5 sm:p-3 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-gradient-primary text-primary-foreground rounded-br-none' 
                : 'bg-secondary text-foreground rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="bg-secondary text-foreground p-3 rounded-2xl rounded-bl-none flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Thinking...
            </div>
          </div>
        )}
        {isSpeaking && (
          <div className="flex justify-start">
            <div className="text-xs text-primary flex items-center gap-1 animate-pulse">
              <Volume2 size={12} /> Speaking...
            </div>
          </div>
        )}
      </div>

      {attachment && (
        <div className="absolute bottom-[72px] sm:bottom-24 left-0 ml-2 mb-2 glass-card p-2 flex items-center gap-3 animate-scale-in z-20">
          <div className="w-8 h-8 bg-secondary rounded flex items-center justify-center">
            {attachment.category === 'image' ? (
              <img src={attachment.data} alt="preview" className="w-full h-full object-cover rounded" />
            ) : (
              <FileText size={16} className="text-muted-foreground" />
            )}
          </div>
          <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]">{attachment.name}</div>
          <button onClick={() => setAttachment(null)} className="hover:text-foreground text-muted-foreground">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex gap-2 relative items-center">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 glass-card text-muted-foreground hover:text-foreground transition-colors"
          title="Attach file"
        >
          <Plus size={24} />
        </button>

        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="Ask or upload a file..."
          className="flex-1 bg-input border border-border rounded-xl px-4 py-3 text-sm sm:text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          disabled={isAiThinking}
        />
        
        <button 
          onClick={onVoiceInput}
          className={`p-3 rounded-xl border transition-all ${
            isListening 
              ? 'bg-destructive/20 border-destructive text-destructive animate-pulse' 
              : 'glass-card text-muted-foreground hover:text-foreground'
          }`}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        
        <button 
          onClick={handleSubmit}
          disabled={isAiThinking || (!chatInput.trim() && !attachment)}
          className="p-3 bg-gradient-primary text-primary-foreground rounded-xl transition-all hover:opacity-90 disabled:opacity-50 flex-shrink-0"
        >
          <Send size={24} />
        </button>
        <input type="file" hidden ref={fileInputRef} onChange={handleFileSelect} accept="image/*,.txt,.md,.pdf"/>
      </div>
      
      <p className="text-xs text-center text-muted-foreground mt-2">
        StudentLifeOS AI can make mistakes. Please verify important info.
      </p>
    </div>
  );
};

export default AIChat;

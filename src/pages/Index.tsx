import { useState, useRef, useEffect } from 'react';
import FluidCursor from '@/components/FluidCursor';
import AuthScreen from '@/components/auth/AuthScreen';
import SOSScreen from '@/components/safety/SOSScreen';
import Header from '@/components/layout/Header';
import SlideOutMenu from '@/components/layout/SlideOutMenu';
import Dashboard from '@/components/dashboard/Dashboard';
import StudyPlanner from '@/components/study/StudyPlanner';
import AIChat from '@/components/chat/AIChat';
import ProfileTab from '@/components/profile/ProfileTab';
import Notification from '@/components/ui/Notification';

type TabType = 'profile' | 'dashboard' | 'study' | 'safety' | 'chat';

interface Task {
  id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

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

const Index = () => {
  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");

  // Voice & Chat State
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm your AI Assistant. I can help with study plans, sleep tracking, or if you're feeling stressed. How are you today?" }
  ]);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sleep & Health State
  const [sleepHours, setSleepHours] = useState(6);
  const [energyLevel] = useState(70);
  const [dailyInsight, setDailyInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);

  // Study State
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: "Complete ML Project", priority: "High", completed: false },
    { id: 2, title: "Study Data Structures", priority: "Medium", completed: false },
  ]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  // Helper Functions
  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const speakText = (text: string) => {
    if (!isTtsEnabled) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) 
                        || voices.find(v => v.name.includes('Samantha'));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const handleVoicesChanged = () => { window.speechSynthesis.getVoices(); };
    window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    handleVoicesChanged();
  }, []);

  // AI Functions (simulated - in production, these would call your backend)
  const simulateAIResponse = async (prompt: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple response simulation
    if (prompt.toLowerCase().includes('sleep')) {
      return `Based on your ${sleepHours} hours of sleep, I recommend taking a 20-minute power nap around 2 PM to boost your afternoon productivity.`;
    }
    if (prompt.toLowerCase().includes('study') || prompt.toLowerCase().includes('plan')) {
      return "I'd recommend using the Pomodoro technique: 25 minutes of focused study followed by 5-minute breaks. This helps maintain concentration!";
    }
    if (prompt.toLowerCase().includes('stress') || prompt.toLowerCase().includes('anxious')) {
      return "I hear you. Try the 4-7-8 breathing technique: breathe in for 4 seconds, hold for 7, exhale for 8. Would you like me to guide you through it?";
    }
    return "I'm here to help! You can ask me about study tips, sleep optimization, stress management, or anything else on your mind.";
  };

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    const insight = await simulateAIResponse(`sleep ${sleepHours} energy ${energyLevel}`);
    setDailyInsight(insight);
    speakText(insight);
    setLoadingInsight(false);
  };

  const handleGeneratePlan = async (topic: string) => {
    setLoadingPlan(true);
    
    // Simulate AI generating tasks
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newTasks: Task[] = [
      { id: Date.now(), title: `Review basics of ${topic}`, priority: 'High', completed: false },
      { id: Date.now() + 1, title: `Practice ${topic} exercises`, priority: 'Medium', completed: false },
      { id: Date.now() + 2, title: `Create summary notes for ${topic}`, priority: 'Low', completed: false },
    ];
    
    setTasks(prev => [...prev, ...newTasks]);
    triggerNotification("✨ Study plan created!");
    speakText(`I've created a study plan for ${topic}. Good luck!`);
    setLoadingPlan(false);
  };

  const handleSendMessage = async (message: string, attachment?: Attachment | null) => {
    if (!message.trim() && !attachment) return;

    const displayMessage = message || (attachment ? `[Sent File: ${attachment.name}]` : "...");
    const newHistory: Message[] = [...chatHistory, { role: 'user', text: displayMessage }];
    setChatHistory(newHistory);

    // Check for emergency keywords
    if (message.toLowerCase().includes('emergency') || message.toLowerCase().includes('sos')) {
      setIsSOSActive(true);
      triggerNotification("Emergency Protocol Initiated");
    }

    setIsAiThinking(true);
    const response = await simulateAIResponse(message);
    setIsAiThinking(false);

    setChatHistory([...newHistory, { role: 'model', text: response }]);
    speakText(response);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerNotification("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      triggerNotification("Voice recognition error. Please try again.");
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSendMessage(transcript);
      }
    };

    try { 
      recognition.start(); 
    } catch (e) { 
      triggerNotification("Could not start voice recognition."); 
    }
  };

  const handleLogin = (name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    setUserEmail("");
  };

  const handleProfileSave = () => {
    triggerNotification("Profile Updated Successfully!");
  };

  // Render Auth Screen
  if (!isLoggedIn) {
    return (
      <>
        <FluidCursor />
        <AuthScreen onLogin={handleLogin} />
      </>
    );
  }

  // Render SOS Screen
  if (isSOSActive) {
    return <SOSScreen onDismiss={() => setIsSOSActive(false)} />;
  }

  // Main App
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground md:cursor-none">
      <FluidCursor />
      
      <Header onMenuOpen={() => setIsMenuOpen(true)} />
      
      <SlideOutMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={userName}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <main className="max-w-4xl mx-auto p-4 pt-24 pb-12 min-h-screen">
        <Notification message={notificationMsg} isVisible={showNotification} />

        {activeTab === 'profile' && (
          <ProfileTab 
            userName={userName}
            setUserName={setUserName}
            userEmail={userEmail}
            setUserEmail={setUserEmail}
            onSave={handleProfileSave}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard 
            userName={userName}
            sleepHours={sleepHours}
            setSleepHours={setSleepHours}
            energyLevel={energyLevel}
            tasks={tasks}
            dailyInsight={dailyInsight}
            loadingInsight={loadingInsight}
            onGenerateInsight={handleGenerateInsight}
          />
        )}

        {activeTab === 'study' && (
          <StudyPlanner 
            tasks={tasks}
            setTasks={setTasks}
            sleepHours={sleepHours}
            onGeneratePlan={handleGeneratePlan}
            loadingPlan={loadingPlan}
          />
        )}

        {activeTab === 'safety' && (
          <div className="animate-slide-in-bottom space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-destructive">🛡️</span> Safety Guardian
            </h2>
            <div className="glass-card p-6 text-center">
              <p className="text-muted-foreground mb-6">
                In case of emergency, press the SOS button to alert your emergency contacts and share your location.
              </p>
              <button 
                onClick={() => setIsSOSActive(true)}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-105"
              >
                🚨 ACTIVATE SOS
              </button>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <AIChat 
            chatHistory={chatHistory}
            isAiThinking={isAiThinking}
            isSpeaking={isSpeaking}
            isListening={isListening}
            isTtsEnabled={isTtsEnabled}
            onToggleTts={() => setIsTtsEnabled(!isTtsEnabled)}
            onVoiceInput={handleVoiceInput}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>
    </div>
  );
};

export default Index;

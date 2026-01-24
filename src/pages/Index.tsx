import { useState, useRef, useEffect } from 'react';
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useDebounce } from "@/hooks/use-debounce";

import FluidCursor from '@/components/FluidCursor';
import SOSScreen from '@/components/safety/SOSScreen';
import Header from '@/components/layout/Header';
import SlideOutMenu from '@/components/layout/SlideOutMenu';
import Dashboard from '@/components/dashboard/Dashboard';
import StudyPlanner from '@/components/study/StudyPlanner';
import PomodoroTimer from '@/components/study/PomodoroTimer';
import AIChat from '@/components/chat/AIChat';
import ProfileTab from '@/components/profile/ProfileTab';
import ResourcesTab from '@/components/resources/ResourcesTab';
import GymMateTab from '@/components/gym/GymMateTab';
import Notification from '@/components/ui/Notification';
import {
  sendChatMessage,
  generateInsight,
  generateStudyPlanAlternate,
  saveUserData,
  loadUserData,
  Task as ApiTask
} from '@/lib/api';

type TabType = 'profile' | 'dashboard' | 'study' | 'safety' | 'chat' | 'resources' | 'gym';

export interface Message {
  role: 'user' | 'model';
  text: string;
}

interface Task extends ApiTask {
  id: number;
  completed: boolean;
}

interface Attachment {
  name: string;
  type: string;
  data: string;
  category: 'image' | 'pdf' | 'text' | 'other';
}

interface IndexProps {
  user: { uid: string; name: string; email: string };
}

const initialChatMsg: Message = {
    role: 'model',
    text: "Hi! I'm Leo, your friendly AI tutor. How can I help you today? 😊"
};

const Index = ({ user }: IndexProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[]>([initialChatMsg]);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [userName, setUserName] = useState(user?.name || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [sleepHours, setSleepHours] = useState(8);
  const [energyLevel] = useState(80);
  const [dailyInsight, setDailyInsight] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const debouncedUserName = useDebounce(userName, 1500);
  const debouncedUserEmail = useDebounce(userEmail, 1500);
  const debouncedSleepHours = useDebounce(sleepHours, 1500);
  const debouncedTasks = useDebounce(tasks, 1500);
  const debouncedChatHistory = useDebounce(chatHistory, 2000);

  useEffect(() => {
    if (user) {
      setIsDataLoading(true);
      loadUserData(user.uid).then(data => {
        if (data) {
          setUserName(data.name || user.name || "");
          setUserEmail(data.email || user.email || "");
          setSleepHours(data.sleepHours || 8);
          setTasks(data.tasks || []);
          setChatHistory(data.chatHistory?.length ? (data.chatHistory as Message[]) : [initialChatMsg]);
        }
      }).catch(err => {
        console.error(err);
        triggerNotification(err instanceof Error ? err.message : "Error loading data.");
      }).finally(() => {
        setIsDataLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    if (isDataLoading || !user) return;
    const dataToSave = {
      name: debouncedUserName,
      email: debouncedUserEmail,
      sleepHours: debouncedSleepHours,
      tasks: debouncedTasks,
      chatHistory: debouncedChatHistory,
    };
    saveUserData(user.uid, dataToSave).catch(console.error);
  }, [debouncedUserName, debouncedUserEmail, debouncedSleepHours, debouncedTasks, debouncedChatHistory, user, isDataLoading]);
  
  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3500);
  };

  const handleLogout = () => {
    signOut(auth).then(() => window.location.reload()).catch(console.error);
  };

  const speakText = (text: string) => {
    if (!isTtsEnabled || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = console.error;
    window.speechSynthesis.speak(utterance);
  };

  const handleProfileSave = () => {
    if(!user) return;
    saveUserData(user.uid, { name: userName, email: userEmail })
      .then(() => triggerNotification("Profile Updated!"))
      .catch((e) => triggerNotification(e.message));
  };
  
  const handleClearChat = () => {
      setChatHistory([initialChatMsg]);
      triggerNotification("Chat history cleared.");
  }

  const handleGenerateInsight = async () => {
    setLoadingInsight(true);
    setDailyInsight("");
    try {
      const insight = await generateInsight(sleepHours, energyLevel);
      setDailyInsight(insight);
      speakText(insight);
    } catch (error) {
      console.error(error);
      triggerNotification(error instanceof Error ? error.message : "Could not get insight.");
    }
    setLoadingInsight(false);
  };

  const handleGeneratePlan = async (topic: string) => {
    if (!topic.trim()) {
      triggerNotification("Please enter a topic.");
      return;
    }
    setLoadingPlan(true);
    try {
      const planTasks = await generateStudyPlanAlternate(topic, sleepHours);
      if (planTasks?.length > 0) {
        const newTasks: Task[] = planTasks.map((t, idx) => ({ ...t, id: Date.now() + idx, completed: false }));
        setTasks(newTasks);
        triggerNotification("✨ Your Magic Plan is ready!");
        speakText(`I've created a study plan for ${topic}.`);
        setActiveTab('study');
      } else {
        triggerNotification("The AI couldn't generate a plan. Try another topic!");
      }
    } catch (error) {
      console.error(error);
      triggerNotification(error instanceof Error ? error.message : "Failed to create plan.");
    }
    setLoadingPlan(false);
  };

  const handleSendMessage = async (message: string, attachment?: Attachment | null) => {
    if (!user || (!message.trim() && !attachment)) return;
    const userMessage: Message = { role: 'user', text: message || `[File: ${attachment?.name}]` };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);

    if (message.toLowerCase().includes('sos')) {
      setIsSOSActive(true);
      return;
    }

    setIsAiThinking(true);
    try {
      const response = await sendChatMessage(newHistory.map(m => ({...m})), userName, sleepHours, attachment);
      setChatHistory(prev => [...prev, { role: 'model', text: response }]);
      speakText(response);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error.";
      setChatHistory(prev => [...prev, { role: 'model', text: `Sorry, an error occurred: ${errorMsg}` }]);
    }
    setIsAiThinking(false);
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return triggerNotification("Voice recognition isn't supported.");
    if (isListening) return recognitionRef.current?.stop();

    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech') triggerNotification("Voice recognition error.");
    };
    recognition.onresult = (e: any) => handleSendMessage(e.results[0][0].transcript);
    recognition.start();
  };
  
  if (isDataLoading) return <div className="flex items-center justify-center h-screen bg-background"><p>Loading OS...</p></div>;
  if (isSOSActive) return <SOSScreen onDismiss={() => setIsSOSActive(false)} />;

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 min-h-screen">
        <Notification message={notificationMsg} isVisible={showNotification} />

        {activeTab === 'profile' && 
          <ProfileTab 
            userName={userName} 
            setUserName={setUserName} 
            userEmail={userEmail} 
            setUserEmail={setUserEmail} 
            onSave={handleProfileSave} 
          />
        }

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
            onGoToStudyPlan={() => setActiveTab('study')} 
          />
        )}
        
        {activeTab === 'study' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <StudyPlanner 
                tasks={tasks} 
                setTasks={setTasks} 
                sleepHours={sleepHours}
                onGeneratePlan={handleGeneratePlan} 
                loadingPlan={loadingPlan} 
              />
            </div>
            <div className="lg:col-span-2">
              <PomodoroTimer />
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
            onClearChat={handleClearChat}
          />
        )}

        {activeTab === 'resources' && <ResourcesTab />}

        {activeTab === 'gym' && <GymMateTab />}

        {activeTab === 'safety' && (
          <div className="animate-slide-in-bottom space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2"><span className="text-destructive">🛡️</span> Safety Guardian</h2>
            <div className="glass-card p-6 text-center">
              <p className="text-muted-foreground mb-6">In case of emergency, press the SOS button.</p>
              <button onClick={() => setIsSOSActive(true)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-8 py-4 rounded-xl font-bold text-xl shadow-lg transition-all transform hover:scale-105">
                🚨 ACTIVATE SOS
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;

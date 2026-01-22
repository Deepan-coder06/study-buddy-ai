import { X, User, Activity, BookOpen, ShieldAlert, Brain, LogOut } from 'lucide-react';

type TabType = 'profile' | 'dashboard' | 'study' | 'safety' | 'chat';

interface SlideOutMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

const menuItems: { id: TabType; icon: typeof User; label: string; colorClass: string }[] = [
  { id: 'profile', icon: User, label: 'My Profile', colorClass: 'text-accent' },
  { id: 'dashboard', icon: Activity, label: 'Dashboard', colorClass: 'text-success' },
  { id: 'study', icon: BookOpen, label: 'Study Planner', colorClass: 'text-warning' },
  { id: 'safety', icon: ShieldAlert, label: 'Safety Guardian', colorClass: 'text-destructive' },
  { id: 'chat', icon: Brain, label: 'AI Assistant', colorClass: 'text-primary' },
];

const SlideOutMenu = ({ isOpen, onClose, activeTab, setActiveTab, userName, userEmail, onLogout }: SlideOutMenuProps) => {
  const menuAnimation = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden ${isOpen ? 'block' : 'hidden'}`}
        onClick={onClose} 
      />
      
      <div 
        className={`fixed top-0 right-0 z-[60] h-full w-full max-w-sm transform transition-transform duration-300 ease-in-out bg-background/95 backdrop-blur-xl flex flex-col ${menuAnimation}`}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border">
          <span className="text-xl font-bold text-muted-foreground">Menu</span>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={28} />
          </button>
        </div>
        
        <div className="flex-1 p-4 sm:p-6 flex flex-col gap-3 overflow-y-auto">
          <div className="p-4 glass-card flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground flex-shrink-0">
              {userName.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">{userName}</h3>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          </div>

          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); onClose(); }}
              className={`p-3 sm:p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary flex items-center gap-4 transition-all group ${
                activeTab === item.id ? 'border-primary/50 bg-primary/10' : ''
              }`}
            >
              <item.icon className={`${item.colorClass} group-hover:scale-110 transition-transform`} size={22} />
              <span className={`font-semibold text-base sm:text-lg ${activeTab === item.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                {item.label}
              </span>
              {activeTab === item.id && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
            </button>
          ))}

          <div className="mt-auto pt-6 sm:pt-8">
            <button 
              onClick={onLogout}
              className="w-full p-4 rounded-xl border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={20} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SlideOutMenu;

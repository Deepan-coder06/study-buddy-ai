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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl animate-slide-in-right flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-border">
        <span className="text-xl font-bold text-muted-foreground">Menu</span>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={32} />
        </button>
      </div>
      
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
        {/* User Profile Card */}
        <div className="p-4 glass-card flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
            {userName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold">{userName}</h3>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
        </div>

        {/* Menu Items */}
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); onClose(); }}
            className={`p-4 rounded-xl border border-border bg-secondary/50 hover:bg-secondary flex items-center gap-4 transition-all group ${
              activeTab === item.id ? 'border-primary/50 bg-primary/10' : ''
            }`}
          >
            <item.icon className={`${item.colorClass} group-hover:scale-110 transition-transform`} size={24} />
            <span className={`font-semibold text-lg ${activeTab === item.id ? 'text-foreground' : 'text-muted-foreground'}`}>
              {item.label}
            </span>
            {activeTab === item.id && <div className="ml-auto w-2 h-2 rounded-full bg-primary" />}
          </button>
        ))}

        {/* Logout Button */}
        <div className="mt-auto pt-8">
          <button 
            onClick={onLogout}
            className="w-full p-4 rounded-xl border border-destructive/20 bg-destructive/10 hover:bg-destructive/20 text-destructive flex items-center justify-center gap-2 transition-all"
          >
            <LogOut size={20} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SlideOutMenu;

import { X, User, LayoutDashboard, CalendarCheck, MessageSquare, Shield, BookOpen, Dumbbell } from 'lucide-react';

type TabType = 'profile' | 'dashboard' | 'study' | 'safety' | 'chat' | 'resources' | 'gym';

interface SlideOutMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

const NavItem = ({ icon, label, isActive, onClick, isMobile }: { icon: any, label: string, isActive: boolean, onClick: () => void, isMobile?: boolean }) => (
  <button onClick={onClick} className={`flex items-center gap-4 w-full text-left px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-white/5'} ${isMobile ? 'text-lg' : 'text-base'}`}>
    {icon}
    <span>{label}</span>
  </button>
);


const SlideOutMenu = ({ isOpen, onClose, activeTab, setActiveTab, userName, userEmail, onLogout }: SlideOutMenuProps) => {

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    onClose();
  }

  return (
    <>
        {/* Overlay for mobile */}
        <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}></div>
        
        {/* Menu */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-card text-card-foreground p-6 shadow-xl transform transition-transform z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold">Menu</h2>
                <button onClick={onClose} className="btn-icon">
                    <X size={24} />
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
                <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" isActive={activeTab === 'dashboard'} onClick={() => handleTabClick('dashboard')} />
                <NavItem icon={<CalendarCheck size={20} />} label="Study Plan" isActive={activeTab === 'study'} onClick={() => handleTabClick('study')} />
                <NavItem icon={<MessageSquare size={20} />} label="AI Chat" isActive={activeTab === 'chat'} onClick={() => handleTabClick('chat')} />
                <NavItem icon={<BookOpen size={20} />} label="Resources" isActive={activeTab === 'resources'} onClick={() => handleTabClick('resources')} />
                <NavItem icon={<Dumbbell size={20} />} label="Gym Mate" isActive={activeTab === 'gym'} onClick={() => handleTabClick('gym')} />
                <NavItem icon={<Shield size={20} />} label="Safety" isActive={activeTab === 'safety'} onClick={() => handleTabClick('safety')} />
            </nav>

            {/* Footer with User Info */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="border-t border-white/10 pt-4">
                <NavItem icon={<User size={20} />} label="Profile" isActive={activeTab === 'profile'} onClick={() => handleTabClick('profile')} />
                <div className="mt-2 text-center">
                    <p className="text-sm font-semibold truncate">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    <button onClick={onLogout} className="mt-3 w-full text-left text-sm text-red-400 hover:text-red-500 transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
                        Logout
                    </button>
                </div>
              </div>
            </div>
        </div>
    </>
  );
}

export default SlideOutMenu;

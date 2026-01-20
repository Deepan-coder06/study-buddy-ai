import { User, Save } from 'lucide-react';

interface ProfileTabProps {
  userName: string;
  setUserName: (name: string) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  onSave: () => void;
}

const ProfileTab = ({ userName, setUserName, userEmail, setUserEmail, onSave }: ProfileTabProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="animate-slide-in-bottom max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <User size={32} className="text-accent" />
        <h2 className="text-3xl font-bold">My Profile</h2>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-secondary border-4 border-border flex items-center justify-center mb-2">
              <User size={48} className="text-muted-foreground" />
            </div>
            <button type="button" className="text-primary text-sm hover:underline">
              Change Photo
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <input 
              type="text" 
              value={userName} 
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-input border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Email Address</label>
            <input 
              type="email" 
              value={userEmail} 
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full bg-input border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Target Sleep (Hrs)</label>
              <input 
                type="number" 
                defaultValue={8} 
                className="w-full bg-input border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">University</label>
              <input 
                type="text" 
                placeholder="Add University"
                className="w-full bg-input border border-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-gradient-primary text-primary-foreground font-bold py-3 rounded-xl shadow-lg glow-effect transition-all hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Save size={20} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileTab;

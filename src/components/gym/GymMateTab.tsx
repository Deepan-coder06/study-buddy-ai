import { Dumbbell } from 'lucide-react';

const GymMateTab = () => {
  return (
    <div className="animate-slide-in-bottom space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><Dumbbell size={24} /> Gym Mate</h2>
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">Your workout plans and fitness tracker will be here soon.</p>
      </div>
    </div>
  );
}

export default GymMateTab;

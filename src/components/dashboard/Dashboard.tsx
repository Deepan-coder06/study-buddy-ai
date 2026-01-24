import { Zap, Moon, ListChecks, BrainCircuit, Wind, Sun } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

interface DashboardProps {
  userName: string;
  sleepHours: number;
  setSleepHours: (hours: number) => void;
  energyLevel: number;
  tasks: Task[];
  dailyInsight: string;
  loadingInsight: boolean;
  onGenerateInsight: () => void;
  onGoToStudyPlan: () => void;
}

const StatCard = ({ icon, title, value, unit, color }: any) => (
  <div className="glass-card flex flex-col items-center justify-center p-4 h-32">
    <div className={`flex items-center justify-center h-10 w-10 rounded-full mb-2 ${color}`}>
      {icon}
    </div>
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="font-bold text-lg">{value} <span className="text-xs">{unit}</span></p>
  </div>
);

const Dashboard = ({ 
  userName, 
  sleepHours, 
  setSleepHours, 
  energyLevel,
  tasks,
  dailyInsight,
  loadingInsight,
  onGenerateInsight,
  onGoToStudyPlan
}: DashboardProps) => {

  const completedTasks = tasks.filter(t => t.completed).length;
  const stressLevel = sleepHours < 6 ? 'High' : (sleepHours < 7.5 ? 'Normal' : 'Low');
  const breaksTaken = 2; // Static for now

  return (
    <div className="animate-slide-in-bottom space-y-8">
      
      {/* Header */}
      <h1 className="text-3xl font-bold">Welcome back, {userName.split(' ')[0]}!</h1>

      {/* AI Insight Section */}
      <div className="glass-card p-6 flex flex-col md:flex-row items-center gap-4">
        <div className="flex-shrink-0">
          <Sun className="w-10 h-10 text-yellow-400" />
        </div>
        <div className="flex-grow">
          <h2 className="font-bold text-lg">AI Daily Insight</h2>
          <p className="text-muted-foreground text-sm h-12 overflow-y-auto">
            {loadingInsight ? 'Generating your personal insight...' : (dailyInsight || 'Click the button for your personalized tip!')}
          </p>
        </div>
        <button onClick={onGenerateInsight} disabled={loadingInsight} className="btn btn-secondary w-full md:w-auto">
          {loadingInsight ? 'Thinking...' : 'Get Daily Insight'}
        </button>
      </div>

      {/* Sleep & Plan Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <h2 className="font-bold text-lg flex items-center gap-2 mb-3"><Moon size={20} /> Last Night's Sleep</h2>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="12" 
              step="0.5" 
              value={sleepHours} 
              onChange={(e) => setSleepHours(parseFloat(e.target.value))} 
              className="w-full"
            />
            <span className="font-bold text-primary w-20 text-center">{sleepHours} hrs</span>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">Slide to adjust last night's sleep.</p>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <h2 className="font-bold text-lg flex items-center gap-2 mb-2"><BrainCircuit size={20} /> AI Study Plan</h2>
            <p className="text-muted-foreground text-sm mb-4">Ready to learn something new? Let the AI create a plan for you.</p>
            <button onClick={onGoToStudyPlan} className="btn btn-secondary w-full">
              Create a Magic Plan
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        <StatCard icon={<Zap size={20} />} title="Energy" value={`${energyLevel}%`} color="bg-green-500/20 text-green-400" />
        <StatCard icon={<ListChecks size={20} />} title="Tasks" value={`${completedTasks}/${tasks.length}`} color="bg-blue-500/20 text-blue-400" />
        <StatCard icon={<BrainCircuit size={20} />} title="Stress" value={stressLevel} color="bg-yellow-500/20 text-yellow-400" />
        <StatCard icon={<Wind size={20} />} title="Breaks" value={breaksTaken} unit="taken" color="bg-indigo-500/20 text-indigo-400" />
      </div>

    </div>
  );
}

export default Dashboard;

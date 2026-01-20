import { useState } from 'react';
import { Moon, Activity, CheckCircle2, Brain, Coffee, Sparkles, Loader2 } from 'lucide-react';

interface DashboardProps {
  userName: string;
  sleepHours: number;
  setSleepHours: (hours: number) => void;
  energyLevel: number;
  tasks: Array<{ id: number; completed: boolean }>;
  dailyInsight: string;
  loadingInsight: boolean;
  onGenerateInsight: () => void;
}

const Dashboard = ({
  userName,
  sleepHours,
  setSleepHours,
  energyLevel,
  tasks,
  dailyInsight,
  loadingInsight,
  onGenerateInsight,
}: DashboardProps) => {
  const sleepPercentage = Math.round((sleepHours / 8) * 100);
  const completedTasks = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 animate-slide-in-bottom">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Welcome Card & AI Insight */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome Back, {userName}! 🎓</h2>
            <p className="text-muted-foreground mb-4">
              {dailyInsight || "Your AI analysis suggests a productive evening based on your energy levels."}
            </p>
          </div>
          <button 
            onClick={onGenerateInsight}
            disabled={loadingInsight}
            className="self-start bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground text-sm px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loadingInsight ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {loadingInsight ? "Analyzing Health..." : "Get AI Daily Insight"}
          </button>
        </div>

        {/* Sleep Tracker */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Moon className="text-accent" /> Sleep Tracker
              </h3>
              <p className="text-3xl font-bold mt-2">{sleepHours} hrs</p>
            </div>
            <div className="h-16 w-16 rounded-full border-4 border-accent flex items-center justify-center bg-accent/10">
              <span className="text-sm font-bold">{sleepPercentage}%</span>
            </div>
          </div>
          <input 
            type="range" 
            min="0" 
            max="12" 
            value={sleepHours} 
            onChange={(e) => setSleepHours(parseInt(e.target.value))}
            className="w-full mt-4 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <p className="text-xs text-muted-foreground mt-2">Slide to adjust last night's sleep</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
          <Activity className="mx-auto text-success mb-2" />
          <div className="text-2xl font-bold">{energyLevel}%</div>
          <div className="text-xs text-muted-foreground">Energy</div>
        </div>
        <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
          <CheckCircle2 className="mx-auto text-primary mb-2" />
          <div className="text-2xl font-bold">{completedTasks}/{tasks.length}</div>
          <div className="text-xs text-muted-foreground">Tasks</div>
        </div>
        <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
          <Brain className="mx-auto text-accent mb-2" />
          <div className="text-2xl font-bold">Normal</div>
          <div className="text-xs text-muted-foreground">Stress</div>
        </div>
        <div className="glass-card p-4 text-center hover:scale-105 transition-transform">
          <Coffee className="mx-auto text-warning mb-2" />
          <div className="text-2xl font-bold">2</div>
          <div className="text-xs text-muted-foreground">Breaks</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

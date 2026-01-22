import { useState } from 'react';
import { Plus, Sparkles, X, CheckCircle2, Loader2, Brain } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface Task {
  id: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

interface StudyPlannerProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  sleepHours: number;
  onGeneratePlan: (topic: string) => Promise<void>;
  loadingPlan: boolean;
}

const StudyPlanner = ({ tasks, setTasks, sleepHours, onGeneratePlan, loadingPlan }: StudyPlannerProps) => {
  const [showPlanInput, setShowPlanInput] = useState(false);
  const [planTopic, setPlanTopic] = useState('');
  const isMobile = useMobile();

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addNewTask = () => {
    setTasks([...tasks, { 
      id: Date.now(), 
      title: "New Task", 
      priority: "Medium", 
      completed: false 
    }]);
  };

  const handleGeneratePlan = async () => {
    if (!planTopic.trim()) return;
    await onGeneratePlan(planTopic);
    setPlanTopic('');
    setShowPlanInput(false);
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-destructive/20 text-destructive-foreground';
      case 'Medium':
        return 'bg-warning/20 text-warning-foreground';
      default:
        return 'bg-success/20 text-success-foreground';
    }
  };

  return (
    <div className="space-y-4 animate-slide-in-bottom">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold">AI Study Plan</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowPlanInput(!showPlanInput)}
            className="bg-accent/20 hover:bg-accent/30 border border-accent/50 text-accent-foreground px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
          >
            <Sparkles size={16} /> {!isMobile && 'Magic Plan'}
          </button>
          <button 
            onClick={addNewTask}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
          >
            <Plus size={16} /> {!isMobile && 'Add'}
          </button>
        </div>
      </div>
      
      {showPlanInput && (
        <div className="glass-card p-4 border-accent/50 mb-4 animate-slide-in-bottom">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-accent">What do you want to study?</label>
            <button onClick={() => setShowPlanInput(false)}>
              <X size={16} className="text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={planTopic}
              onChange={(e) => setPlanTopic(e.target.value)}
              placeholder="e.g., 'Calculus Revision'"
              className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent"
              onKeyDown={(e) => e.key === 'Enter' && handleGeneratePlan()}
            />
            <button 
              onClick={handleGeneratePlan}
              disabled={loadingPlan || !planTopic.trim()}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-lg text-sm disabled:opacity-50 transition-all"
            >
              {loadingPlan ? <Loader2 className="animate-spin" size={16} /> : 'Generate'}
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">AI will break this topic into actionable tasks.</p>
        </div>
      )}

      {tasks.map(task => (
        <div 
          key={task.id} 
          onClick={() => toggleTask(task.id)}
          className={`glass-card p-3 sm:p-4 flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            task.completed ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
              task.completed ? 'bg-success border-success' : 'border-muted-foreground'
            }`}>
              {task.completed && <CheckCircle2 size={16} className="text-success-foreground" />}
            </div>
            <div>
              <h3 className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityStyles(task.priority)}`}>
                {task.priority} Priority
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            {task.completed ? 'Done' : 'Pending'}
          </div>
        </div>
      ))}
      
      <div className="glass-card p-4 border-accent/30 mt-6 sm:mt-8">
        <h3 className="text-accent font-bold mb-2 flex items-center gap-2">
          <Brain size={18} /> AI Suggestion
        </h3>
        <p className="text-sm text-muted-foreground">
          Based on your sleep log of {sleepHours} hours, your concentration might dip around 3 PM. 
          Schedule your "High Priority" tasks while your cognitive load is fresh.
        </p>
      </div>
    </div>
  );
};

export default StudyPlanner;
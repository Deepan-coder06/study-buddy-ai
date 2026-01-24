import { BookOpen } from 'lucide-react';

const ResourcesTab = () => {
  return (
    <div className="animate-slide-in-bottom space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen size={24} /> Resources</h2>
      <div className="glass-card p-6 text-center">
        <p className="text-muted-foreground">Useful links and resources will be available here soon.</p>
      </div>
    </div>
  );
}

export default ResourcesTab;

import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuOpen: () => void;
}

const Header = ({ onMenuOpen }: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-lg text-primary-foreground">
                S
            </div>
          <h1 className="text-xl font-bold">StudentLifeOS</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onMenuOpen} className="btn-icon md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;

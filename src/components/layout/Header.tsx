import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuOpen: () => void;
}

const Header = ({ onMenuOpen }: HeaderProps) => {
  return (
    <header className="fixed top-0 w-full bg-background/90 backdrop-blur-md border-b border-border z-50 p-4 px-6 flex justify-between items-center shadow-lg">
      <h1 className="text-2xl font-bold">
        <span className="gradient-text">StudentLife</span>
        <span className="font-light">OS</span>
      </h1>
      <button 
        onClick={onMenuOpen}
        className="p-2 rounded-xl glass-card text-primary transition-all hover:bg-secondary"
      >
        <Menu size={28} />
      </button>
    </header>
  );
};

export default Header;

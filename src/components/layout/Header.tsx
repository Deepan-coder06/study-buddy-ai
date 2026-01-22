import { Menu } from 'lucide-react';

interface HeaderProps {
  onMenuOpen: () => void;
}

const Header = ({ onMenuOpen }: HeaderProps) => {
  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-lg border-b border-border z-50 p-4 md:px-8 px-4 flex justify-between items-center shadow-md">
      {/* Add the aurora effect behind the header */}
      <div className="aurora-bg"></div>

      <h1 className="text-2xl font-bold z-10">
        <span className="gradient-text">StudentLife</span>
        <span className="font-light">OS</span>
      </h1>

      <button 
        onClick={onMenuOpen}
        className="p-2 rounded-xl glass-card text-primary transition-all hover:bg-secondary z-10"
      >
        <Menu size={28} />
      </button>
    </header>
  );
};

export default Header;

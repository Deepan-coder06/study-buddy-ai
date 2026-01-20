import { ShieldAlert, Phone } from 'lucide-react';

interface SOSScreenProps {
  onDismiss: () => void;
}

const SOSScreen = ({ onDismiss }: SOSScreenProps) => {
  return (
    <div className="min-h-screen bg-destructive flex flex-col items-center justify-center p-4 text-destructive-foreground animate-pulse">
      <ShieldAlert size={120} className="mb-6" />
      <h1 className="text-5xl font-bold mb-4 text-center">EMERGENCY MODE</h1>
      <p className="text-xl mb-8 text-center">Sharing Live Location with Parents & Campus Security...</p>
      
      <div className="bg-white text-destructive p-6 rounded-xl w-full max-w-md mb-8">
        <h2 className="font-bold text-lg mb-2">Emergency Contacts</h2>
        <div className="flex items-center gap-2 mb-2">
          <Phone size={20} /> Campus Security: +91 999-999-9999
        </div>
        <div className="flex items-center gap-2">
          <Phone size={20} /> Warden: +91 888-888-8888
        </div>
      </div>

      <button 
        onClick={onDismiss}
        className="bg-white text-destructive px-8 py-3 rounded-full font-bold text-xl shadow-lg hover:bg-gray-100 transition-all"
      >
        I AM SAFE NOW
      </button>
    </div>
  );
};

export default SOSScreen;

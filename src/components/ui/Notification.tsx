interface NotificationProps {
  message: string;
  isVisible: boolean;
}

const Notification = ({ message, isVisible }: NotificationProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-full shadow-lg z-50 animate-bounce-subtle glow-effect">
      {message}
    </div>
  );
};

export default Notification;

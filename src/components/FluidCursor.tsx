import { useEffect, useRef } from 'react';

const FluidCursor = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
      }

      if (cursorRingRef.current) {
        cursorRingRef.current.animate({
          transform: `translate(${clientX}px, ${clientY}px)`
        }, { duration: 800, fill: "forwards", easing: "ease-out" });
      }
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, []);

  return (
    <div className="hidden md:block pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <div 
        ref={cursorDotRef} 
        className="w-2 h-2 bg-primary rounded-full fixed top-0 left-0 -ml-1 -mt-1 mix-blend-screen shadow-[0_0_10px_hsl(var(--primary))]" 
      />
      <div 
        ref={cursorRingRef} 
        className="w-8 h-8 border border-primary/30 rounded-full fixed top-0 left-0 -ml-4 -mt-4 transition-transform will-change-transform"
      />
    </div>
  );
};

export default FluidCursor;

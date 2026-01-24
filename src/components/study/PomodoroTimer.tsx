
import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            if (isBreak) {
              // End of break
              setIsBreak(false);
              setMinutes(25);
              setSessionCount(sessionCount + 1);
            } else {
              // End of work session
              setIsBreak(true);
              if ((sessionCount + 1) % 4 === 0) {
                setMinutes(15); // Long break
              } else {
                setMinutes(5); // Short break
              }
            }
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval!);
    }

    return () => clearInterval(interval!);
  }, [isActive, seconds, minutes, isBreak, sessionCount]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
    setSessionCount(0);
  };

  return (
    <div className="glass-card p-6 text-center">
      <h3 className="text-lg font-bold mb-2">{isBreak ? 'Break Time' : 'Study Session'}</h3>
      <div className="text-6xl font-mono mb-4">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>
      <div className="flex justify-center gap-4">
        <button onClick={toggleTimer} className="p-3 bg-primary text-primary-foreground rounded-full">
          {isActive ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={resetTimer} className="p-3 bg-secondary text-secondary-foreground rounded-full">
          <RefreshCw size={24} />
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;

import { useState, useEffect } from 'react';

/** Cuenta regresiva en segundos. Retorna el valor actual y una función para iniciarlo. */
export const useCountdown = () => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  const start = (duration: number) => setSeconds(duration);

  return { seconds, start };
};

'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';

interface AnimatedStemProgressProps {
  value: number;
}

const getGradient = (percentage: number) => {
  const colors = [
    { stop: 0, color: 'hsl(var(--mastery-0))' },
    { stop: 25, color: 'hsl(var(--mastery-1))' },
    { stop: 50, color: 'hsl(var(--mastery-2))' },
    { stop: 75, color: 'hsl(var(--mastery-3))' },
    { stop: 100, color: 'hsl(var(--mastery-4))' },
  ];

  let startColor = colors[0].color;
  let endColor = colors[0].color;

  for (let i = 0; i < colors.length - 1; i++) {
    if (percentage >= colors[i].stop && percentage <= colors[i + 1].stop) {
      const range = colors[i + 1].stop - colors[i].stop;
      const progressInRange = (percentage - colors[i].stop) / range;
      startColor = colors[i].color;
      endColor = colors[i + 1].color;
      return `linear-gradient(90deg, ${startColor}, ${endColor} ${progressInRange * 100}%)`;
    }
  }

  return `linear-gradient(90deg, ${colors[colors.length-1].color}, ${colors[colors.length-1].color})`;
};


export function AnimatedStemProgress({ value }: AnimatedStemProgressProps) {
  const roundedValue = Math.round(value);
  const shouldReduceMotion = useReducedMotion();
  const [isComplete, setIsComplete] = useState(roundedValue === 100);

  useEffect(() => {
    if (roundedValue === 100) {
      const timer = setTimeout(() => setIsComplete(true), 500); // delay to allow animation
      return () => clearTimeout(timer);
    } else {
      setIsComplete(false);
    }
  }, [roundedValue]);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: getGradient(roundedValue),
                backgroundImage: `linear-gradient(90deg, hsl(var(--mastery-0)), hsl(var(--mastery-1)), hsl(var(--mastery-2)), hsl(var(--mastery-3)), hsl(var(--mastery-4)))`,
              }}
              initial={shouldReduceMotion ? false : { width: 0 }}
              animate={{
                width: `${roundedValue}%`,
              }}
              transition={shouldReduceMotion ? { duration: 0 } : {
                duration: 0.8,
                ease: "easeOut",
              }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(90deg,hsla(0,0%,100%,0)_0,hsla(0,0%,100%,.3)_50%,hsla(0,0%,100%,0)_100%)] bg-no-repeat animate-shimmer rounded-full" style={{ backgroundSize: '400px 100%' }} />
            </motion.div>
             {isComplete && (
               <motion.div
                className="absolute right-1 top-1/2 -translate-y-1/2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 15 }}
               >
                 <CheckCircle2 className="size-3 text-white/80" />
               </motion.div>
             )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mastery: {roundedValue}%</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { AvatarType } from '../types';

interface TrackProps {
  avatar: AvatarType;
  progress: number; // 0 to 100
}

export const Track: React.FC<TrackProps> = ({ avatar, progress }) => {
  // Constrain progress safely
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Determine styles based on avatar
  const getTrackStyles = () => {
    switch (avatar) {
      case 'horse':
        return {
          containerClass: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60 shadow-[inset_0_2px_8px_rgba(16,185,129,0.06)]',
          lineClass: 'border-b-2 border-dashed border-emerald-300/60 dark:border-emerald-800/40',
          trackIcon: '🐎',
          trailIcon: '✨',
          bgDecoration: (
            <div className="absolute inset-0 opacity-20 pointer-events-none select-none flex justify-around items-center text-sm">
              <span>🌲</span>
              <span>🌸</span>
              <span>🌲</span>
              <span>🌸</span>
              <span>🌲</span>
            </div>
          )
        };
      case 'rocket':
        return {
          containerClass: 'bg-slate-950 border-indigo-950/80 shadow-[inset_0_2px_12px_rgba(99,102,241,0.15)] overflow-hidden',
          lineClass: 'border-b border-indigo-900/30',
          trackIcon: '🚀',
          trailIcon: '🔥',
          bgDecoration: (
            <>
              {/* Star fields */}
              <div className="absolute inset-0 opacity-40 pointer-events-none select-none">
                <div className="absolute top-2 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-8 left-2/3 w-1.5 h-1.5 bg-indigo-200 rounded-full animate-pulse"></div>
                <div className="absolute top-12 left-10 w-0.5 h-0.5 bg-white rounded-full"></div>
                <div className="absolute top-4 left-5/6 w-1 h-1 bg-white rounded-full"></div>
              </div>
              {/* Nebula dust */}
              <div className="absolute -left-10 top-0 bottom-0 w-40 bg-indigo-500/5 blur-xl rounded-full"></div>
              <div className="absolute right-10 top-0 bottom-0 w-32 bg-purple-500/5 blur-xl rounded-full"></div>
            </>
          )
        };
      case 'car':
      default:
        return {
          containerClass: 'bg-slate-100 dark:bg-neutral-900 border-slate-300 dark:border-neutral-800 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]',
          lineClass: 'border-b-2 border-dashed border-slate-300 dark:border-neutral-800/60',
          trackIcon: '🏎️',
          trailIcon: '💨',
          bgDecoration: (
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none flex justify-between px-10 items-center text-xs font-mono">
              <span>[ START ]</span>
              <span>[ 50m ]</span>
            </div>
          )
        };
    }
  };

  const styles = getTrackStyles();

  return (
    <div className={`relative w-full h-24 rounded-3xl border p-1 overflow-hidden transition-all duration-300 ${styles.containerClass}`} id="typeracer-track">
      {styles.bgDecoration}

      {/* Center line */}
      <div className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 ${styles.lineClass}`}></div>

      {/* Path bar */}
      <div className="absolute left-6 right-16 top-1/2 -translate-y-1/2 h-1 bg-black/5 dark:bg-white/5 rounded-full"></div>

      {/* Animated avatar */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
        style={{
          left: `calc(1.5rem + (${clampedProgress}% * 0.82))`
        }}
        animate={{
          scale: clampedProgress === 100 ? [1, 1.15, 1] : 1,
          rotate: clampedProgress === 100 ? [0, -5, 5, 0] : 0
        }}
        transition={{
          type: 'spring',
          stiffness: 80,
          damping: 12
        }}
      >
        <div className="relative flex items-center justify-center">
          {/* Flame / Dust / Sparkle Trail */}
          {clampedProgress > 0 && clampedProgress < 100 && (
            <span className="absolute -left-6 text-base animate-pulse filter drop-shadow-sm select-none">
              {styles.trailIcon}
            </span>
          )}
          
          <span className="text-4xl filter drop-shadow-md select-none transform hover:scale-110 transition-transform cursor-default">
            {styles.trackIcon}
          </span>
        </div>
      </motion.div>

      {/* Finish line */}
      <div className="absolute right-4 top-0 bottom-0 w-8 flex flex-col justify-around items-center border-l-2 border-dashed border-slate-300 dark:border-neutral-800 bg-white/10 dark:bg-black/10">
        <span className="text-xl select-none animate-bounce" style={{ animationDuration: '3s' }}>🏁</span>
      </div>

      {/* Progress display */}
      <div className="absolute bottom-1 right-16 text-[10px] font-mono text-slate-400 dark:text-neutral-500">
        Урагшилсан: {Math.round(clampedProgress)}%
      </div>
    </div>
  );
};

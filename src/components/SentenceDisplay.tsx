import React from 'react';

interface SentenceDisplayProps {
  sentence: string;
  inputValue: string;
}

export const SentenceDisplay: React.FC<SentenceDisplayProps> = ({ sentence, inputValue }) => {
  // Find matching correct prefix index
  let correctIndex = 0;
  for (let i = 0; i < inputValue.length; i++) {
    if (inputValue[i] === sentence[i]) {
      correctIndex++;
    } else {
      break;
    }
  }

  // Segment characters:
  // 1. Correct typed characters: [0 to correctIndex - 1]
  // 2. Incorrect typed characters (mismatches): [correctIndex to inputValue.length - 1]
  // 3. Uncompleted characters: [inputValue.length to sentence.length - 1]
  // Wait, if the user typed more than sentence.length, we cap it at sentence.length.

  const renderCharacters = () => {
    const elements: React.ReactNode[] = [];
    const totalLength = sentence.length;

    for (let i = 0; i < totalLength; i++) {
      const char = sentence[i];
      let charClass = '';
      let isCurrent = i === inputValue.length;

      if (i < correctIndex) {
        // Correctly typed
        charClass = 'text-emerald-500 dark:text-emerald-400 font-semibold bg-emerald-500/5';
      } else if (i < inputValue.length) {
        // Mismatched
        charClass = 'text-rose-600 dark:text-rose-500 font-bold bg-rose-500/10 underline decoration-rose-500 decoration-wavy';
      } else {
        // Yet to be typed
        charClass = 'text-slate-400 dark:text-neutral-400';
      }

      // Spaces need a visible indicator if they are mismatched
      const isSpace = char === ' ';
      const displayChar = isSpace ? ' ' : char;

      elements.push(
        <span
          key={i}
          className={`relative text-xl sm:text-2xl font-mono px-[0.5px] rounded transition-all duration-100 ${charClass} ${
            isCurrent ? 'border-b-2 border-indigo-500 dark:border-emerald-500 animate-pulse' : ''
          }`}
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {isSpace && i < inputValue.length && i >= correctIndex ? (
            <span className="text-rose-400 opacity-60">␣</span>
          ) : (
            displayChar
          )}
        </span>
      );
    }

    return elements;
  };

  return (
    <div 
      className="w-full bg-slate-50 dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800/60 rounded-3xl p-6 sm:p-8 shadow-inner relative leading-relaxed select-none overflow-hidden" 
      id="sentence-display-box"
    >
      <div className="flex flex-wrap items-center gap-y-1">
        {renderCharacters()}
      </div>
      
      <div className="absolute right-4 bottom-2 text-[10px] font-mono text-slate-400 dark:text-neutral-600">
        Урт: {sentence.length} тэмдэгт
      </div>
    </div>
  );
};

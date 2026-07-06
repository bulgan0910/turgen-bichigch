import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, AlertTriangle, Target, RefreshCw, Trophy, CheckCircle2 } from 'lucide-react';

interface ResultsProps {
  wpm: number;
  errorCount: number;
  totalChars: number;
  name: string;
  avatar: 'car' | 'rocket' | 'horse';
  isSaving: boolean;
  scoreSaved: boolean;
  onRestart: () => void;
  onSaveScore: () => void;
}

export const Results: React.FC<ResultsProps> = ({
  wpm,
  errorCount,
  totalChars,
  name,
  avatar,
  isSaving,
  scoreSaved,
  onRestart,
  onSaveScore,
}) => {
  const accuracy = Math.max(0, Math.min(100, Math.round(((totalChars - errorCount) / totalChars) * 100)));

  // Decide funny or cool commentary based on WPM
  const getCommentary = () => {
    if (wpm >= 80) {
      return {
        title: 'Гайхалтай хурдан! ⚡',
        desc: 'Та бол жинхэнэ мэргэжлийн бичээч байна. Гар тань гэрлийн хурдаар хөдөлж байна!',
        color: 'text-emerald-500 dark:text-emerald-400'
      };
    } else if (wpm >= 50) {
      return {
        title: 'Маш сайн байна! 🔥',
        desc: 'Маш хурдан бөгөөд чадварлаг бичилт. Ингээд л байвал дээд амжилтыг эвдэх ойрхон байна.',
        color: 'text-emerald-500 dark:text-emerald-400'
      };
    } else if (wpm >= 30) {
      return {
        title: 'Сайн байна! 👍',
        desc: 'Таны хурд дундаж хэмжээнд байна. Дахин оролдож хурдаа нэмээрэй.',
        color: 'text-teal-500 dark:text-teal-400'
      };
    } else {
      return {
        title: 'Урагшаа, хичээгээрэй! 💪',
        desc: 'Дадлага сайн хийвэл хурд аяндаа нэмэгдэнэ. Дахин нэг оролдоод үзээрэй!',
        color: 'text-neutral-500 dark:text-neutral-400'
      };
    }
  };

  const commentary = getCommentary();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-md text-center max-w-xl mx-auto"
      id="results-panel"
    >
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-bounce">
          <Trophy className="w-8 h-8" />
        </div>
      </div>

      <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-neutral-100">
        Уралдаан дууслаа! 🎉
      </h2>
      <p className="text-slate-500 dark:text-neutral-400 text-sm mt-2 px-4">
        {name} таны {avatar === 'horse' ? 'хурдан морь' : avatar === 'rocket' ? 'сансрын пуужин' : 'спорт машин'} барианы шугаманд амжилттай хүрлээ!
      </p>

      {/* Commentary Box */}
      <div className="my-6 p-4 bg-slate-50 dark:bg-neutral-950/80 border border-slate-100 dark:border-neutral-800/80 rounded-2xl">
        <h4 className={`font-display font-bold text-base ${commentary.color}`}>
          {commentary.title}
        </h4>
        <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
          {commentary.desc}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-3 gap-3 my-6">
        {/* WPM */}
        <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/60 dark:border-emerald-500/10 rounded-2xl p-4 flex flex-col items-center justify-center">
          <Zap className="w-5 h-5 text-emerald-500 mb-1" />
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium uppercase tracking-wider">Бичих хурд</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {wpm}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">WPM</span>
        </div>

        {/* Errors */}
        <div className="bg-rose-50/50 dark:bg-rose-500/5 border border-rose-100/60 dark:border-rose-500/10 rounded-2xl p-4 flex flex-col items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-500 mb-1" />
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium uppercase tracking-wider">Алдааны тоо</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-rose-600 dark:text-rose-400 font-mono mt-0.5">
            {errorCount}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">алдаа</span>
        </div>

        {/* Accuracy */}
        <div className="bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100/60 dark:border-emerald-500/10 rounded-2xl p-4 flex flex-col items-center justify-center">
          <Target className="w-5 h-5 text-emerald-500 mb-1" />
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-medium uppercase tracking-wider">Нарийвчлал</span>
          <span className="text-2xl sm:text-3xl font-display font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
            {accuracy}%
          </span>
          <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">зөв</span>
        </div>
      </div>

      {/* DB Sync Status */}
      <div className="my-5 flex flex-col items-center">
        {scoreSaved ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Таны оноо Лидерүүдийн самбарт бүртгэгдлээ!</span>
          </div>
        ) : (
          <button
            onClick={onSaveScore}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 dark:disabled:bg-neutral-800/50 dark:text-black font-bold text-xs px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-md shadow-emerald-600/10"
          >
            {isSaving ? 'Оноог хадгалж байна...' : 'Оноог Лидерүүдийн самбарт хадгалах'}
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/60">
        <button
          onClick={onRestart}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black font-bold text-sm px-7 py-3.5 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-4 h-4 animate-spin-reverse" />
          Дахин тоглох
        </button>
      </div>
    </motion.div>
  );
};

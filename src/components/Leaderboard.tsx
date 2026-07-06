import React from 'react';
import { ScoreEntry } from '../types';
import { Trophy, Clock, Zap, AlertCircle } from 'lucide-react';

interface LeaderboardProps {
  scores: ScoreEntry[];
  isLoading: boolean;
  onRefresh?: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ scores, isLoading, onRefresh }) => {
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Сяхан';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('mn-MN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Сяхан';
    }
  };

  const getRankEmoji = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return `${index + 1}`;
    }
  };

  const getAvatarEmoji = (avatar: string) => {
    switch (avatar) {
      case 'horse': return '🐎';
      case 'rocket': return '🚀';
      case 'car':
      default:
        return '🏎️';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 shadow-sm overflow-hidden" id="leaderboard-card">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 rounded-xl">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-neutral-100 leading-none">
              ТОП 10 Лидерүүд
            </h3>
            <p className="text-xs text-slate-400 dark:text-neutral-500 mt-1">
              Бүх цаг үеийн хамгийн хурдан бичигчид
            </p>
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer disabled:opacity-50 font-bold"
          >
            {isLoading ? 'Шинэчилж байна...' : 'Шинэчлэх'}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 py-6" id="leaderboard-loading">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 dark:bg-neutral-800 rounded-lg"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-slate-100 dark:bg-neutral-800 rounded"></div>
                  <div className="w-16 h-3 bg-slate-100 dark:bg-neutral-800 rounded"></div>
                </div>
              </div>
              <div className="w-12 h-6 bg-slate-100 dark:bg-neutral-800 rounded"></div>
            </div>
          ))}
        </div>
      ) : scores.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-neutral-800 rounded-2xl">
          <p className="text-sm text-slate-400 dark:text-neutral-500">
            Одоогоор оноо бүртгэгдээгүй байна. Анхны дээд амжилтыг тогтооно уу! 🚀
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-neutral-800/60 max-h-[380px] overflow-y-auto pr-1" id="leaderboard-list">
          {scores.map((score, index) => (
            <div
              key={score.id || index}
              className={`flex items-center justify-between py-3.5 transition-all duration-200 ${
                index < 3 ? 'font-medium' : ''
              } ${index === 0 ? 'dark:bg-emerald-500/5 px-2 rounded-xl dark:border dark:border-emerald-500/10' : ''}`}
            >
              <div className="flex items-center gap-3">
                {/* Rank */}
                <div className="w-8 flex justify-center items-center font-display text-base font-bold dark:text-neutral-300">
                  {getRankEmoji(index)}
                </div>

                {/* Avatar and Name */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl filter drop-shadow-sm" title={score.avatar}>
                    {getAvatarEmoji(score.avatar)}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm text-slate-800 dark:text-neutral-200 font-semibold truncate max-w-[110px] sm:max-w-[160px]">
                        {score.name}
                      </div>
                      <span className="text-xs select-none" title={score.language === 'en' ? 'English' : 'Монгол'}>
                        {score.language === 'en' ? '🇬🇧' : '🇲🇳'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(score.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="text-right flex items-center gap-4">
                <div>
                  <div className="text-sm font-bold text-indigo-600 dark:text-emerald-400 font-mono flex items-center justify-end gap-0.5">
                    <Zap className="w-3.5 h-3.5 fill-indigo-100 dark:fill-emerald-950/40" />
                    {score.wpm} <span className="text-[10px] font-normal text-slate-400 dark:text-neutral-500">WPM</span>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-neutral-500 flex items-center justify-end gap-0.5 mt-0.5">
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                    <span>{score.errorCount} алдаа</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

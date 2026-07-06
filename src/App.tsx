import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Play, 
  Keyboard, 
  Trophy, 
  Info, 
  User, 
  Sparkles, 
  Award,
  BookOpen,
  Globe
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from './firebase';
import { SENTENCES } from './data';
import { AvatarType, GameState, DifficultyType, Sentence, ScoreEntry } from './types';
import { playSound } from './utils/sound';

import { Track } from './components/Track';
import { SentenceDisplay } from './components/SentenceDisplay';
import { Leaderboard } from './components/Leaderboard';
import { Results } from './components/Results';

export default function App() {
  // Theme and Sound Settings
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('typeracer_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('typeracer_sound');
    return saved !== 'false';
  });

  // Player and Setup States
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('typeracer_name') || '';
  });
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarType>(() => {
    const saved = localStorage.getItem('typeracer_avatar');
    if (saved === 'car' || saved === 'rocket' || saved === 'horse') return saved;
    return 'car';
  });
  const [difficulty, setDifficulty] = useState<DifficultyType>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<'mn' | 'en'>(() => {
    const saved = localStorage.getItem('typeracer_language');
    if (saved === 'en' || saved === 'mn') return saved;
    return 'mn';
  });

  // Game Engine States
  const [gameState, setGameState] = useState<GameState>('START');
  const [currentSentence, setCurrentSentence] = useState<Sentence>(SENTENCES[0]);
  const [countdown, setCountdown] = useState<number>(3);
  const [inputValue, setInputValue] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [liveWpm, setLiveWpm] = useState<number>(0);

  // Results State
  const [finalWpm, setFinalWpm] = useState<number>(0);
  const [finalErrorCount, setFinalErrorCount] = useState<number>(0);
  const [isSavingScore, setIsSavingScore] = useState<boolean>(false);
  const [scoreSaved, setScoreSaved] = useState<boolean>(false);

  // Leaderboard State
  const [leaderboardScores, setLeaderboardScores] = useState<ScoreEntry[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState<boolean>(false);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);

  // Synchronize Theme Class
  useEffect(() => {
    localStorage.setItem('typeracer_theme', theme);
  }, [theme]);

  // Synchronize Sound to Storage
  useEffect(() => {
    localStorage.setItem('typeracer_sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Synchronize Language to Storage
  useEffect(() => {
    localStorage.setItem('typeracer_language', selectedLanguage);
  }, [selectedLanguage]);

  // Load Leaderboard on mount and start screen
  const loadLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const q = query(
        collection(db, 'typeracer_scores'),
        orderBy('wpm', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const scores: ScoreEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scores.push({
          id: doc.id,
          name: data.name || 'Тоглогч',
          wpm: Number(data.wpm) || 0,
          errorCount: Number(data.errorCount) || 0,
          createdAt: data.createdAt,
          avatar: (data.avatar as AvatarType) || 'car',
          language: (data.language as 'mn' | 'en') || 'mn',
        });
      });
      setLeaderboardScores(scores);
    } catch (e) {
      console.error("Error loading scores:", e);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, []);

  // Countdown controller
  useEffect(() => {
    if (gameState === 'COUNTDOWN') {
      playSound('countdown', soundEnabled);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setGameState('PLAYING');
            setStartTime(Date.now());
            setInputValue('');
            setErrorCount(0);
            setLiveWpm(0);
            playSound('start', soundEnabled);
            // Focus input instantly
            setTimeout(() => {
              inputRef.current?.focus();
            }, 50);
            return 3;
          }
          playSound('countdown', soundEnabled);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, soundEnabled]);

  // Live statistics calculation
  useEffect(() => {
    if (gameState !== 'PLAYING' || !startTime) return;

    const interval = setInterval(() => {
      // Find matching correct characters length
      let correctIndex = 0;
      for (let i = 0; i < inputValue.length; i++) {
        if (inputValue[i] === currentSentence.text[i]) {
          correctIndex++;
        } else {
          break;
        }
      }

      const elapsedMin = (Date.now() - startTime) / 60000;
      if (elapsedMin > 0) {
        const w = correctIndex / 5;
        setLiveWpm(Math.round(w / elapsedMin));
      }
    }, 250);

    return () => clearInterval(interval);
  }, [gameState, startTime, inputValue, currentSentence]);

  // Handle Input typing changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const targetText = currentSentence.text;

    // Determine correctness and log errors
    if (val.length > inputValue.length) {
      const typedChar = val[val.length - 1];
      const correctChar = targetText[val.length - 1];

      if (typedChar !== correctChar) {
        setErrorCount((prev) => prev + 1);
        playSound('error', soundEnabled);
      } else {
        playSound('correct', soundEnabled);
      }
    }

    setInputValue(val);

    // Check if entire sentence is completed correctly
    if (val === targetText) {
      handleFinishGame();
    }
  };

  const handleFinishGame = () => {
    if (!startTime) return;
    const elapsedMs = Date.now() - startTime;
    const elapsedMin = elapsedMs / 60000;
    const words = currentSentence.text.length / 5;
    const finalCalculatedWpm = Math.max(5, Math.round(words / elapsedMin));

    setFinalWpm(finalCalculatedWpm);
    setFinalErrorCount(errorCount);
    setGameState('FINISHED');
    setScoreSaved(false);
    playSound('finish', soundEnabled);

    // Save player parameters
    localStorage.setItem('typeracer_name', playerName);
    localStorage.setItem('typeracer_avatar', selectedAvatar);

    // Auto save if user entered a name
    if (playerName.trim()) {
      saveScoreDirectly(playerName.trim(), finalCalculatedWpm, errorCount);
    }
  };

  // Direct Firestore saving function
  const saveScoreDirectly = async (name: string, wpmValue: number, errorsValue: number) => {
    setIsSavingScore(true);
    try {
      await addDoc(collection(db, 'typeracer_scores'), {
        name: name,
        wpm: wpmValue,
        errorCount: errorsValue,
        createdAt: serverTimestamp(),
        avatar: selectedAvatar,
        language: selectedLanguage,
      });
      setScoreSaved(true);
      await loadLeaderboard();
    } catch (err) {
      console.error("Error saving score:", err);
    } finally {
      setIsSavingScore(false);
    }
  };

  const handleManualSaveScore = () => {
    if (!playerName.trim()) return;
    saveScoreDirectly(playerName.trim(), finalWpm, finalErrorCount);
  };

  // Trigger game start countdown
  const startRace = () => {
    if (!playerName.trim()) return;

    // Filter sentences by difficulty and language
    const filtered = SENTENCES.filter(
      (s) => (difficulty === 'all' || s.difficulty === difficulty) && s.language === selectedLanguage
    );
    // Select a random sentence
    const randomIndex = Math.floor(Math.random() * filtered.length);
    setCurrentSentence(filtered[randomIndex] || SENTENCES.find(s => s.language === selectedLanguage) || SENTENCES[0]);

    // Save settings
    localStorage.setItem('typeracer_name', playerName);
    localStorage.setItem('typeracer_avatar', selectedAvatar);

    setCountdown(3);
    setInputValue('');
    setGameState('COUNTDOWN');
  };

  // Reset/Restart game flow
  const handleRestart = () => {
    setInputValue('');
    setLiveWpm(0);
    setErrorCount(0);
    setGameState('START');
    loadLeaderboard();
  };

  // Calculate dynamic race progress percentage
  const getProgress = () => {
    if (gameState === 'FINISHED') return 100;
    if (!inputValue.length) return 0;
    let correctIndex = 0;
    for (let i = 0; i < inputValue.length; i++) {
      if (inputValue[i] === currentSentence.text[i]) {
        correctIndex++;
      } else {
        break;
      }
    }
    return (correctIndex / currentSentence.text.length) * 100;
  };

  const currentProgress = getProgress();

  // Find if current text input has a mismatch error
  const hasMismatch = () => {
    if (!inputValue.length) return false;
    for (let i = 0; i < inputValue.length; i++) {
      if (inputValue[i] !== currentSentence.text[i]) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
        
        {/* Navigation / Header */}
        <header className="border-b border-slate-200/60 dark:border-neutral-800/80 bg-white/75 dark:bg-neutral-950/75 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black font-black font-display text-xl shadow-md shadow-emerald-500/20 flex items-center justify-center">
                  TR
                </div>
                <div>
                  <h1 className="font-display font-extrabold text-lg sm:text-xl text-slate-950 dark:text-white leading-none">
                    Typeracer
                  </h1>
                  <p className="text-[10px] text-slate-400 dark:text-neutral-500 mt-1 uppercase tracking-wider font-semibold">
                    Монгол Хэлний Бичгийн Хурдны Тэмцээн
                  </p>
                </div>
              </div>

              {/* Navigation Tabs for Tablet & Desktop */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-neutral-900/60 p-1 rounded-xl">
                <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm select-none">
                  💼 Портфолио
                </span>
                <a
                  href="https://tulgat.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                >
                  ⌨️ Typeracer
                </a>
              </div>
            </div>

            {/* Mobile Navigation Tabs & Controls */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
              {/* Tabs for Mobile */}
              <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-neutral-900/60 p-1 rounded-xl md:hidden w-full sm:w-auto">
                <span className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-sm select-none">
                  💼 Портфолио
                </span>
                <a
                  href="https://tulgat.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  ⌨️ Typeracer
                </a>
              </div>

              {/* Utility Controls */}
              <div className="flex items-center gap-2">
                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-500 dark:text-neutral-400 transition-colors cursor-pointer"
                  title={soundEnabled ? 'Дуу хаах' : 'Дуу нээх'}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                  className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-500 dark:text-neutral-400 transition-colors cursor-pointer"
                  title={theme === 'light' ? 'Харанхуй горим' : 'Гэрэлт горим'}
                >
                  {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            
            {/* 1. START STATE */}
            {gameState === 'START' && (
              <motion.div
                key="start-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Configuration / Action Panel */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-emerald-400">
                      <Keyboard className="w-6 h-6 animate-pulse" />
                      <h2 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-neutral-100">
                        Тоглоом Эхлүүлэх
                      </h2>
                    </div>

                    <p className="text-sm text-slate-500 dark:text-neutral-400 leading-relaxed">
                      Монгол хэл дээрх сонирхолтой өгүүлбэрүүдийг алдаагүй, хамгийн хурднаар бичиж өөрийнхөө WPM (Бичих Хурд) болон чадварыг дэлхийн лидерүүдтэй уралдуулаарай! 🏎️💨
                    </p>

                    {/* Name Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Таны Нэр
                      </label>
                      <input
                        type="text"
                        placeholder="Нэрээ энд бичнэ үү..."
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/20 rounded-2xl px-4 py-3 text-sm transition-all outline-none font-medium text-slate-800 dark:text-white"
                        maxLength={20}
                        id="player-name-input"
                      />
                    </div>

                    {/* Avatar Selection */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        Уралдах Хүлэг сонгох
                      </label>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {/* Car */}
                        <button
                          onClick={() => setSelectedAvatar('car')}
                          className={`border rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                            selectedAvatar === 'car'
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/15 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500/15'
                              : 'border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/20 hover:bg-slate-100 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <span className="text-3xl mb-2 select-none filter drop-shadow-md">🏎️</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Машин</span>
                        </button>

                        {/* Rocket */}
                        <button
                          onClick={() => setSelectedAvatar('rocket')}
                          className={`border rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                            selectedAvatar === 'rocket'
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/15 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500/15'
                              : 'border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/20 hover:bg-slate-100 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <span className="text-3xl mb-2 select-none filter drop-shadow-md">🚀</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Пуужин</span>
                        </button>

                        {/* Horse */}
                        <button
                          onClick={() => setSelectedAvatar('horse')}
                          className={`border rounded-2xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                            selectedAvatar === 'horse'
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/15 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500/15'
                              : 'border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/20 hover:bg-slate-100 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <span className="text-3xl mb-2 select-none filter drop-shadow-md">🐎</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Хүлэг морь</span>
                        </button>
                      </div>
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Бичих хэл (Language)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setSelectedLanguage('mn')}
                          className={`border rounded-2xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-sm ${
                            selectedLanguage === 'mn'
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/15 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500/15 text-indigo-600 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/20 hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-xl select-none">🇲🇳</span>
                          <span>Монгол Хэл</span>
                        </button>
                        <button
                          onClick={() => setSelectedLanguage('en')}
                          className={`border rounded-2xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer font-bold text-sm ${
                            selectedLanguage === 'en'
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/15 dark:border-emerald-500 dark:bg-emerald-500/5 dark:ring-emerald-500/15 text-indigo-600 dark:text-emerald-400'
                              : 'border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/20 hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="text-xl select-none">🇬🇧</span>
                          <span>English</span>
                        </button>
                      </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Өгүүлбэрийн хүндрэл
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setDifficulty(diff)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                              difficulty === diff
                                ? 'bg-indigo-600 dark:bg-emerald-500 text-white dark:text-black shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-slate-600 dark:text-neutral-300'
                            }`}
                          >
                            {diff === 'all' && 'Бүгд'}
                            {diff === 'easy' && 'Амархан 🟢'}
                            {diff === 'medium' && 'Дундаж 🟡'}
                            {diff === 'hard' && 'Хэцүү 🔴'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={startRace}
                      disabled={!playerName.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 dark:disabled:bg-neutral-800 disabled:text-slate-400 dark:disabled:text-neutral-600 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-black font-bold text-base py-4 rounded-2xl transition-all cursor-pointer shadow-md shadow-indigo-600/10 active:scale-[0.99]"
                      id="start-race-button"
                    >
                      <Play className="w-5 h-5 fill-current" />
                      Уралдааныг эхлүүлэх 🏁
                    </button>
                  </div>
                </div>

                {/* Leaderboard Panel */}
                <div className="lg:col-span-5">
                  <Leaderboard 
                    scores={leaderboardScores} 
                    isLoading={isLoadingLeaderboard} 
                    onRefresh={loadLeaderboard}
                  />
                </div>
              </motion.div>
            )}

            {/* 2. COUNTDOWN STATE */}
            {gameState === 'COUNTDOWN' && (
              <motion.div
                key="countdown-screen"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="text-xs uppercase tracking-widest text-indigo-500 dark:text-emerald-400 font-bold mb-4">
                  Бэлдээрэй, уралдаан эхлэхэд...
                </div>

                <motion.div
                  key={countdown}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="text-8xl sm:text-9xl font-display font-black text-indigo-600 dark:text-emerald-400 select-none drop-shadow-md"
                >
                  {countdown}
                </motion.div>

                <div className="mt-6 text-sm text-slate-400 dark:text-neutral-500 font-mono">
                  Сонгосон хүлэг: {selectedAvatar === 'horse' ? 'Морь 🐎' : selectedAvatar === 'rocket' ? 'Пуужин 🚀' : 'Машин 🏎️'}
                </div>
              </motion.div>
            )}

            {/* 3. PLAYING STATE */}
            {gameState === 'PLAYING' && (
              <motion.div
                key="playing-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                {/* Speedtrack Visualizer */}
                <Track avatar={selectedAvatar} progress={currentProgress} />

                {/* Typing stats header */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-display font-black text-indigo-600 dark:text-emerald-400 font-mono">
                      {liveWpm}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 dark:text-neutral-500 mt-1 uppercase font-semibold tracking-wider">
                      Хурд WPM
                    </div>
                  </div>

                  <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 text-center">
                    <div className={`text-2xl sm:text-3xl font-display font-black font-mono transition-colors ${
                      hasMismatch() ? 'text-rose-500 animate-pulse' : 'text-emerald-500 dark:text-emerald-400'
                    }`}>
                      {errorCount}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 dark:text-neutral-500 mt-1 uppercase font-semibold tracking-wider">
                      Алдаа
                    </div>
                  </div>

                  <div className="bg-white dark:bg-neutral-900 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-4 text-center">
                    <div className="text-2xl sm:text-3xl font-display font-black text-slate-700 dark:text-neutral-300 font-mono">
                      {Math.max(0, Math.round(currentProgress))}%
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-400 dark:text-neutral-500 mt-1 uppercase font-semibold tracking-wider">
                      Урагшилсан
                    </div>
                  </div>
                </div>

                {/* Sentence Prompt display */}
                <SentenceDisplay sentence={currentSentence.text} inputValue={inputValue} />

                {/* Interactive Input field */}
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Энд алдаагүй хурдан бичнэ үү..."
                      value={inputValue}
                      onChange={handleInputChange}
                      onPaste={(e) => e.preventDefault()}
                      className={`w-full bg-white dark:bg-neutral-900 border-2 rounded-2xl px-5 py-4 text-lg font-mono outline-none transition-all shadow-sm ${
                        hasMismatch()
                          ? 'border-rose-500 dark:border-rose-500/80 focus:ring-4 focus:ring-rose-500/10 bg-rose-500/5'
                          : 'border-slate-200 dark:border-neutral-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/10 text-slate-900 dark:text-white'
                      }`}
                      id="typeracer-input"
                      autoFocus
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />

                    {/* Mismatch warnings */}
                    {hasMismatch() && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-rose-500 font-bold animate-bounce flex items-center gap-1">
                        <span>Алдаагаа засаарай! 🔙</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-neutral-500 pl-1">
                    Санамж: Алдаа гаргавал урагшлахгүй бөгөөд арилгах хүртэл бичих боломжгүй.
                  </p>
                </div>

                {/* Escape helper */}
                <div className="flex justify-end">
                  <button
                    onClick={handleRestart}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:text-neutral-600 dark:hover:text-neutral-400 cursor-pointer underline decoration-dotted"
                  >
                    Буцах / Уралдаанаас гарах
                  </button>
                </div>
              </motion.div>
            )}

            {/* 4. FINISHED STATE */}
            {gameState === 'FINISHED' && (
              <motion.div
                key="finished-screen"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <Results
                  wpm={finalWpm}
                  errorCount={finalErrorCount}
                  totalChars={currentSentence.text.length}
                  name={playerName}
                  avatar={selectedAvatar}
                  isSaving={isSavingScore}
                  scoreSaved={scoreSaved}
                  onRestart={handleRestart}
                  onSaveScore={handleManualSaveScore}
                />

                <div className="max-w-xl mx-auto">
                  <Leaderboard 
                    scores={leaderboardScores} 
                    isLoading={isLoadingLeaderboard} 
                    onRefresh={loadLeaderboard}
                  />
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/40 dark:border-neutral-900/60 mt-16 py-8 text-center text-xs text-slate-400 dark:text-neutral-600">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Typeracer Mongolia. Бүх эрх хамгаалагдсан.</p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Firestore Тэнцвэржүүлсэн Бааз холбогдсон</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Battery, 
  BatteryLow, 
  BatteryMedium, 
  BatteryCharging, 
  Settings, 
  Smile, 
  Heart, 
  Sparkles, 
  Flame, 
  Coffee, 
  Moon, 
  Music, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Activity, 
  Trash2, 
  Plus, 
  Info, 
  Clock, 
  Sun,
  X,
  Sparkle,
  Zap,
  Award,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Key,
  Lock,
  Unlock,
  ExternalLink,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { 
  AppTheme, 
  MoodMode, 
  VisualEffects, 
  MoodRecord, 
  getCheerMessage, 
  MOTIVATIONAL_QUOTES 
} from './types';

// Instant charge actions
interface ChargeAction {
  name: string;
  effect: string;
  change: number; // positive or negative
  icon: string;
  metric: 'happiness' | 'stress' | 'physical' | 'mental' | 'joy' | 'overall';
}

const CHARGE_ACTIONS: ChargeAction[] = [
  { name: "따뜻한 아메리카노", effect: "피지컬 충전", change: 15, icon: "☕", metric: "physical" },
  { name: "향긋한 허브 차", effect: "스트레스 다운", change: -15, icon: "🍵", metric: "stress" },
  { name: "파워 낮잠 20분", effect: "종합 충전", change: 20, icon: "😴", metric: "overall" },
  { name: "최애 힐링송 듣기", effect: "기쁨 충전", change: 10, icon: "🎧", metric: "joy" },
  { name: "선선한 솔숲 산책", effect: "멘탈 케어", change: 15, icon: "🌲", metric: "mental" },
  { name: "갑작스런 시정 회의", effect: "스트레스 급증", change: 20, icon: "💼", metric: "stress" },
  { name: "스마트폰 스크롤 중독", effect: "피지컬 방전", change: -15, icon: "📱", metric: "physical" },
  { name: "달콤한 초콜릿 한 조각", effect: "엔돌핀 활성화", change: 12, icon: "🍫", metric: "joy" }
];

export default function App() {
  // Config state
  const [activeTab, setActiveTab] = useState<'landing' | 'tracker'>('landing');
  const [theme, setTheme] = useState<AppTheme>('vibrant-palette');
  const [mode, setMode] = useState<MoodMode>('single');
  const [effects, setEffects] = useState<VisualEffects>({
    wave: true,
    spark: true,
    glow: true,
    dynamicBg: true
  });

  // Gemini API key lock & validation states
  const [geminiKey, setGeminiKey] = useState<string>('');
  const [isKeyUnlocked, setIsKeyUnlocked] = useState<boolean>(false);
  const [isKeyValidating, setIsKeyValidating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');
  const [isGuideExpanded, setIsGuideExpanded] = useState<boolean>(false);

  // Slider Values
  const [overallScore, setOverallScore] = useState<number>(70);
  const [dualScores, setDualScores] = useState({ happiness: 75, stress: 30 });
  const [tripleScores, setTripleScores] = useState({ physical: 65, mental: 70, joy: 80 });

  // Floating notifications after clicking charge actions
  const [toast, setToast] = useState<{ id: number; text: string; success: boolean } | null>(null);

  // Diary logs state backed by localStorage
  const [logs, setLogs] = useState<MoodRecord[]>([]);
  const [noteText, setNoteText] = useState<string>('');
  
  // Modals
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [showAnalyticModal, setShowAnalyticModal] = useState<boolean>(false);

  // Load logs and check API authorization on mount
  useEffect(() => {
    const saved = localStorage.getItem('mood_battery_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    } else {
      // Seed initial record
      const seed: MoodRecord[] = [
        {
          id: '1',
          date: '2026-06-17',
          time: '14:30',
          overallScore: 45,
          scores: { overall: 45 },
          notes: '과제가 밀려 스트레스를 조금 받음. 절전 모드로 쉬었다 가야지.',
          theme: 'pastel',
          mode: 'single'
        },
        {
          id: '2',
          date: '2026-06-18',
          time: '20:15',
          overallScore: 82,
          scores: { physical: 75, mental: 80, joy: 90 },
          notes: '친구들과 맛있는 저녁 식사 후 신나게 노래방에 다녀왔다! 만충 상태!',
          theme: 'dark-neon',
          mode: 'triple'
        }
      ];
      setLogs(seed);
      localStorage.setItem('mood_battery_logs', JSON.stringify(seed));
    }

    // Hydrate key authentication state
    const savedKey = localStorage.getItem('gemini_api_key');
    const savedUnlocked = localStorage.getItem('gemini_api_unlocked');
    if (savedKey) {
      setGeminiKey(savedKey);
    }
    if (savedUnlocked === 'true') {
      setIsKeyUnlocked(true);
    }
  }, []);

  // Validation function for API Key
  const handleValidateKey = async (keyInput?: string) => {
    const targetKey = keyInput !== undefined ? keyInput : geminiKey;
    if (!targetKey || !targetKey.trim()) {
      setValidationError('Gemini API Key를 입력해주세요.');
      return;
    }
    setIsKeyValidating(true);
    setValidationError('');
    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: targetKey.trim() }),
      });
      const data = await response.json();
      if (data.valid) {
        setIsKeyUnlocked(true);
        localStorage.setItem('gemini_api_key', targetKey.trim());
        localStorage.setItem('gemini_api_unlocked', 'true');
        setValidationError('');
        setToast({
          id: Date.now(),
          text: data.message || '🎉 Gemini API 키 인증에 성공했습니다! 피로 흐름 추적 및 일지 기능이 모두 활성화되었습니다.',
          success: true
        });
        setActiveTab('tracker');
      } else {
        setIsKeyUnlocked(false);
        localStorage.removeItem('gemini_api_unlocked');
        setValidationError(data.error || '유효하지 않은 API Key입니다. 키를 다시 한번 확인해주세요.');
      }
    } catch (err: any) {
      console.error(err);
      setValidationError('서버 통신 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsKeyValidating(false);
    }
  };

  const handleLockKey = () => {
    setIsKeyUnlocked(false);
    setGeminiKey('');
    localStorage.removeItem('gemini_api_key');
    localStorage.removeItem('gemini_api_unlocked');
    setActiveTab('landing');
    setToast({
      id: Date.now(),
      text: '🔒 API 키가 비활성화되었습니다. 앱 사용 라이선스가 해제되었습니다.',
      success: false
    });
  };

  // Sync logs to localStorage
  const saveLogsToStorage = (newLogs: MoodRecord[]) => {
    setLogs(newLogs);
    localStorage.setItem('mood_battery_logs', JSON.stringify(newLogs));
  };

  // Compute overall current battery percentage based on mode
  const getCalculatedScore = (): number => {
    if (mode === 'single') {
      return overallScore;
    } else if (mode === 'dual') {
      // Happiness counts positive, stress counts negative.
      // Maximum battery charge calculation:
      const calculated = Math.round(dualScores.happiness * 0.65 + (100 - dualScores.stress) * 0.35);
      return Math.max(0, Math.min(100, calculated));
    } else {
      // Triple: physical (35%), mental (35%), joy (30%)
      const calculated = Math.round(tripleScores.physical * 0.35 + tripleScores.mental * 0.35 + tripleScores.joy * 0.3);
      return Math.max(0, Math.min(100, calculated));
    }
  };

  const calculatedScore = getCalculatedScore();

  // Floating sparks pattern
  const sparkParticles = React.useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: `${15 + (i * 13.7) % 70}%`,
      bottom: `${10 + (i * 19.3) % 80}%`,
      size: `${3 + (i * 2.3) % 7}px`,
      delay: `${(i * 0.25).toFixed(2)}s`,
      duration: `${2.5 + (i * 1.7) % 4.5}s`
    }));
  }, []);

  // Determine battery color based on score
  const getBatteryColors = (score: number) => {
    if (score <= 20) {
      return {
        fill: '#f43f5e', // rose-500
        text: 'text-rose-500',
        bg: 'bg-rose-500/20',
        border: 'border-rose-500/50',
        glow: 'shadow-rose-500/60',
        glowStyle: '#f43f5e',
        gradient: 'from-rose-600 to-red-500',
        label: '위험 고갈 (Critical)'
      };
    } else if (score <= 50) {
      return {
        fill: '#f97316', // orange-500
        text: 'text-orange-500',
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/50',
        glow: 'shadow-orange-500/50',
        glowStyle: '#f97316',
        gradient: 'from-orange-500 to-amber-500',
        label: '부족 경고 (Low Charge)'
      };
    } else if (score <= 75) {
      return {
        fill: '#eab308', // yellow-500
        text: 'text-yellow-500',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/40',
        glow: 'shadow-yellow-500/40',
        glowStyle: '#eab308',
        gradient: 'from-yellow-400 to-amber-400',
        label: '중간 안전 (Moderate)'
      };
    } else if (score <= 90) {
      return {
        fill: '#10b981', // emerald-500
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/40',
        glow: 'shadow-emerald-500/40',
        glowStyle: '#10b981',
        gradient: 'from-emerald-400 to-green-400',
        label: '보통 쾌적 (Healthy)'
      };
    } else {
      return {
        fill: '#06b6d4', // cyan-500
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/20',
        border: 'border-cyan-500/50',
        glow: 'shadow-cyan-500/70',
        glowStyle: '#06b6d4',
        gradient: 'from-cyan-400 to-teal-400',
        label: '완전 충전 (Super Energy)'
      };
    }
  };

  const batteryColorSettings = getBatteryColors(calculatedScore);

  // Dynamically calculated workspace backgrounds to match current battery mood
  const getDynamicBackground = () => {
    if (theme === 'vibrant-palette') {
      return 'bg-[#0F172A] text-white duration-1000';
    }
    if (!effects.dynamicBg) {
      if (theme === 'dark-neon') return 'bg-neutral-950 text-white';
      if (theme === 'pastel') return 'bg-slate-50 text-slate-800';
      if (theme === 'minimal-white') return 'bg-neutral-50 text-neutral-900';
      return 'bg-slate-900 text-slate-100'; // Default Glassmorphism bg
    }

    if (calculatedScore <= 20) {
      return theme === 'dark-neon' 
        ? 'bg-rose-950/40 backdrop-blur-3xl text-rose-100 duration-1000' 
        : 'bg-rose-50/70 backdrop-blur-3xl text-rose-900 duration-1000';
    } else if (calculatedScore <= 50) {
      return theme === 'dark-neon'
        ? 'bg-amber-950/30 backdrop-blur-3xl text-amber-100 duration-1000'
        : 'bg-amber-50/70 backdrop-blur-3xl text-amber-900 duration-1000';
    } else if (calculatedScore <= 75) {
      return theme === 'dark-neon'
        ? 'bg-yellow-950/20 backdrop-blur-3xl text-yellow-105 duration-1000'
        : 'bg-yellow-50/70 backdrop-blur-3xl text-yellow-900 duration-1000';
    } else if (calculatedScore <= 90) {
      return theme === 'dark-neon'
        ? 'bg-emerald-950/25 backdrop-blur-3xl text-emerald-100 duration-1000'
        : 'bg-emerald-50/80 backdrop-blur-3xl text-emerald-900 duration-1000';
    } else {
      return theme === 'dark-neon'
        ? 'bg-cyan-950/30 backdrop-blur-3xl text-cyan-100 duration-1000'
        : 'bg-cyan-50/80 backdrop-blur-3xl text-cyan-900 duration-1000';
    }
  };

  // Get cheer metadata
  const currentCheer = getCheerMessage(calculatedScore);

  // Trigger quick instant charge modifier
  const triggerChargeAction = (action: ChargeAction) => {
    const change = action.change;
    
    if (mode === 'single') {
      const updated = Math.max(0, Math.min(100, overallScore + change));
      setOverallScore(updated);
      showToast(`${action.icon} ${action.name}으로 기분 점수가 ${change > 0 ? '+' : ''}${change}% 변동되었습니다!`, change > 0);
    } else if (mode === 'dual') {
      if (action.metric === 'stress') {
        const uStress = Math.max(0, Math.min(100, dualScores.stress + change));
        setDualScores(prev => ({ ...prev, stress: uStress }));
        showToast(`${action.icon} ${action.name}으로 스트레스가 ${change > 0 ? '+' : ''}${change}% 변동되었습니다!`, change < 0);
      } else {
        const valueToChange = action.metric === 'joy' || action.metric === 'happiness' ? 'happiness' : 'happiness';
        const uHappiness = Math.max(0, Math.min(100, dualScores.happiness + (change > 0 ? change : 10)));
        setDualScores(prev => ({ ...prev, happiness: uHappiness }));
        showToast(`${action.icon} ${action.name}으로 행복 수치가 상승했습니다!`, true);
      }
    } else { // triple
      const activeMetric = action.metric === 'overall' ? 'joy' : action.metric;
      setTripleScores(prev => {
        const currentVal = prev[activeMetric as keyof typeof prev] || 50;
        const updatedVal = Math.max(0, Math.min(100, currentVal + change));
        return {
          ...prev,
          [activeMetric]: updatedVal
        };
      });
      showToast(`${action.icon} ${action.name}의 영향으로 ${action.effect}이 적용되었습니다!`, change > 0);
    }
  };

  const showToast = (text: string, success: boolean) => {
    setToast({
      id: Date.now(),
      text,
      success
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Save diary note
  const submitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const rightNow = new Date();
    const padStr = (n: number) => n.toString().padStart(2, '0');
    const dateString = `${rightNow.getFullYear()}-${padStr(rightNow.getMonth() + 1)}-${padStr(rightNow.getDate())}`;
    const timeString = `${padStr(rightNow.getHours())}:${padStr(rightNow.getMinutes())}`;

    // Collect active metrics sub-scores to save
    let detailedScores: Record<string, number> = {};
    if (mode === 'single') {
      detailedScores = { overall: overallScore };
    } else if (mode === 'dual') {
      detailedScores = { happiness: dualScores.happiness, stress: dualScores.stress };
    } else {
      detailedScores = { physical: tripleScores.physical, mental: tripleScores.mental, joy: tripleScores.joy };
    }

    const newRecord: MoodRecord = {
      id: Date.now().toString(),
      date: dateString,
      time: timeString,
      overallScore: calculatedScore,
      scores: detailedScores,
      notes: noteText.trim(),
      theme: theme,
      mode: mode
    };

    saveLogsToStorage([newRecord, ...logs]);
    setNoteText('');
    showToast("💾 오늘의 감성 기분 배터리가 일기장에 성공적으로 저장되었습니다!", true);
  };

  // Delete diary note
  const deleteRecord = (id: string) => {
    const updated = logs.filter(r => r.id !== id);
    saveLogsToStorage(updated);
    showToast("🗑️ 기록이 안전하게 완전 삭제되었습니다.", false);
  };

  // Determine styles depending on the theme setting
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'vibrant-palette':
        return 'backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.02)] rounded-[40px] font-sans text-white';
      case 'glassmorphism':
        return 'backdrop-blur-md bg-white/20 dark:bg-neutral-900/30 border border-white/30 dark:border-neutral-800/20 shadow-2xl rounded-3xl font-sans';
      case 'pastel':
        return 'bg-stone-50/90 border border-amber-100 shadow-lg rounded-3xl font-serif-korean text-stone-800 tracking-wide';
      case 'dark-neon':
        return 'bg-neutral-900 border-2 border-neutral-800 shadow-2xl rounded-2xl font-display text-neutral-100';
      case 'minimal-white':
        return 'bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-none font-sans text-black';
      default:
        return 'bg-white rounded-3xl';
    }
  };

  const getThemeTextMutedClass = () => {
    if (theme === 'vibrant-palette') return 'text-slate-400 font-mono text-xs uppercase tracking-wider';
    if (theme === 'dark-neon') return 'text-neutral-400 font-mono text-xs';
    if (theme === 'minimal-white') return 'text-black/60 font-mono text-xs uppercase';
    if (theme === 'pastel') return 'text-stone-500 italic text-sm';
    return 'text-slate-500 text-sm';
  };

  const getThemeCardClass = () => {
    switch (theme) {
      case 'vibrant-palette':
        return 'bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 p-5';
      case 'glassmorphism':
        return 'bg-white/40 dark:bg-neutral-950/20 border border-white/20 dark:border-neutral-800/10 rounded-2xl p-4 shadow-sm';
      case 'pastel':
        return 'bg-[#f7f5ef] border border-amber-100 rounded-2xl p-4 shadow-xs';
      case 'dark-neon':
        return 'bg-neutral-950 border border-neutral-800 rounded-xl p-4';
      case 'minimal-white':
        return 'bg-white border-2 border-black rounded-none p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
    }
  };

  const getThemeButtonClass = (isActive: boolean) => {
    if (isActive) {
      switch (theme) {
        case 'vibrant-palette':
          return 'bg-white text-slate-900 hover:bg-neutral-100 font-bold px-4 py-2 rounded-xl text-sm active:scale-95 transition-all shadow-xl';
        case 'glassmorphism':
          return 'bg-slate-800 dark:bg-white text-white dark:text-neutral-950 font-medium px-4 py-2 rounded-xl text-sm transition-all shadow-md';
        case 'pastel':
          return 'bg-amber-800 text-stone-50 font-semibold px-4 py-2 rounded-xl text-sm shadow';
        case 'dark-neon':
          return 'bg-cyan-500 text-black border-2 border-transparent font-medium font-mono tracking-tighter px-4 py-2 rounded-lg text-sm shadow-[0_0_12px_rgba(6,182,212,0.6)]';
        case 'minimal-white':
          return 'bg-black text-white border-2 border-black font-semibold font-mono px-4 py-2 rounded-none text-sm';
      }
    } else {
      switch (theme) {
        case 'vibrant-palette':
          return 'bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/35 hover:bg-white/15 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all';
        case 'glassmorphism':
          return 'bg-white/30 dark:bg-neutral-800/30 hover:bg-white/50 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl text-sm transition-all';
        case 'pastel':
          return 'bg-stone-200/50 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-xl text-sm';
        case 'dark-neon':
          return 'bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-neutral-400 font-mono px-4 py-2 rounded-lg text-sm';
        case 'minimal-white':
          return 'bg-white hover:bg-neutral-100 border-2 border-black text-black font-mono px-4 py-2 rounded-none text-sm';
      }
    }
  };

  // Get descriptive average battery score of all logged items
  const averageBattery = logs.length > 0 
    ? Math.round(logs.reduce((acc, l) => acc + l.overallScore, 0) / logs.length) 
    : 0;

  const maxBattery = logs.length > 0
    ? Math.max(...logs.map(l => l.overallScore))
    : 0;

  const isLightTheme = 
    theme === 'pastel' || 
    theme === 'minimal-white' || 
    (theme === 'glassmorphism' && effects.dynamicBg);

  const dTextWhite = theme === 'glassmorphism' 
    ? (isLightTheme ? 'text-slate-950 font-black' : 'text-white font-extrabold')
    : (isLightTheme ? 'text-slate-950 font-bold' : 'text-white');

  const dTextHeading = theme === 'glassmorphism'
    ? (isLightTheme ? 'text-slate-950 font-black tracking-tight' : 'text-white font-black tracking-tight')
    : (isLightTheme ? 'text-slate-900 font-extrabold' : 'text-white font-extrabold');

  const dTextHeading2 = theme === 'glassmorphism'
    ? (isLightTheme ? 'text-slate-950 font-black' : 'text-white font-black')
    : (isLightTheme ? 'text-slate-950 font-black' : 'text-white');

  const dTextSlate350 = theme === 'glassmorphism'
    ? (isLightTheme ? 'text-slate-900 font-bold' : 'text-slate-100 font-bold')
    : (isLightTheme ? 'text-slate-800 font-semibold' : 'text-slate-350');

  const dTextSlate300 = theme === 'glassmorphism'
    ? (isLightTheme ? 'text-slate-900 font-bold' : 'text-slate-200 font-bold')
    : (isLightTheme ? 'text-slate-800 font-medium' : 'text-slate-300');

  const dTextSlate400 = theme === 'glassmorphism'
    ? (isLightTheme ? 'text-slate-900 font-bold' : 'text-slate-200 font-bold')
    : (isLightTheme ? 'text-slate-700 font-semibold' : 'text-slate-400');
  const dBorderWhite10 = isLightTheme ? 'border-slate-800/15' : 'border-white/10';
  const dBgWhite5 = isLightTheme ? 'bg-slate-950/5' : 'bg-white/5';
  const dBgWhite10 = isLightTheme ? 'bg-slate-950/10' : 'bg-white/10';
  const dTextEmerald = isLightTheme ? 'text-emerald-700 font-bold' : 'text-emerald-400';
  const dTextIndigo = isLightTheme ? 'text-indigo-700 font-bold' : 'text-indigo-400';
  const dGradientText = isLightTheme
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 font-extrabold'
    : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-extrabold';

  return (
    <div className={`min-h-screen py-6 px-4 md:px-8 transition-colors duration-1000 flex flex-col items-center justify-start ${getDynamicBackground()}`}>
      
      {/* Decorative Orbs in background of page */}
      {(theme === 'glassmorphism' || theme === 'vibrant-palette') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          {theme === 'vibrant-palette' ? (
            <>
              <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-[150px]" />
            </>
          ) : (
            <>
              <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-300/20 blur-3xl animate-pulse" />
              <div className="absolute top-1/2 right-10 w-80 h-80 rounded-full bg-emerald-300/10 blur-3xl" />
              <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-amber-200/10 blur-3xl" />
            </>
          )}
        </div>
      )}

      {/* 1. Global Navigation header block */}
      <div className={`w-full max-w-7xl mb-6 relative z-10 flex flex-col md:flex-row items-center justify-between border-b pb-4 gap-4 ${isLightTheme ? 'border-slate-800/10' : 'border-slate-200/10'}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/10">
            <BatteryCharging className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-widest font-mono ${dTextEmerald}`}>Mindfulness & Heart Rate Gauge</span>
            <h1 className={`text-xl md:text-2xl font-black tracking-tight flex items-center gap-1.5 ${isLightTheme ? 'text-slate-900' : 'text-white'}`}>
              오늘의 기분 배터리 <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isLightTheme ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'}`}>Premium v2.5</span>
            </h1>
          </div>
        </div>
        
        {/* Navigation Switch Tabs */}
        <div className={`flex p-1 rounded-2xl border gap-1 backdrop-blur-md self-stretch md:self-auto ${isLightTheme ? 'bg-white/60 border-slate-350/30' : 'bg-slate-900/50 border-white/10'}`}>
          <button
            type="button"
            id="nav-landing"
            onClick={() => setActiveTab('landing')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'landing'
                ? isLightTheme 
                  ? 'bg-slate-900 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white text-slate-900 shadow-md transform scale-[1.02]'
                : isLightTheme 
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-900/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span>✨ 서비스 안내 & 특장점</span>
          </button>
          <button
            type="button"
            id="nav-tracker"
            onClick={() => {
              setActiveTab('tracker');
              if (!isKeyUnlocked) {
                setToast({
                  id: Date.now(),
                  text: '🔑 감정 측정기 및 로깅 기능을 활성화하려면 Gemini API 인증이 필요합니다.',
                  success: false
                });
              }
            }}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'tracker'
                ? isLightTheme
                  ? 'bg-slate-900 text-white shadow-md transform scale-[1.02]'
                  : 'bg-white text-slate-900 shadow-md transform scale-[1.02]'
                : isLightTheme
                  ? 'text-slate-700 hover:text-slate-950 hover:bg-slate-900/5'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500 animate-pulse animate-bounce" />
            <span>🔋 실시간 감정 측정기</span>
          </button>
        </div>
      </div>

      {activeTab === 'landing' ? (
        /* Immersive Premium Landing Page Layout */
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`w-full max-w-7xl relative z-10 space-y-12 pb-12 ${isLightTheme ? 'text-slate-900' : 'text-white'}`}
        >
          
          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2 pb-6">
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${isLightTheme ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-white/5 border border-white/10 text-emerald-400'}`}>
                <Award className={`w-4 h-4 animate-spin ${dTextEmerald}`} style={{ animationDuration: '6s' }} />
                <span>2026 올해의 감정 웰니스 대상 유틸리티 부문 선정</span>
              </div>
              
              <h2 className={`text-3xl md:text-5xl font-black leading-tight tracking-tight ${dTextHeading2}`}>
                눈에 안 보이던 일상의 번아웃,<br />
                <span className={dGradientText}>
                  '기분 배터리'
                </span>로 선명하게 가시화하세요.
              </h2>
              
              <p className={`text-sm md:text-base leading-relaxed max-w-2xl ${dTextSlate300}`}>
                매일 지치고 무력해지는 내 진짜 기분과 에너지를 잘 챙겨주고 계신가요?
                어렴풋이 느끼던 마인드 스트레스를 직관적인 <strong>0%~100% 잔량 게이지</strong> 구조로 탈바꿈해 
                소진된 마음 구역을 적시에 치료하고 따뜻이 충전하는 새로운 마인드 케어 습관을 선물합니다.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  id="btn-landing-start"
                  onClick={() => {
                    setActiveTab('tracker');
                    if (!isKeyUnlocked) {
                      setToast({
                        id: Date.now(),
                        text: '🔑 감정 측정기 및 로깅 기능을 활성화하려면 Gemini API 인증이 필요합니다.',
                        success: false
                      });
                    }
                  }}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold rounded-2xl text-sm transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <span>지금 감정 충전기 실행하기</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('pillars-features');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-5 py-3.5 font-semibold rounded-2xl text-xs transition-all border flex items-center gap-1.5 cursor-pointer ${
                    isLightTheme 
                      ? 'bg-slate-900/5 hover:bg-slate-900/10 text-slate-900 border-slate-900/20' 
                      : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
                  }`}
                >
                  <span>기분 배터리의 특장점 탐색</span>
                </button>
              </div>

              {/* Trust parameters */}
              <div className={`grid grid-cols-3 gap-4 pt-4 max-w-lg font-sans border-t ${dBorderWhite10}`}>
                <div>
                  <span className={`block text-2xl font-black ${dTextWhite}`}>98.4%</span>
                  <span className={`text-[10px] font-medium ${dTextSlate400}`}>실시간 감정 자가 인지율</span>
                </div>
                <div>
                  <span className={`block text-2xl font-black ${dTextWhite}`}>5가지</span>
                  <span className={`text-[10px] font-medium ${dTextSlate400}`}>글래스모피즘 외 감각 테마</span>
                </div>
                <div>
                  <span className={`block text-2xl font-black ${dTextWhite}`}>1초 리얼타임</span>
                  <span className={`text-[10px] font-medium ${dTextSlate400}`}>데이터 영구 세이빙/기록</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 col-span-1">
              {/* Live Sandbox Card */}
              <div className={`backdrop-blur-2xl rounded-[40px] p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col items-center border ${
                isLightTheme 
                  ? 'bg-white/80 border-slate-800/10' 
                  : 'bg-white/5 border-white/10'
              }`}>
                <div className={`absolute top-4 left-4 flex items-center gap-1.5 text-xs font-mono xs:top-3 ${dTextSlate400}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Interactive Live Sandbox</span>
                </div>

                <div className="relative my-6 flex flex-col items-center">
                  <div className={`relative w-36 h-60 border-[5px] rounded-[48px] p-1.5 flex flex-col justify-end overflow-hidden z-10 transition-all duration-500 shadow-2xl ${
                    overallScore <= 20
                      ? 'border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.15)] bg-slate-900/60'
                      : overallScore <= 50
                      ? 'border-amber-500/50 shadow-[0_0_40px_rgba(245,158,11,0.15)] bg-slate-900/60'
                      : 'border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.15)] bg-slate-900/60'
                  }`}>
                    
                    <div 
                      className="relative w-full rounded-[36px] transition-all duration-700 overflow-hidden"
                      style={{ 
                        height: `${Math.max(12, overallScore)}%`,
                        backgroundColor: batteryColorSettings.fill,
                        boxShadow: `0 0 30px ${batteryColorSettings.glowStyle}`
                      }}
                    >
                      {/* Interactive Wave particles */}
                      <div className="absolute top-0 left-1/2 w-[220%] h-[220%] -translate-x-1/2 rounded-[38%] bg-white/20 animate-wave-slow pointer-events-none" />
                      <div className="absolute top-0 left-1/2 w-[200%] h-[200%] -translate-x-1/2 rounded-[35%] bg-white/10 animate-wave-fast pointer-events-none" />
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20">
                      <span className="text-4xl font-extrabold tracking-tight drop-shadow-md">{overallScore}%</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-black/40 mt-1 select-none backdrop-blur-xs">
                        {batteryColorSettings.label}
                      </span>
                    </div>

                  </div>
                  <div className="w-12 h-3.5 bg-white/10 rounded-t-lg -mt-[1px] z-0" />
                </div>

                {/* Simulated slider logic inside Landing Page */}
                <div className="w-full space-y-2 mt-2">
                  <div className={`flex justify-between items-center text-xs ${isLightTheme ? 'text-slate-800' : 'text-slate-350'}`}>
                    <span className="font-semibold">기분 게이지 직접 밀어 조향하기:</span>
                    <span className={`font-mono font-bold ${isLightTheme ? 'text-emerald-700' : 'text-emerald-400'}`}>{overallScore}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={overallScore}
                    onChange={(e) => setOverallScore(Number(e.target.value))}
                    className={`w-full accent-emerald-505 h-2 rounded-lg appearance-none cursor-pointer ${isLightTheme ? 'bg-slate-900/10' : 'bg-white/10'}`}
                  />
                  <p className={`text-[10px] text-center font-sans ${dTextSlate400}`}>
                    체험 슬라이더를 요리조리 끌어 실시간 배터리 출렁임과 성격 진단을 경험하세요!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Gemini API Key Activation Card Module */}
          <div className={`p-8 rounded-[36px] border backdrop-blur-xl relative overflow-hidden space-y-6 ${
            isLightTheme 
              ? 'bg-white/80 border-slate-200/65 shadow-[0_4px_30px_rgba(0,0,0,0.03)]' 
              : 'bg-slate-900/40 border-white/10 shadow-[0_15px_45px_rgba(0,0,0,0.25)]'
          }`}>
            {/* Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500">
                  <ShieldCheck className="w-6 h-6 shrink-0" />
                </div>
                <div className="text-left space-y-0.5">
                  <span className={`text-xs font-bold font-mono tracking-wider block uppercase ${isLightTheme ? 'text-indigo-700' : 'text-indigo-350 font-extrabold'}`}>Security Authorization</span>
                  <h3 className={`text-lg md:text-xl font-black ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>
                    무료로 시작하세요. Gemini API 키만 있으면 됩니다.
                  </h3>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center self-start sm:self-auto">
                {isKeyUnlocked ? (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isLightTheme ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    프리미엄 인증 라이선스 활성화됨
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${isLightTheme ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    인증 대기 상태
                  </span>
                )}
              </div>
            </div>

            {/* Input Form with button */}
            <div className="space-y-3 font-sans">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="Gemini API Key 입력 (AIzaSy으로 시작하는 39글자 키)"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    disabled={isKeyValidating || isKeyUnlocked}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm font-bold transition-all outline-none border focus:ring-4 ${
                      isLightTheme
                        ? 'bg-slate-55 border-slate-200 focus:bg-white focus:border-indigo-500/50 focus:ring-indigo-500/10 text-slate-900 placeholder-slate-400'
                        : 'bg-neutral-950/70 border-white/10 focus:bg-neutral-950 focus:border-indigo-500/50 focus:ring-indigo-500/15 text-white placeholder-slate-400'
                    }`}
                  />
                </div>
                
                {isKeyUnlocked ? (
                  <button
                    type="button"
                    onClick={handleLockKey}
                    className="px-6 py-3.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 font-bold rounded-2xl text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>키 인증 해제</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleValidateKey()}
                    disabled={isKeyValidating || !geminiKey.trim()}
                    className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-400/30 disabled:text-slate-500 disabled:cursor-not-allowed active:scale-95 text-white font-extrabold rounded-2xl text-xs transition-all shadow-lg hover:shadow-indigo-500/20 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isKeyValidating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>인증 검사 중...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-white" />
                        <span>승인받기 (시작하기)</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Status Feedbacks */}
              <AnimatePresence>
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/10 text-rose-500 text-xs font-semibold text-left flex items-start gap-2"
                  >
                    <span className="shrink-0 mt-0.5">⚠️</span>
                    <div className="space-y-0.5">
                      <p>API 키 승인에 실패했습니다.</p>
                      <p className="opacity-80 font-normal">{validationError}</p>
                    </div>
                  </motion.div>
                )}

                {isKeyUnlocked && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`p-3.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 animate-pulse ${
                      isLightTheme
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-800'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    <span>🎉</span>
                    <span>성공적으로 인증되었습니다! 오늘의 기분 배터리 측정 작업 환경이 즉각 오픈되었습니다.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Guide box (Accordion) */}
            <div className={`rounded-2xl border ${
              isLightTheme 
                ? 'bg-slate-50 border-slate-200' 
                : 'bg-slate-950/40 border-white/10'
            }`}>
              <button
                type="button"
                onClick={() => setIsGuideExpanded(!isGuideExpanded)}
                className={`w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer transition-colors rounded-2xl ${
                  isLightTheme ? 'hover:bg-slate-100' : 'hover:bg-white/5'
                }`}
              >
                <div className={`flex items-center gap-2 text-xs font-extrabold ${isLightTheme ? 'text-slate-800' : 'text-white'}`}>
                  <HelpCircle className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span>❓ Gemini API Key 발급 가이드</span>
                </div>
                <motion.div
                  animate={{ rotate: isGuideExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={isLightTheme ? 'text-slate-600' : 'text-slate-400'}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isGuideExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`overflow-hidden border-t ${
                      isLightTheme ? 'border-slate-200' : 'border-white/10'
                    }`}
                  >
                    <div className={`p-5 space-y-4 text-left text-xs font-sans leading-relaxed ${isLightTheme ? 'text-slate-800' : 'text-slate-100'}`}>
                      
                      {/* Steps */}
                      <div className="space-y-3.5">
                        <div className="flex gap-3">
                          <span className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'}`}>1</span>
                          <div className="space-y-1">
                            <h4 className={`font-extrabold ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>Google AI Studio 접속</h4>
                            <p className={`${isLightTheme ? 'text-slate-800' : 'text-slate-200'}`}>아래 공식 발급 사이트 링크를 탭하여 Google AI Studio에 접속해 줍니다.</p>
                            <a 
                              href="https://aistudio.google.com/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`inline-flex items-center gap-1.5 font-bold hover:underline mt-1 ${isLightTheme ? 'text-indigo-600' : 'text-indigo-400'}`}
                            >
                              <span>https//aistudio.google.com/apikey</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'}`}>2</span>
                          <div className="space-y-1">
                            <h4 className={`font-extrabold ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>Google 계정 로그인</h4>
                            <p className={`${isLightTheme ? 'text-slate-800' : 'text-slate-200'}`}>사용 중인 구글(Gmail) 계정으로 편안히 로그인합니다. (구글 계정이 없으시다면 언제든 간편하게 무료 생성하실 수 있습니다.)</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'}`}>3</span>
                          <div className="space-y-1">
                            <h4 className={`font-extrabold ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>'Create API Key' (API 키 만들기) 클릭</h4>
                            <p className={`${isLightTheme ? 'text-slate-800' : 'text-slate-200'}`}>메인 대시보드 화면 속에 선명하게 정렬된 <strong className={`font-extrabold ${isLightTheme ? 'text-indigo-700' : 'text-indigo-300'}`}>‘Create API Key’</strong> 버튼을 눌러줍니다.</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'}`}>4</span>
                          <div className="space-y-1">
                            <h4 className={`font-extrabold ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>프로젝트 선택 지향 후 생성</h4>
                            <p className={`${isLightTheme ? 'text-slate-800' : 'text-slate-200'}`}>개발용 기본 프로젝트를 체크하거나 지정한 뒤 <strong className={`font-extrabold ${isLightTheme ? 'text-indigo-700' : 'text-indigo-300'}`}>‘Create API key in existing project’</strong>를 클릭해 줍니다.</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <span className={`w-5 h-5 rounded-full font-black text-[10px] flex items-center justify-center shrink-0 ${isLightTheme ? 'bg-slate-900 text-white' : 'bg-white text-slate-950'}`}>5</span>
                          <div className="space-y-1">
                            <h4 className={`font-extrabold ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>생성키 복사 및 붙여넣기</h4>
                            <p className={`${isLightTheme ? 'text-slate-800' : 'text-slate-200'}`}><strong className={`font-mono font-bold ${isLightTheme ? 'text-indigo-700' : 'text-indigo-300'}`}>AIza</strong>로 시작하는 생성 완료 키를 즉각 클립보드 복사(Copy)하여 상단의 입력창에 정밀히 이식해 주세요!</p>
                          </div>
                        </div>
                      </div>

                      {/* Accent CTA button */}
                      <div className="pt-2">
                        <a
                          href="https://aistudio.google.com/apikey"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full justify-center px-4 py-3 font-bold rounded-2xl transition-all flex items-center gap-2 cursor-pointer border text-xs ${
                            isLightTheme
                              ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200'
                              : 'bg-indigo-950/65 hover:bg-indigo-900/80 text-indigo-200 border-indigo-800'
                          }`}
                        >
                          <span>🔑 API 키 발급 페이지로 이동</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pillars Card Grid Section */}
          <div id="pillars-features" className="space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className={`text-xs font-bold font-mono uppercase tracking-widest block ${dTextIndigo}`}>App Special Values</span>
              <h3 className={`text-2xl md:text-3xl font-extrabold ${dTextHeading2}`}>
                오늘의 기분 배터리가 가진 3대 명품 매력
              </h3>
              <p className={`text-xs md:text-sm leading-relaxed font-sans ${dTextSlate400}`}>
                체계적인 기능 구성과 프리미엄 디자인으로 소진과 회복의 감정 주기를 스스로 탐지합니다.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              
              {/* Feature 1 */}
              <div className={`p-6 rounded-[28px] space-y-4 hover:border-emerald-500/30 transition-all border ${
                isLightTheme 
                  ? 'bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border-slate-800/10 hover:bg-white' 
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLightTheme ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  <Activity className="w-6 h-6" />
                </div>
                <h4 className={`text-base font-bold ${dTextWhite}`}>1. 입체적인 '다차원 감정 계측'(Single/Dual/Triple)</h4>
                <p className={`text-xs leading-relaxed ${dTextSlate300}`}>
                  가장 손쉬운 <strong className={isLightTheme ? 'text-slate-950 font-extrabold' : 'text-white'}>1단계 단일 점수</strong> 모드부터, 
                  행복과 스트레스를 상호 보완하는 <strong className={isLightTheme ? 'text-slate-950 font-extrabold' : 'text-white'}>2중 대립 모드</strong>, 
                  신체 활기•정신 에너지•순수 기쁨의 <strong className={isLightTheme ? 'text-slate-950 font-extrabold' : 'text-white'}>3원색 종합 충전방식</strong>까지 
                  본인의 감정 분별력 수준에 맞춰 기어를 바꾸며 입체적으로 세밀 가시화 가능합니다.
                </p>
              </div>

              {/* Feature 2 */}
              <div className={`p-6 rounded-[28px] space-y-4 hover:border-amber-500/30 transition-all border ${
                isLightTheme 
                  ? 'bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border-slate-800/10 hover:bg-white' 
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLightTheme ? 'bg-amber-50 text-amber-700' : 'bg-amber-500/10 text-amber-400'}`}>
                  <Coffee className="w-6 h-6" />
                </div>
                <h4 className={`text-base font-bold ${dTextWhite}`}>2. 즉각 충전 처방 시뮬레이터</h4>
                <p className={`text-xs leading-relaxed ${dTextSlate300}`}>
                  "따뜻한 아메리카노☕", "최애 힐링 음악🎧", "숲길 산책🌲" 등 마음을 부스팅해 줄 즉각 힐링 동작과 
                  "갑작스런 회의💼", "스마트폰 스크롤 모바일 중독📱" 등 에너지를 좀 먹는 감전 요소들을 실시간 클릭 대입하여 
                  배터리에 즉시 가감 반응을 유도, 감정의 물리적 충전 원동력을 가상 학습합니다.
                </p>
              </div>

              {/* Feature 3 */}
              <div className={`p-6 rounded-[28px] space-y-4 hover:border-indigo-500/30 transition-all border ${
                isLightTheme 
                  ? 'bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border-slate-800/10 hover:bg-white' 
                  : 'bg-white/5 border-white/10 hover:bg-white/8'
              }`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isLightTheme ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-500/10 text-indigo-400'}`}>
                  <Calendar className="w-6 h-6" />
                </div>
                <h4 className={`text-base font-bold ${dTextWhite}`}>3. 영구 보관함 & 메디컬 분석 보고서</h4>
                <p className={`text-xs leading-relaxed ${dTextSlate300}`}>
                  슬라이더 조향 수치와 미니 한 줄 회고록 동시 저장이 영구 유지됩니다. 
                  최근 기록들을 직사각 막대 통계 그래프로 즉각 가공하며, 총 저장량 및 평균 배터리를 통해 
                  스스로의 자정 능력을 분석 보고하고 <strong className={isLightTheme ? 'text-slate-950 font-extrabold' : 'text-white'}>상세한 마인드 조언 조율처방전</strong>을 도출합니다.
                </p>
              </div>

            </div>
          </div>

          {/* Interactive Themes Presentation Block */}
          <div className={`p-8 rounded-[36px] grid grid-cols-1 md:grid-cols-2 gap-8 items-center border ${
            isLightTheme 
              ? 'bg-white/80 border-slate-800/10 shadow-[0_4px_24px_rgba(0,0,0,0.03)]' 
              : 'bg-gradient-to-br from-indigo-950/30 to-slate-900/40 border-white/10'
          }`}>
            <div className="space-y-4 text-left">
              <span className={`text-[10px] font-bold uppercase tracking-widest block font-mono ${dTextIndigo}`}>Sensory Interface Theme</span>
              <h3 className={`text-xl md:text-2xl font-bold leading-tight ${dTextWhite}`}>
                기분에 따라, 눈높이에 맞게<br />실시간 미적 변형 스타일링 5색
              </h3>
              <p className={`text-xs leading-relaxed font-sans ${dTextSlate300}`}>
                마음이 차가울 땐 미래형 <strong className={isLightTheme ? 'text-slate-950 font-bold' : 'text-white'}>네온 사이버펑크</strong>로, 
                따분할 땐 반짝이는 <strong className={isLightTheme ? 'text-slate-950 font-bold' : 'text-white'}>Vibrant 감취 테마</strong>로 옷을 바꿔보세요! 
                글래스모피즘, 화사한 파스텔, 신문지 무드의 미니멀 화이트 등 5종의 프리미엄 예술적 스킨이 
                원천 탑재되어 배터리 조율의 시각적 즐거움을 극대화해 드립니다.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-sans">
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${isLightTheme ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-300'} font-bold`}>✨ Vibrant Palette</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${isLightTheme ? 'bg-slate-100 text-slate-800' : 'bg-slate-500/20 text-slate-300'} font-semibold`}>💎 Glassmorphism</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${isLightTheme ? 'bg-pink-100 text-pink-800' : 'bg-pink-500/20 text-pink-300'} font-semibold`}>🌸 Pastel</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${isLightTheme ? 'bg-cyan-100 text-cyan-800' : 'bg-cyan-500/20 text-cyan-300'} font-semibold`}>⚡ Cyberpunk Neon</span>
                <span className={`text-[10px] px-2.5 py-1 rounded-full ${isLightTheme ? 'bg-stone-100 text-stone-800' : 'bg-stone-500/20 text-stone-300'} font-semibold`}>⬜ Swiss Minimal</span>
              </div>
            </div>

            <div className={`space-y-4 p-6 rounded-2xl border text-left font-sans ${
              isLightTheme 
                ? 'bg-slate-900/5 border-slate-950/10 shadow-sm' 
                : 'bg-slate-950/40 border-white/5'
            }`}>
              <h4 className={`text-xs font-bold border-b pb-2 mb-2 flex items-center gap-1.5 ${isLightTheme ? 'border-indigo-950/20 text-slate-950' : 'border-white/10 text-white'}`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> 감정 자가 충전 케어라인 제언
              </h4>
              <div className="space-y-3">
                <div className="flex gap-2 items-start text-xs">
                  <span className="text-emerald-500 font-bold block mt-0.5">●</span>
                  <p className={isLightTheme ? 'text-slate-850 font-medium' : 'text-slate-300'}><strong className={isLightTheme ? 'text-slate-950 font-bold' : 'text-white'}>만충 / 활화산 (80% ~ 100%)</strong>: 활력이 충실해 두뇌가 기민한 시즌입니다. 거대한 결정이나 새로운 도전을 시작하세요.</p>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="text-amber-500 font-bold block mt-0.5">●</span>
                  <p className={isLightTheme ? 'text-slate-850 font-medium' : 'text-slate-300'}><strong className={isLightTheme ? 'text-slate-950 font-bold' : 'text-white'}>일상 보전 (30% ~ 70%)</strong>: 업무 피로가 서서히 쌓여 정체가 예견되는 지점입니다. "따뜻한 허브 차🍵" 가볍게 한 잔 하세요.</p>
                </div>
                <div className="flex gap-2 items-start text-xs">
                  <span className="text-rose-500 font-bold block mt-0.5">●</span>
                  <p className={isLightTheme ? 'text-slate-850 font-medium' : 'text-slate-300'}><strong className={isLightTheme ? 'text-slate-950 font-bold' : 'text-white'}>저전력 비상 (20% 이하)</strong>: 내마음 가동 엔진이 급속 냉각 중입니다. 스마트폰은 끄고 "파워 낮잠😴" 상태로 자신을 셧다운 하세요.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Landing CTA Section */}
          <div className={`p-8 rounded-[36px] text-center space-y-5 shadow-2xl relative overflow-hidden border ${
            isLightTheme 
              ? 'bg-gradient-to-r from-emerald-500/10 via-teal-50/25 to-indigo-500/10 border-slate-800/10' 
              : 'bg-gradient-to-r from-emerald-900/30 via-slate-900/30 to-indigo-950/30 border-white/10'
          }`}>
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl" />
            
            <h3 className={`text-2xl font-black leading-snug ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>
              당신의 지금 기분은 완벽히 정상인가요?
            </h3>
            
            <p className={`text-xs md:text-sm max-w-xl mx-auto leading-relaxed font-sans ${isLightTheme ? 'text-slate-850 font-medium' : 'text-slate-300'}`}>
              자가 분석 일지만 축적되어도 내 피로 흐름의 고비와 휴식 분기점을 찾을 수 있습니다. 
              오늘의 감정을 영구 저축하는 똑똑한 일지를 지금 체험하세요.
            </p>

            <button
              type="button"
              id="btn-landing-cta"
              onClick={() => {
                setActiveTab('tracker');
                if (!isKeyUnlocked) {
                  setToast({
                    id: Date.now(),
                    text: '🔑 감정 측정기 및 로깅 기능을 활성화하려면 Gemini API 인증이 필요합니다.',
                    success: false
                  });
                }
              }}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-950 text-white dark:bg-white dark:hover:bg-slate-50 dark:text-slate-950 font-black rounded-2xl text-xs hover:scale-105 transition-all shadow-xl inline-flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500 animate-pulse" />
              <span>실시간 측정기 실행 및 감정 로깅하기 &rarr;</span>
            </button>
          </div>

        </motion.div>
      ) : !isKeyUnlocked ? (
        /* Lock state UI */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`w-full max-w-2xl mx-auto p-8 rounded-[40px] border backdrop-blur-2xl text-center space-y-6 md:my-12 ${
            isLightTheme 
              ? 'bg-white/85 border-slate-200/60 shadow-2xl' 
              : 'bg-slate-900/50 border-white/10 shadow-2xl'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 animate-pulse text-indigo-500" />
          </div>
          
          <div className="space-y-2 font-sans">
            <h2 className={`text-2xl font-black tracking-tight ${isLightTheme ? 'text-slate-950' : 'text-white'}`}>
              기분 배터리 진입 차단됨 🔒
            </h2>
            <p className={`text-sm leading-relaxed max-w-md mx-auto ${isLightTheme ? 'text-slate-700' : 'text-slate-300'}`}>
              실시간 기분 측정기 및 감정 로깅 시스템을 이용하시려면 <strong>유효한 Gemini API Key 인증</strong>이 선행되어야 합니다.
            </p>
          </div>

          <div className="p-6 rounded-[28px] bg-indigo-500/5 border border-indigo-500/10 max-w-md mx-auto space-y-4">
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 text-left flex items-center gap-1.5 justify-center sm:justify-start">
              <Key className="w-4 h-4 text-indigo-505" />
              <span>Gemini API Key를 입력하여 잠금을 푸세요:</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 font-sans">
              <input
                type="password"
                placeholder="AIzaSy로 시작하는 API 키를 입력하세요"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-semibold border outline-none ${
                  isLightTheme
                    ? 'bg-white border-slate-200 focus:border-indigo-500 text-slate-900'
                    : 'bg-slate-950/60 border-white/10 focus:border-indigo-500 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => handleValidateKey()}
                disabled={isKeyValidating || !geminiKey.trim()}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isKeyValidating ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Unlock className="w-3.5 h-3.5" />
                )}
                <span>잠금해제</span>
              </button>
            </div>
            {validationError && (
              <p className="text-[11px] text-rose-500 font-bold text-left flex items-center gap-1 font-sans">❌ {validationError}</p>
            )}
          </div>

          <div className="pt-2 font-sans">
            <button
              type="button"
              onClick={() => {
                setActiveTab('landing');
                setTimeout(() => {
                  const el = document.getElementById('pillars-features');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`text-xs font-bold hover:underline cursor-pointer ${isLightTheme ? 'text-slate-500 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
            >
              &lsaquo; 랜딩 페이지 및 API 발급 가이드로 돌아가기
            </button>
          </div>
        </motion.div>
      ) : (
        /* Regular Tracker Workstation Content Workspace */
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* ================= LEFT SIDEBAR: CONFIGURATOR (배터리 스타일리스트) ================= */}
        <div className="col-span-1 lg:col-span-4 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl p-5 border border-slate-200/60 dark:border-neutral-800/60 shadow-xl flex flex-col gap-6">
          <div className="flex items-center gap-2 pb-3 border-b border-dashed border-slate-200 dark:border-neutral-800">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-md font-bold text-slate-800 dark:text-slate-100">배터리 디자인 테마 & 시각 효과</h2>
              <p className="text-xs text-slate-500">원하는 취향에 맞춰 외형을 제어하세요</p>
            </div>
          </div>

          {/* 1. Theme Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              🎨 인터랙티브 디자인 테마 선호도
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                type="button"
                id="btn-theme-vibrant"
                onClick={() => setTheme('vibrant-palette')}
                className={`p-3 text-left rounded-xl border text-xs gap-1 flex flex-col transition-all cursor-pointer ${
                  theme === 'vibrant-palette' 
                    ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400 font-bold ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="font-semibold text-[13px]">Vibrant Palette ✨</span>
                <span className="text-[10px] opacity-75">초록/블루 감각 테마</span>
              </button>

              <button 
                type="button"
                id="btn-theme-glass"
                onClick={() => setTheme('glassmorphism')}
                className={`p-3 text-left rounded-xl border text-xs gap-1 flex flex-col transition-all cursor-pointer ${
                  theme === 'glassmorphism' 
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300 font-bold ring-2 ring-indigo-500/20' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="font-semibold text-[13px]">유리 투명테마</span>
                <span className="text-[10px] opacity-75">Glassmorphism</span>
              </button>
              
              <button 
                type="button"
                id="btn-theme-pastel"
                onClick={() => setTheme('pastel')}
                className={`p-3 text-left rounded-xl border text-xs gap-1 flex flex-col transition-all cursor-pointer ${
                  theme === 'pastel' 
                    ? 'border-pink-500 bg-pink-50/40 text-pink-700 dark:text-pink-300 font-bold ring-2 ring-pink-500/20' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="font-semibold text-[13px]">따뜻 감성 파스텔</span>
                <span className="text-[10px] opacity-75 font-serif-korean text-emerald-800">Warm Pastel</span>
              </button>

              <button 
                type="button"
                id="btn-theme-dark"
                onClick={() => setTheme('dark-neon')}
                className={`p-3 text-left rounded-xl border text-xs gap-1 flex flex-col transition-all cursor-pointer ${
                  theme === 'dark-neon' 
                    ? 'border-cyan-500 bg-cyan-950/20 text-cyan-400 font-bold ring-2 ring-cyan-500/20' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="font-semibold text-[13px]">네온 사이버펑크</span>
                <span className="text-[10px] opacity-75 font-mono">Neon Cyberpunk</span>
              </button>

              <button 
                type="button"
                id="btn-theme-minimal"
                onClick={() => setTheme('minimal-white')}
                className={`p-3 text-left rounded-xl border text-xs gap-1 flex flex-col transition-all cursor-pointer ${
                  theme === 'minimal-white' 
                    ? 'border-black bg-neutral-100 text-black font-bold ring-2 ring-black/20' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                <span className="font-semibold text-[13px]">미니멀 블랙/화이트</span>
                <span className="text-[10px] opacity-75">Swiss Minimalist</span>
              </button>
            </div>
          </div>

          {/* 2. Mood Mode Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              ⚡ 감정/기분 점수 세부 요소
            </label>
            <div className="flex flex-col gap-2">
              <button 
                type="button"
                onClick={() => setMode('single')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  mode === 'single' 
                    ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/10 text-violet-700 dark:text-violet-300 font-medium' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Smile className="w-4 h-4 text-violet-500" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">종합 점수 1개</p>
                    <p className="text-[10px] opacity-75">가장 심플하고 정확한 종합 체감 점수</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-400">기본</div>
              </button>

              <button 
                type="button"
                onClick={() => setMode('dual')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  mode === 'dual' 
                    ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/10 text-violet-700 dark:text-violet-300 font-medium' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">행복도 & 스트레스 2개</p>
                    <p className="text-[10px] opacity-75">행복은 충전하고 스트레스는 방전시킵니다</p>
                  </div>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setMode('triple')}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                  mode === 'triple' 
                    ? 'border-violet-500 bg-violet-50/40 dark:bg-violet-950/10 text-violet-700 dark:text-violet-300 font-medium' 
                    : 'border-slate-200 dark:border-neutral-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <div className="text-left">
                    <p className="text-xs font-semibold">신체 • 정신 • 기쁨 3개</p>
                    <p className="text-[10px] opacity-75">에너지, 멘탈과 기쁨을 종합한 삼원색 충전율</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* 3. Visual Effects Customizer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
              🔮 활성화할 가시적 장식 효과
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-800/40">
                <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-blue-500" /> 배터리 내부 파도 일렁임</span>
                <input 
                  type="checkbox" 
                  checked={effects.wave}
                  onChange={(e) => setEffects(prev => ({ ...prev, wave: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-800/40">
                <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Sparkle className="w-3.5 h-3.5 text-yellow-500" /> 수치 높을 때 반짝이는 글리터</span>
                <input 
                  type="checkbox" 
                  checked={effects.spark}
                  onChange={(e) => setEffects(prev => ({ ...prev, spark: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-800/40">
                <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Moon className="w-3.5 h-3.5 text-cyan-500" /> 오로라 네온 글로우 발광</span>
                <input 
                  type="checkbox" 
                  checked={effects.glow}
                  onChange={(e) => setEffects(prev => ({ ...prev, glow: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-neutral-800/40">
                <span className="text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-rose-500" /> 배경 무드와 실시간 컬러 연동</span>
                <input 
                  type="checkbox" 
                  checked={effects.dynamicBg}
                  onChange={(e) => setEffects(prev => ({ ...prev, dynamicBg: e.target.checked }))}
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Guidelines info card */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-300 gap-2 flex flex-col">
            <span className="font-semibold flex items-center gap-1"><Info className="w-4 h-4" /> 알아두면 좋은 팁!</span>
            <span>배터리 강도에 맞춰 배경색이 카멜레온처럼 부드럽게 변하며, 잔량에 따른 실시간 격려 메시지가 쏟아집니다. 좌측 상단 분석을 열어 전체 기록 통계도 구경해 보세요.</span>
          </div>
        </div>

        {/* ================= RIGHT MAIN LAYOUT: MOOD BATTERY CONTAINER & LOGS ================= */}
        <div className="col-span-1 lg:col-span-8 flex flex-col gap-6">
          
          {/* Main Device Layout styled with active theme */}
          <div className={`p-6 md:p-8 relative transition-all duration-700 ${getThemeWrapperClass()}`}>
            
            {/* Header Area inside Device */}
            <div className="flex items-center justify-between border-b pb-4 mb-6 border-slate-200/50 dark:border-neutral-800/50">
              <div className="flex items-center gap-3">
                <div className="flex space-x-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                </div>
                <h1 className={`text-lg md:text-xl font-bold tracking-tight ${theme === 'vibrant-palette' ? 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-extrabold' : ''}`}>오늘의 기분 배터리</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-neutral-800 font-semibold uppercase">{theme === 'vibrant-palette' ? 'Vibrant' : theme}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowAnalyticModal(true)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg text-xs gap-1 flex items-center transition-all cursor-pointer font-semibold"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> 리포트
                </button>
                <button 
                  onClick={() => setShowGuideModal(true)}
                  className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg text-xs gap-1 flex items-center transition-all cursor-pointer"
                >
                  <Info className="w-4 h-4 text-slate-500" /> 헬프
                </button>
              </div>
            </div>

            {/* TWO-COLUMN CONTENT GRID INSIDE THE EMULATOR SHEET */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              
              {/* BATTERY RENDER COLUMN */}
              <div className="col-span-1 md:col-span-6 flex flex-col items-center justify-center p-4">
                
                {/* 3D Aura Neon Glow behind battery if checked */}
                <div className="relative">
                  {effects.glow && (
                    <div 
                      className="absolute inset-0 rounded-[50px] blur-3xl opacity-40 mix-blend-screen transition-all duration-700 pointer-events-none scale-105"
                      style={{ 
                        backgroundColor: batteryColorSettings.fill, 
                        boxShadow: `0 0 80px 20px ${batteryColorSettings.fill}` 
                      }} 
                    />
                  )}

                  {/* Battery Body */}
                  <div className={`relative w-44 transition-all duration-500 ${
                    theme === 'vibrant-palette'
                      ? 'h-80 border-[6px] border-white/20 rounded-[60px] p-2 flex flex-col justify-end shadow-[0_0_50px_rgba(16,185,129,0.2)] z-10'
                      : 'h-72 border-4 border-slate-700 dark:border-neutral-200 rounded-[36px] bg-slate-900/5 dark:bg-neutral-900/40 p-2 flex flex-col justify-end overflow-hidden shadow-inner z-10'
                  }`}>
                    
                    {/* Empty Background Indicator (e.g. charging grids) */}
                    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between py-10 px-4 opacity-5 pointer-events-none">
                      <div className="h-[2px] bg-white w-full" />
                      <div className="h-[2px] bg-white w-full" />
                      <div className="h-[2px] bg-white w-full" />
                      <div className="h-[2px] bg-white w-full" />
                    </div>

                    {/* LIQUID WAVE OR SOLID SOLID FILL */}
                    <div 
                      className={`relative w-full transition-all duration-700 overflow-hidden ${
                        theme === 'vibrant-palette' ? 'rounded-[48px]' : 'rounded-[24px]'
                      }`}
                      style={{ 
                        height: `${calculatedScore}%`,
                        backgroundColor: batteryColorSettings.fill,
                        boxShadow: effects.glow ? `0 0 25px ${batteryColorSettings.fill}` : 'none'
                      }}
                    >
                      {/* CSS WAVE LAYERS */}
                      {effects.wave && (
                        <div className="absolute top-0 left-0 w-full h-[50px] -translate-y-1/2 overflow-hidden pointer-events-none">
                          <div 
                            className="absolute left-1/2 bottom-[-150px] w-[350%] h-[300px] rounded-[41%] opacity-40 animate-wave-slow"
                            style={{ backgroundColor: batteryColorSettings.fill, filter: 'brightness(115%)' }}
                          />
                          <div 
                            className="absolute left-[40%] bottom-[-140px] w-[320%] h-[290px] rounded-[44%] opacity-25 animate-wave-fast"
                            style={{ backgroundColor: batteryColorSettings.fill, filter: 'brightness(80%)' }}
                          />
                        </div>
                      )}

                      {/* Spark Glitter Particles */}
                      {effects.spark && calculatedScore > 10 && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                          {sparkParticles.map((particle) => (
                            <div
                              key={particle.id}
                              className="absolute rounded-full bg-white animate-pulse"
                              style={{
                                left: particle.left,
                                bottom: particle.bottom,
                                width: particle.size,
                                height: particle.size,
                                opacity: Math.min(0.65, (calculatedScore / 100)),
                                filter: 'blur(0.5px)',
                                transform: `translateY(${(100 - calculatedScore) * 0.15}px)`
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Numeric Score Indicator */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                      <span className="text-5xl font-extrabold tracking-tighter drop-shadow-md flex items-baseline">
                        {calculatedScore}
                        <span className="text-xl font-medium ml-1">%</span>
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white mt-2 backdrop-blur-xs">
                        {batteryColorSettings.label}
                      </span>
                    </div>

                  </div>

                  {/* Battery Top Cap */}
                  <div className={`absolute left-1/2 -translate-x-1/2 z-0 transition-all ${
                    theme === 'vibrant-palette'
                      ? 'top-0 -mt-3.5 w-12 h-3.5 bg-white/20 rounded-t-lg'
                      : '-top-3 w-14 h-3 bg-slate-700 dark:bg-neutral-200 rounded-t-lg'
                  }`} />
                </div>

                {/* Motivational Quote at bottom of battery */}
                <div className="text-center mt-5 max-w-[250px]">
                  <p className={`${getThemeTextMutedClass()} italic text-xs leading-relaxed`}>
                    "{MOTIVATIONAL_QUOTES[calculatedScore % MOTIVATIONAL_QUOTES.length]}"
                  </p>
                </div>

              </div>

              {/* INPUT CONTROLS COLUMN */}
              <div className="col-span-1 md:col-span-6 space-y-6">
                
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 opacity-80">
                  <Activity className="w-4 h-4 text-indigo-500 animate-pulse" /> 오늘의 상태 조율 슬라이더
                </h3>

                {/* Render inputs based on mode */}
                {mode === 'single' ? (
                  <div className={getThemeCardClass()}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold font-sans">종합 기분 점수</span>
                      <span className="text-[13px] font-mono font-bold text-indigo-500">{overallScore}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">😢</span>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={overallScore}
                        onChange={(e) => setOverallScore(Number(e.target.value))}
                        className="w-full accent-indigo-500 range h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-sm">😊</span>
                    </div>
                    <p className="text-[10px] mt-1 text-slate-500">슬라이더를 밀어 오늘 전반적으로 느끼는 감정 상태를 대변하세요.</p>
                  </div>
                ) : mode === 'dual' ? (
                  <div className="space-y-4">
                    <div className={getThemeCardClass()}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">☀️ 행복과 즐거움 정도</span>
                        <span className="text-xs font-bold">{dualScores.happiness}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🥱</span>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={dualScores.happiness}
                          onChange={(e) => setDualScores(prev => ({ ...prev, happiness: Number(e.target.value) }))}
                          className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span>🎉</span>
                      </div>
                    </div>

                    <div className={getThemeCardClass()}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-rose-500 flex items-center gap-1">🔥 스트레스와 긴장 압박</span>
                        <span className="text-xs font-bold text-rose-500">{dualScores.stress}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>☕</span>
                        <input 
                          type="range"
                          min="0"
                          max="100"
                          value={dualScores.stress}
                          onChange={(e) => setDualScores(prev => ({ ...prev, stress: Number(e.target.value) }))}
                          className="w-full accent-rose-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                        <span>🤯</span>
                      </div>
                      <p className="text-[10px] text-right mt-1 text-slate-400">스트레스 수치는 배터리를 빠르게 소진시킵니다.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={getThemeCardClass()}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold flex items-center gap-1">💪 신체 활력 에너지</span>
                        <span className="text-xs font-bold font-mono">{tripleScores.physical}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={tripleScores.physical}
                        onChange={(e) => setTripleScores(prev => ({ ...prev, physical: Number(e.target.value) }))}
                        className="w-full accent-blue-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className={getThemeCardClass()}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold flex items-center gap-1">🧠 정신 안정 멘탈 케어</span>
                        <span className="text-xs font-bold font-mono">{tripleScores.mental}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={tripleScores.mental}
                        onChange={(e) => setTripleScores(prev => ({ ...prev, mental: Number(e.target.value) }))}
                        className="w-full accent-[#ec4899] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div className={getThemeCardClass()}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold flex items-center gap-1">✨ 순수 행복과 기쁨</span>
                        <span className="text-xs font-bold font-mono">{tripleScores.joy}%</span>
                      </div>
                      <input 
                        type="range"
                        min="0"
                        max="100"
                        value={tripleScores.joy}
                        onChange={(e) => setTripleScores(prev => ({ ...prev, joy: Number(e.target.value) }))}
                        className="w-full accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* CHEER CARD WITH RICH DESCRIPTION */}
                <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-neutral-700 bg-white/5 dark:bg-black/5">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">💡</div>
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-800 dark:text-neutral-100 mb-1">{currentCheer.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">{currentCheer.description}</p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* QUICK CHARGE ACTIONS (감성 충전액션) */}
            <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-neutral-800/50">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <Coffee className="w-4 h-4 text-amber-500" /> 인스턴트 배터리 수혈 액션
              </h4>
              <div className="flex flex-wrap gap-2">
                {CHARGE_ACTIONS.map((action, key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => triggerChargeAction(action)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium border border-transparent hover:border-slate-300 dark:hover:border-neutral-600"
                  >
                    <span>{action.icon}</span>
                    <span>{action.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${action.change > 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'}`}>
                      {action.change > 0 ? '+' : ''}{action.change}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* DIARY INPUT FORM (배터리 일지 쓰기) */}
            <form onSubmit={submitNote} className="mt-8 pt-6 border-t border-slate-200/50 dark:border-neutral-800/50">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wide flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" /> 감성 배터리 보관함에 기록하기
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="오늘의 마음 상태가 어떤지 한 줄의 가벼운 소감으로 요약해 기록해둘 수 있습니다..."
                  className="flex-1 p-3 text-xs bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-slate-100"
                />
                <button
                  type="submit"
                  className="px-4 py-3 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> 기록
                </button>
              </div>
            </form>

          </div>

          {/* ================= PAST MOOD BATTERY HISTORY (지난 기분 배터리 보관실) ================= */}
          <div className="bg-white/60 dark:bg-neutral-950/40 backdrop-blur-md rounded-2xl p-5 border border-slate-200/60 dark:border-neutral-800/60 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-500" /> 배터리 기록 보관실 ({logs.length}개)
                </h3>
                <p className="text-[11px] text-slate-500">지나왔던 감정 배터리의 상태 연대기</p>
              </div>

              {logs.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("정말로 모든 충전 기록 일기를 일괄 비우시겠습니까?")) {
                      saveLogsToStorage([]);
                    }
                  }}
                  className="text-[11px] text-rose-500 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" /> 전체 비우기
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/50 dark:bg-neutral-900/50 rounded-xl border border-dashed border-slate-200 dark:border-neutral-800">
                <span className="text-4xl block mb-2 opacity-50">🔋</span>
                <p className="text-xs text-slate-500 font-medium">아직 보관된 감정 기록이 없습니다.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">상단 입력창에서 첫 일지를 작성하여 저축을 시작하세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logs.map((record) => {
                  const subColor = getBatteryColors(record.overallScore);
                  return (
                    <div 
                      key={record.id}
                      className="p-4 rounded-xl border border-slate-150 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex gap-3.5"
                    >
                      {/* Left side: Micro Battery Visual representation */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative w-8 h-14 border border-slate-400 dark:border-neutral-400 rounded bg-slate-100 dark:bg-neutral-800 p-0.5 flex flex-col justify-end overflow-hidden">
                          <div 
                            className="w-full rounded-sm"
                            style={{ 
                              height: `${record.overallScore}%`,
                              backgroundColor: subColor.fill
                            }} 
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100 select-none drop-shadow-xs">{record.overallScore}%</span>
                          </div>
                        </div>
                        <div className="w-3 h-0.5 bg-slate-400 dark:bg-neutral-400 -mt-[1px] rounded-t-xs" />
                      </div>

                      {/* Right side: content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{record.date}</span>
                            <span>•</span>
                            <span>{record.time}</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => deleteRecord(record.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="기록 지우기"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Theme Badge */}
                        <div className="flex gap-1.5 mt-1 select-none">
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                            {record.theme}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold">
                            {record.mode}
                          </span>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-200 mt-2 line-clamp-2 leading-relaxed">
                          {record.notes}
                        </p>

                        {/* Detailed inner factors list if available */}
                        {Object.keys(record.scores).length > 1 && (
                          <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-dashed border-slate-100 dark:border-neutral-800">
                            {Object.entries(record.scores).map(([k, v]) => (
                              <span key={k} className="text-[9px] bg-slate-50 dark:bg-neutral-800 px-1 text-slate-500 rounded font-mono">
                                {k}: {v}%
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
      )}

      {/* ================= MODAL 1: ANALYTICS & STATS (배터리 분석실) ================= */}
      <AnimatePresence>
        {showAnalyticModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-5 border-b border-slate-200 dark:border-neutral-800 bg-sky-50/50 dark:bg-sky-950/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-md">기분 배터리 감성 통계 리포트</h3>
                </div>
                <button 
                  onClick={() => setShowAnalyticModal(false)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                
                {/* Score boxes */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl text-center border border-slate-100 dark:border-neutral-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">저장된 일지</span>
                    <span className="text-2xl font-black text-indigo-500 mt-1 block">{logs.length}개</span>
                  </div>
                  
                  <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl text-center border border-slate-100 dark:border-neutral-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">평균 배터리 충전</span>
                    <span className="text-2xl font-black text-emerald-500 mt-1 block">{averageBattery}%</span>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-neutral-800/50 rounded-xl text-center border border-slate-100 dark:border-neutral-800">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">역대 최고치 기록</span>
                    <span className="text-2xl font-black text-cyan-500 mt-1 block">{maxBattery}%</span>
                  </div>
                </div>

                {/* Simulated Chart using pure standard SVG heights */}
                <div>
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3 tracking-wider">감정 연대기 트렌드 시각화</h4>
                  {logs.length === 0 ? (
                    <div className="p-6 text-center bg-slate-100/50 rounded-xl text-xs text-slate-400">데이터가 불충분하여 차트를 그릴 수 없습니다.</div>
                  ) : (
                    <div className="p-4 bg-slate-50 dark:bg-neutral-950/40 border border-slate-200/50 dark:border-neutral-800/50 rounded-xl">
                      <div className="h-32 flex items-end justify-around gap-2 pt-4">
                        {logs.slice(0, 10).reverse().map((r, i) => (
                          <div key={r.id} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                            <span className="text-[9px] font-mono font-bold text-slate-500">{r.overallScore}%</span>
                            <div 
                              className="w-full rounded-t-sm transition-all duration-1000 origin-bottom"
                              style={{ 
                                height: `${Math.max(12, r.overallScore)}%`,
                                backgroundColor: getBatteryColors(r.overallScore).fill 
                              }}
                            />
                            <span className="text-[9px] font-mono text-slate-400 truncate w-full text-center">{r.date.substring(5)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="text-right mt-2 text-[9px] text-slate-400 font-medium">최대 최근 10개 기록 표시</div>
                    </div>
                  )}
                </div>

                {/* Advice Box based on real-time averages */}
                <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 text-xs text-indigo-950 dark:text-indigo-300 space-y-1.5">
                  <p className="font-bold flex items-center gap-1">📊 종합 진단 소견:</p>
                  <p className="leading-relaxed">
                    {averageBattery === 0 
                      ? "아직 분석할 데이터가 부족하지만 기분 배터리는 언제든 신선히 충전할 준비가 되어 있습니다!"
                      : averageBattery <= 35 
                      ? "평균 배터리 용량이 전반적으로 저전력 상태에 유지되고 있습니다. 일상적인 무리수를 얹지 마시고 따뜻한 휴양 혹은 정시 퇴근과 안락지대(Comfort Zone) 구축을 위해 최급선무로 스케줄을 비우세요."
                      : averageBattery <= 65
                      ? "충분한 균형을 잡고 있습니다! 충전과 방전의 톱니바퀴가 자연스레 맞물리고 있습니다. 좋아하는 사람과의 차 한잔이나 산책을 통해 일상 부스터를 얹어 충전 활력을 더해보길 추천합니다."
                      : "최고의 컨디션 엔진을 달리는 중입니다! 지적 성장, 모험적인 프로젝트 도전, 새로운 취미 습득 등의 진취적 행동을 벌이기에 강력하게 권장되는 감정 완전 충전기입니다!"
                    }
                  </p>
                </div>

              </div>

              <div className="p-4 bg-slate-50 dark:bg-neutral-800/80 border-t border-slate-100 dark:border-neutral-800 text-right">
                <button 
                  onClick={() => setShowAnalyticModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  확인 완료
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL 2: USER GUIDE & INFO (도움말) ================= */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <div className="p-5 border-b border-slate-200 dark:border-neutral-800 bg-amber-50/50 dark:bg-amber-950/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Smile className="w-5 h-5 text-amber-500 animate-bounce" />
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">오늘의 기분 배터리 활용 설명서</h3>
                </div>
                <button 
                  onClick={() => setShowGuideModal(false)}
                  className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                <p>
                  <strong>'오늘의 기분 배터리'</strong>는 기쁨과 에너지, 스트레스와 같은 무형의 감정을 물리적인 배터리 잔량으로 가시화하여 마음 건강 상태를 재밌게 관찰할 수 있도록 돕는 힐링 유틸리티 모던 웹 프로토타입입니다.
                </p>
                
                <h4 className="font-bold text-slate-800 dark:text-neutral-100 mt-4 flex items-center gap-1">📋 주요 기능 일람:</h4>
                <ul className="list-disc pl-4 space-y-1.5 font-sans">
                  <li><strong>커스텀 실시간 드레스코드</strong>: 유부 유리 투명스타일(글래스모피즘), 감성 손글씨 파스텔, 다크 네온빛 사이버펑크, 미니멀 그리드 테마를 실시간 스왑할 수 있습니다.</li>
                  <li><strong>인스턴트 충전/방전 액션</strong>: 커피 마시기(+15%), 따뜻한 티 마시기, 파워 낮잠(+20%) 등을 즉시 적용해보거나 예상 밖 야근(-15%) 등의 격정 효과를 손쉽게 방전 대입해보세요!</li>
                  <li><strong>멀티플 감정 조합 조율</strong>: 심플하게 1개 종합 점수 슬라이더를 옮기거나, 스트레스 차감 방식의 2중 요소 조절, 육체/정신/기쁨의 3대 독립 에너지 충전 비율을 입체 검증할 수 있습니다.</li>
                  <li><strong>로컬 백업 보관함</strong>: 간단 일기 메모를 남기고 데이터 저장 버튼을 클릭하면 반영된 연대기가 기록 보관실에 영구 저장됩니다.</li>
                </ul>

                <hr className="border-slate-100 dark:border-neutral-800 my-2" />
                <p className="text-stone-500 italic">
                  "우리의 몸과 마음은 끊임없이 충전과 소모를 거칩니다. 배터리 게이지가 20% 미만으로 깜빡거리기 시작했다면 잠시만 기기를 꼽듯 스스로에게 포근하고 완전한 무활동 휴식을 양보해 주세요!"
                </p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-neutral-800/80 border-t border-slate-100 dark:border-neutral-800 text-right">
                <button 
                  onClick={() => setShowGuideModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  기분 좋게 시작하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Action/Toast System */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-xs font-semibold max-w-sm flex items-center gap-2 ${
              toast.success 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/90 dark:text-emerald-200 dark:border-emerald-800' 
                : 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-neutral-900/95 dark:text-indigo-200 dark:border-neutral-800'
            }`}
          >
            <span>✨</span>
            <p>{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

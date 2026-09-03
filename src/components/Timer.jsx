import React, { useState, useEffect, useRef } from 'react';
import BreathingBubble from './BreathingBubble';
import { 
  Play, 
  RotateCcw, 
  FastForward, 
  ChevronRight, 
  Award, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Gauge
} from 'lucide-react';
import { 
  playInhaleSound, 
  playExhaleSound, 
  playTibetanBowl, 
  startAlphaDrone, 
  stopAlphaDrone, 
  playMilestoneChime, 
  playRecoveryEndChime 
} from '../utils/zenAudio';
import { 
  triggerBreathPeakHaptic, 
  triggerSingingBowlHaptic, 
  triggerMilestoneHaptic, 
  triggerRecoveryEndHaptic,
  triggerHapticLight,
  triggerHapticMedium
} from '../utils/hapticsUtils';
import { 
  requestWakeLock, 
  releaseWakeLock, 
  saveSessionHistory,
  getSettings 
} from '../services/storageService';

const SPEED_TIMINGS = {
  slow: { label: 'Chậm', inhale: 2.0, exhale: 2.0, total: 4.0 },
  normal: { label: 'Chuẩn', inhale: 1.3, exhale: 1.2, total: 2.5 },
  fast: { label: 'Nhanh', inhale: 1.0, exhale: 0.8, total: 1.8 }
};

const Timer = ({ plan, onOpenPlans, onWorkoutStateChange, onSessionCompleted }) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'breathing' | 'retention' | 'recovery' | 'round_rest' | 'completed'
  const [breathCount, setBreathCount] = useState(0);
  const [breathState, setBreathState] = useState('inhale');
  const [retentionSeconds, setRetentionSeconds] = useState(0);
  const [recoveryTimeLeft, setRecoveryTimeLeft] = useState(15);
  
  const [roundResults, setRoundResults] = useState([]);
  const [milestoneCelebrated, setMilestoneCelebrated] = useState(false);
  const [completedSummary, setCompletedSummary] = useState(null);

  // Settings
  const settings = getSettings();

  // Cấu hình hiệp hiện tại
  const rounds = plan?.rounds || [];
  const currentRoundConfig = rounds[currentRoundIndex] || rounds[0] || {
    roundNumber: 1,
    breaths: 30,
    speed: 'normal',
    targetRetention: 60,
    recoveryHold: 15
  };

  const [activeSpeed, setActiveSpeed] = useState(currentRoundConfig.speed || 'normal');
  const targetBreaths = currentRoundConfig.breaths || 30;
  const targetRetention = currentRoundConfig.targetRetention || 60;
  const timings = SPEED_TIMINGS[activeSpeed] || SPEED_TIMINGS.normal;

  // Trạng thái đang tập luyện dở dang
  const isWorkoutActive = phase === 'breathing' || phase === 'retention' || phase === 'recovery';

  useEffect(() => {
    onWorkoutStateChange?.(isWorkoutActive);
  }, [isWorkoutActive, onWorkoutStateChange]);

  useEffect(() => {
    setActiveSpeed(currentRoundConfig.speed || 'normal');
  }, [currentRoundIndex, plan]);

  // Refs quản lý timers
  const breathTimerRef = useRef(null);
  const retentionTimerRef = useRef(null);
  const recoveryTimerRef = useRef(null);
  const retentionStartTimestamp = useRef(null);

  // Screen Wake Lock
  useEffect(() => {
    if (isWorkoutActive) {
      requestWakeLock();
    } else {
      releaseWakeLock();
      stopAlphaDrone();
    }
    return () => {
      releaseWakeLock();
      stopAlphaDrone();
    };
  }, [isWorkoutActive]);

  useEffect(() => {
    return () => {
      clearAllTimers();
      stopAlphaDrone();
    };
  }, []);

  const clearAllTimers = () => {
    if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
    if (retentionTimerRef.current) clearInterval(retentionTimerRef.current);
    if (recoveryTimerRef.current) clearInterval(recoveryTimerRef.current);
  };

  // ==================== 1. BẮT ĐẦU BUỔI THỞ ====================
  const startSession = () => {
    triggerHapticMedium();
    clearAllTimers();
    setPhase('breathing');
    setBreathCount(1);
    setBreathState('inhale');
    scheduleBreathCycle(1, 'inhale');
  };

  // ==================== 2. CHU KỲ HÍT VÀO - THỞ RA ====================
  const scheduleBreathCycle = (count, state) => {
    clearAllTimers();

    if (state === 'inhale') {
      if (settings.soundEnabled) playInhaleSound(timings.inhale, settings.soundVolume);
      if (settings.hapticsEnabled) triggerBreathPeakHaptic();

      breathTimerRef.current = setTimeout(() => {
        setBreathState('exhale');
        scheduleBreathCycle(count, 'exhale');
      }, timings.inhale * 1000);
    } else {
      if (settings.soundEnabled) playExhaleSound(timings.exhale, settings.soundVolume);
      if (settings.hapticsEnabled) triggerBreathPeakHaptic();

      breathTimerRef.current = setTimeout(() => {
        if (count >= targetBreaths) {
          startRetentionPhase();
        } else {
          const nextCount = count + 1;
          setBreathCount(nextCount);
          setBreathState('inhale');
          scheduleBreathCycle(nextCount, 'inhale');
        }
      }, timings.exhale * 1000);
    }
  };

  // ==================== 3. GIAI ĐOẠN NÍN THỞ ====================
  const startRetentionPhase = () => {
    clearAllTimers();
    setPhase('retention');
    setRetentionSeconds(0);
    setMilestoneCelebrated(false);

    if (settings.soundEnabled) playTibetanBowl(settings.soundVolume);
    if (settings.hapticsEnabled) triggerSingingBowlHaptic();

    if (settings.ambientDroneEnabled) {
      startAlphaDrone(0.18);
    }

    retentionStartTimestamp.current = Date.now();

    retentionTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - retentionStartTimestamp.current) / 1000);
      setRetentionSeconds(elapsed);

      if (elapsed >= targetRetention && !milestoneCelebrated) {
        setMilestoneCelebrated(true);
        if (settings.soundEnabled) playMilestoneChime(settings.soundVolume);
        if (settings.hapticsEnabled) triggerMilestoneHaptic();
      }
    }, 250);
  };

  // ==================== 4. PHỤC HỒI 15 GIÂY ====================
  const endRetentionAndStartRecovery = () => {
    clearAllTimers();
    stopAlphaDrone();
    triggerHapticMedium();

    const currentHoldTime = retentionSeconds;
    const newResult = {
      roundNumber: currentRoundIndex + 1,
      breaths: breathCount,
      retentionSeconds: currentHoldTime,
      targetRetention
    };
    const updatedResults = [...roundResults, newResult];
    setRoundResults(updatedResults);

    setPhase('recovery');
    setRecoveryTimeLeft(15);

    if (settings.soundEnabled) playInhaleSound(1.6, settings.soundVolume);

    let timeLeft = 15;
    recoveryTimerRef.current = setInterval(() => {
      timeLeft -= 1;
      setRecoveryTimeLeft(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(recoveryTimerRef.current);
        handleRecoveryCompleted(updatedResults);
      }
    }, 1000);
  };

  // ==================== 5. HOÀN THÀNH HIỆP ====================
  const handleRecoveryCompleted = (resultsSoFar) => {
    clearAllTimers();
    if (settings.soundEnabled) playRecoveryEndChime(settings.soundVolume);
    if (settings.hapticsEnabled) triggerRecoveryEndHaptic();

    const isLastRound = currentRoundIndex >= rounds.length - 1;

    if (isLastRound) {
      setPhase('completed');
      
      const totalHold = resultsSoFar.reduce((acc, r) => acc + r.retentionSeconds, 0);
      const maxHold = Math.max(...resultsSoFar.map(r => r.retentionSeconds), 0);

      const summary = {
        planName: plan.name,
        planId: plan.id,
        roundsCompleted: resultsSoFar.length,
        roundDetails: resultsSoFar,
        totalRetentionSeconds: totalHold,
        maxRetentionSeconds: maxHold
      };

      setCompletedSummary(summary);
      saveSessionHistory(summary);
      onSessionCompleted?.(summary);
    } else {
      setPhase('round_rest');
    }
  };

  const proceedToNextRound = () => {
    triggerHapticLight();
    const nextIdx = currentRoundIndex + 1;
    setCurrentRoundIndex(nextIdx);
    setPhase('breathing');
    setBreathCount(1);
    setBreathState('inhale');
    scheduleBreathCycle(1, 'inhale');
  };

  const resetSession = () => {
    triggerHapticLight();
    clearAllTimers();
    stopAlphaDrone();
    setPhase('idle');
    setCurrentRoundIndex(0);
    setBreathCount(0);
    setRetentionSeconds(0);
    setRoundResults([]);
    setCompletedSummary(null);
  };

  const formatSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-between w-full h-full max-w-md mx-auto px-4 py-3 select-none">
      
      {/* 1. THANH CHỈ BÁO GIÁO ÁN & HIỆP */}
      <div className="w-full flex items-center justify-between">
        <button
          onClick={() => { triggerHapticLight(); onOpenPlans?.(); }}
          disabled={isWorkoutActive}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border transition-all ${
            isWorkoutActive
              ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-white/5 border-transparent text-slate-400'
              : 'bg-white dark:bg-cyan-950/40 border-slate-200 dark:border-cyan-500/20 text-slate-800 dark:text-cyan-300 shadow-sm active:scale-95'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
          <span className="text-xs font-bold truncate max-w-[140px]">{plan.name}</span>
          <ChevronRight className="w-3 h-3 text-slate-400 dark:text-cyan-400/60" />
        </button>

        {/* Chỉ báo hiệp */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono font-bold text-slate-800 dark:text-white shadow-sm">
          <span className="text-cyan-600 dark:text-cyan-400">Hiệp {currentRoundIndex + 1}</span>
          <span className="text-slate-400">/</span>
          <span>{rounds.length}</span>
        </div>
      </div>

      {/* 2. CHỌN TỐC ĐỘ THỞ (KHI Ở TRẠNG THÁI IDLE) */}
      {phase === 'idle' && (
        <div className="w-full flex items-center justify-center gap-1.5 pt-1">
          <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 shadow-sm">
            {Object.keys(SPEED_TIMINGS).map((mode) => (
              <button
                key={mode}
                onClick={() => { triggerHapticLight(); setActiveSpeed(mode); }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeSpeed === mode
                    ? 'bg-cyan-500 text-white dark:text-black shadow-sm dark:shadow-ice-glow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {SPEED_TIMINGS[mode].label} ({SPEED_TIMINGS[mode].total}s)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. VÙNG TRUNG TÂM: QUẢ CẦU THỞ HOẶC KẾT QUẢ */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
        {phase === 'completed' && completedSummary ? (
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#080d14] border border-slate-200 dark:border-cyan-500/30 shadow-xl dark:shadow-ice-glow text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-white dark:text-black shadow-md">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hoàn Thành Xuất Sắc!</h3>
              <p className="text-xs text-slate-500 dark:text-cyan-300/70">Cơ thể bạn vừa được nạp tràn đầy oxy và sinh lực</p>
            </div>

            <div className="space-y-2 text-left bg-slate-50 dark:bg-black/40 p-3.5 rounded-2xl border border-slate-200 dark:border-white/5">
              <span className="block text-[11px] font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                Chi Tiết Nín Thở Từng Hiệp:
              </span>
              {completedSummary.roundDetails.map((r) => (
                <div key={r.roundNumber} className="flex justify-between items-center text-xs font-mono py-1 border-b border-slate-200 dark:border-white/5 last:border-0">
                  <span className="text-slate-700 dark:text-slate-300">Hiệp {r.roundNumber} ({r.breaths} nhịp)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-600 dark:text-cyan-300">{formatSeconds(r.retentionSeconds)}</span>
                    <span className="text-[10px] text-slate-400">(Mục tiêu: {formatSeconds(r.targetRetention)})</span>
                    {r.retentionSeconds >= r.targetRetention && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={resetSession}
              className="w-full py-3.5 rounded-2xl bg-cyan-500 text-white dark:text-black font-bold text-sm tracking-wide shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
            >
              Hoàn Thành Buổi Tập
            </button>
          </div>
        ) : phase === 'round_rest' ? (
          <div className="w-full max-w-sm p-6 rounded-3xl bg-white dark:bg-[#080d14] border border-slate-200 dark:border-cyan-500/20 shadow-xl text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hiệp {currentRoundIndex + 1} Hoàn Thành!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thời gian nín thở: <span className="font-mono text-cyan-600 dark:text-cyan-300 font-bold">{formatSeconds(roundResults[roundResults.length - 1]?.retentionSeconds || 0)}</span>
              </p>
            </div>
            <p className="text-xs text-slate-500 dark:text-cyan-300/70 italic">Thả lỏng cơ thể trước khi bắt đầu hiệp tiếp theo.</p>
            <button
              onClick={proceedToNextRound}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white dark:text-black font-bold text-sm tracking-wide shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Vào Hiệp {currentRoundIndex + 2}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <BreathingBubble
            phase={phase}
            breathState={breathState}
            breathCount={breathCount}
            targetBreaths={targetBreaths}
            duration={breathState === 'inhale' ? timings.inhale : timings.exhale}
            retentionSeconds={retentionSeconds}
            targetRetention={targetRetention}
            recoveryTimeLeft={recoveryTimeLeft}
            onClick={() => {
              if (phase === 'idle') startSession();
            }}
          />
        )}
      </div>

      {/* 4. KHU VỰC ĐIỀU KHIỂN DƯỚI CÙNG (ERGONOMIC BUTTONS) */}
      <div className="w-full pb-20 space-y-2">
        {phase === 'idle' && (
          <button
            onClick={startSession}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 text-white dark:text-black font-extrabold text-base tracking-wider uppercase shadow-lg dark:shadow-ice-glow hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Bắt Đầu Luyện Thở</span>
          </button>
        )}

        {phase === 'breathing' && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerHapticLight();
                startRetentionPhase();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-300 dark:border-cyan-400/40 text-cyan-800 dark:text-cyan-200 font-bold text-sm hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <FastForward className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Đã Đủ Oxy • Nín Thở Ngay</span>
            </button>
            <button
              onClick={resetSession}
              className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-red-500 active:scale-95 transition-all shadow-sm"
              title="Dừng & Làm lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {phase === 'retention' && (
          <div className="space-y-2">
            <button
              onClick={endRetentionAndStartRecovery}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-white dark:text-black font-extrabold text-base tracking-wider uppercase shadow-xl dark:shadow-ice-glow-lg hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>HẾT KHẢ NĂNG • HÍT VÀO</span>
            </button>
            <div className="text-center text-[11px] text-slate-500 dark:text-cyan-300/60 font-mono">
              Thả lỏng tâm trí • Lắng nghe nhịp tim & cơ thể
            </div>
          </div>
        )}

        {phase === 'recovery' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/30 text-center text-xs text-amber-800 dark:text-amber-200 font-bold animate-pulse">
            Giữ hơi thở căng đầy lồng ngực trong 15 giây...
          </div>
        )}
      </div>

    </div>
  );
};

export default Timer;

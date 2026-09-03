import React, { useState, useEffect, useRef } from 'react';
import BreathingBubble from './BreathingBubble';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  ChevronRight, 
  Award, 
  Flame, 
  Layers, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
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
  slow: { inhale: 2.0, exhale: 2.0 },     // 4.0s tổng
  normal: { inhale: 1.3, exhale: 1.2 },   // 2.5s tổng
  fast: { inhale: 1.0, exhale: 0.8 }      // 1.8s tổng
};

const WimHofTimer = ({ plan, onOpenPlanManager, onSessionCompleted }) => {
  // Trạng thái buổi tập
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'breathing' | 'retention' | 'recovery' | 'round_rest' | 'completed'
  const [breathCount, setBreathCount] = useState(0);
  const [breathState, setBreathState] = useState('inhale'); // 'inhale' | 'exhale'
  const [retentionSeconds, setRetentionSeconds] = useState(0);
  const [recoveryTimeLeft, setRecoveryTimeLeft] = useState(15);
  
  // Dữ liệu kết quả buổi tập
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

  const targetBreaths = currentRoundConfig.breaths || 30;
  const speedMode = currentRoundConfig.speed || 'normal';
  const targetRetention = currentRoundConfig.targetRetention || 60;
  const timings = SPEED_TIMINGS[speedMode] || SPEED_TIMINGS.normal;

  // Refs quản lý timers
  const breathTimerRef = useRef(null);
  const retentionTimerRef = useRef(null);
  const recoveryTimerRef = useRef(null);
  const retentionStartTimestamp = useRef(null);

  // Wake Lock theo dõi khi đang hoạt động
  useEffect(() => {
    if (phase !== 'idle' && phase !== 'completed') {
      requestWakeLock();
    } else {
      releaseWakeLock();
      stopAlphaDrone();
    }
    return () => {
      releaseWakeLock();
      stopAlphaDrone();
    };
  }, [phase]);

  // Dọn dẹp timers khi unmount
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

  // ==================== 1. BẮT ĐẦU BUỔI TẬP HOẶC HIỆP TIẾP THEO ====================
  const startSession = () => {
    triggerHapticMedium();
    clearAllTimers();
    setPhase('breathing');
    setBreathCount(1);
    setBreathState('inhale');
    scheduleBreathCycle(1, 'inhale');
  };

  // ==================== 2. CHU KỲ HÍT VÀO - THỞ RA (HYPERVENTILATION) ====================
  const scheduleBreathCycle = (count, state) => {
    clearAllTimers();

    if (state === 'inhale') {
      // Âm thanh và rung khi bắt đầu hít vào
      if (settings.soundEnabled) playInhaleSound(timings.inhale, settings.soundVolume);
      if (settings.hapticsEnabled) triggerBreathPeakHaptic();

      breathTimerRef.current = setTimeout(() => {
        setBreathState('exhale');
        scheduleBreathCycle(count, 'exhale');
      }, timings.inhale * 1000);
    } else {
      // Âm thanh và rung khi thở ra
      if (settings.soundEnabled) playExhaleSound(timings.exhale, settings.soundVolume);
      if (settings.hapticsEnabled) triggerBreathPeakHaptic();

      breathTimerRef.current = setTimeout(() => {
        if (count >= targetBreaths) {
          // Hoàn thành đủ số nhịp thở -> Chuyển sang Nín Thở
          startRetentionPhase();
        } else {
          // Tiếp tục nhịp tiếp theo
          const nextCount = count + 1;
          setBreathCount(nextCount);
          setBreathState('inhale');
          scheduleBreathCycle(nextCount, 'inhale');
        }
      }, timings.exhale * 1000);
    }
  };

  // ==================== 3. GIAI ĐOẠN NÍN THỞ (RETENTION PHASE) ====================
  const startRetentionPhase = () => {
    clearAllTimers();
    setPhase('retention');
    setRetentionSeconds(0);
    setMilestoneCelebrated(false);

    // Phát chuông Tây Tạng ngân vang và rung thiền sâu
    if (settings.soundEnabled) playTibetanBowl(settings.soundVolume);
    if (settings.hapticsEnabled) triggerSingingBowlHaptic();

    // Bật sóng nền Alpha Drone nếu được kích hoạt
    if (settings.ambientDroneEnabled) {
      startAlphaDrone(0.18);
    }

    retentionStartTimestamp.current = Date.now();

    retentionTimerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - retentionStartTimestamp.current) / 1000);
      setRetentionSeconds(elapsed);

      // Kiểm tra đạt mốc mục tiêu của giáo án
      if (elapsed >= targetRetention && !milestoneCelebrated) {
        setMilestoneCelebrated(true);
        if (settings.soundEnabled) playMilestoneChime(settings.soundVolume);
        if (settings.hapticsEnabled) triggerMilestoneHaptic();
      }
    }, 250);
  };

  // ==================== 4. KẾT THÚC NÍN THỞ -> PHỤC HỒI 15S (RECOVERY PHASE) ====================
  const endRetentionAndStartRecovery = () => {
    clearAllTimers();
    stopAlphaDrone();
    triggerHapticMedium();

    const currentHoldTime = retentionSeconds;
    
    // Lưu kết quả của hiệp hiện tại
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

    // Âm thanh nhắc nhở hít vào đầy phổi
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

  // ==================== 5. HOÀN THÀNH 15S PHỤC HỒI ====================
  const handleRecoveryCompleted = (resultsSoFar) => {
    clearAllTimers();
    if (settings.soundEnabled) playRecoveryEndChime(settings.soundVolume);
    if (settings.hapticsEnabled) triggerRecoveryEndHaptic();

    const isLastRound = currentRoundIndex >= rounds.length - 1;

    if (isLastRound) {
      // Đã hoàn thành toàn bộ các hiệp trong giáo án
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
      // Chuyển sang hiệp tiếp theo
      setPhase('round_rest');
    }
  };

  // Bắt đầu hiệp tiếp theo
  const proceedToNextRound = () => {
    triggerHapticLight();
    const nextIdx = currentRoundIndex + 1;
    setCurrentRoundIndex(nextIdx);
    setPhase('breathing');
    setBreathCount(1);
    setBreathState('inhale');
    scheduleBreathCycle(1, 'inhale');
  };

  // Đặt lại buổi tập
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
    <div className="flex flex-col items-center justify-between w-full h-full max-w-md mx-auto px-4 py-2 select-none">
      
      {/* 1. THANH CHỈ BÁO GIÁO ÁN & TIẾN ĐỘ HIỆP */}
      <div className="w-full flex items-center justify-between pt-2 pb-1">
        <button
          onClick={() => { triggerHapticLight(); onOpenPlanManager?.(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/20 text-xs font-semibold text-cyan-300 hover:bg-cyan-900/40 active:scale-95 transition-all"
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate max-w-[130px]">{plan.name}</span>
          <ChevronRight className="w-3 h-3 text-cyan-400/60" />
        </button>

        {/* Chỉ báo hiệp (Ví dụ: Hiệp 2 / 3) */}
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-white">
          <span className="text-cyan-400">Hiệp {currentRoundIndex + 1}</span>
          <span className="text-slate-500">/</span>
          <span>{rounds.length}</span>
        </div>
      </div>

      {/* 2. KHU VỰC TRUNG TÂM: QUẢ CẦU THỞ & ĐỒNG HỒ */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto py-2">
        
        {/* Trường hợp: Đã hoàn thành toàn bộ buổi tập */}
        {phase === 'completed' && completedSummary ? (
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#080d14] border border-cyan-500/30 shadow-ice-glow text-center space-y-5 animate-fade-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-black shadow-ice-glow">
              <Sparkles className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Hoàn Thành Xuất Sắc!</h3>
              <p className="text-xs text-cyan-300/70">Bạn vừa nạp tràn ngập sinh khí và oxy cho cơ thể</p>
            </div>

            {/* Thống kê từng hiệp */}
            <div className="space-y-2 text-left bg-black/40 p-3.5 rounded-2xl border border-white/5">
              <span className="block text-[11px] font-semibold text-cyan-400 uppercase tracking-wider mb-1">
                Chi Tiết Nín Thở Từng Hiệp:
              </span>
              {completedSummary.roundDetails.map((r) => (
                <div key={r.roundNumber} className="flex justify-between items-center text-xs font-mono py-1 border-b border-white/5 last:border-0">
                  <span className="text-slate-300">Hiệp {r.roundNumber} ({r.breaths} nhịp)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300">{formatSeconds(r.retentionSeconds)}</span>
                    <span className="text-[10px] text-slate-500">(Mục tiêu: {formatSeconds(r.targetRetention)})</span>
                    {r.retentionSeconds >= r.targetRetention && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <button
                onClick={resetSession}
                className="w-full py-3.5 rounded-2xl bg-cyan-400 text-black font-bold text-sm tracking-wide shadow-ice-glow hover:brightness-110 active:scale-[0.98] transition-all"
              >
                Hoàn Thành Buổi Tập
              </button>
            </div>
          </div>
        ) : phase === 'round_rest' ? (
          /* Nghỉ giữa 2 hiệp */
          <div className="w-full max-w-sm p-6 rounded-3xl bg-[#080d14] border border-cyan-500/20 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Hiệp {currentRoundIndex + 1} Hoàn Thành!</h3>
              <p className="text-xs text-slate-400">Thời gian nín thở: <span className="font-mono text-cyan-300 font-bold">{formatSeconds(roundResults[roundResults.length - 1]?.retentionSeconds || 0)}</span></p>
            </div>
            <p className="text-xs text-cyan-300/70 italic">Thả lỏng cơ thể, uống một ngụm nước ấm nếu cần trước khi sang hiệp tiếp theo.</p>
            <button
              onClick={proceedToNextRound}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-bold text-sm tracking-wide shadow-ice-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>Vào Hiệp {currentRoundIndex + 2}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Quả Cầu Thở Tương Tác Chính */
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

      {/* 3. KHU VỰC ĐIỀU KHIỂN DƯỚI CÙNG (ERGONOMIC CONTROLS) */}
      <div className="w-full pb-3 space-y-2">
        {phase === 'idle' && (
          <button
            onClick={startSession}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-400 text-black font-bold text-base tracking-wider uppercase shadow-ice-glow hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Bắt Đầu Buổi Thở</span>
          </button>
        )}

        {phase === 'breathing' && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                triggerHapticLight();
                startRetentionPhase();
              }}
              className="flex-1 py-3.5 rounded-2xl bg-cyan-950/70 border border-cyan-400/40 text-cyan-200 font-semibold text-sm hover:bg-cyan-900/60 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <FastForward className="w-4 h-4 text-cyan-400" />
              <span>Đã Đủ Oxy • Nín Thở Ngay</span>
            </button>
            <button
              onClick={resetSession}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white active:scale-95 transition-all"
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
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-black font-extrabold text-base tracking-wider uppercase shadow-ice-glow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>HẾT KHẢ NĂNG • HÍT VÀO</span>
            </button>
            <div className="text-center text-[11px] text-cyan-300/60 font-mono">
              Thả lỏng tâm trí • Lắng nghe nhịp tim & cơ thể
            </div>
          </div>
        )}

        {phase === 'recovery' && (
          <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-center text-xs text-amber-200 font-semibold animate-pulse">
            Giữ hơi thở căng đầy lồng ngực trong 15 giây...
          </div>
        )}
      </div>

    </div>
  );
};

export default WimHofTimer;

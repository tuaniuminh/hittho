import React from 'react';

/**
 * Quả Cầu Thở Hữu Cơ Đa Lớp (Zen Organic Breathing Bubble)
 * Tương thích hoàn hảo cả Giao diện Sáng (Light Mode) và Tối (Dark OLED Mode).
 */
const BreathingBubble = ({
  phase = 'idle', // 'idle' | 'breathing' | 'retention' | 'recovery' | 'completed'
  breathState = 'inhale', // 'inhale' | 'exhale'
  breathCount = 0,
  targetBreaths = 30,
  duration = 1.3,
  retentionSeconds = 0,
  targetRetention = 60,
  recoveryTimeLeft = 15,
  onClick
}) => {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const retentionProgress = targetRetention > 0 
    ? Math.min(100, Math.round((retentionSeconds / targetRetention) * 100))
    : 0;

  const isMilestoneReached = retentionSeconds >= targetRetention;

  return (
    <div 
      onClick={onClick}
      className="relative flex items-center justify-center w-72 h-72 sm:w-84 sm:h-84 cursor-pointer select-none"
    >
      {/* 1. HÀO QUANG NỀN (AMBIENT OUTER AURA) */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale' 
              ? 'bg-cyan-500/25 dark:bg-cyan-500/30 scale-125 opacity-90' 
              : 'bg-teal-600/10 dark:bg-teal-600/15 scale-90 opacity-40'
            : phase === 'retention'
              ? isMilestoneReached
                ? 'bg-emerald-500/30 dark:bg-emerald-500/35 scale-110 opacity-80 animate-pulse-glow'
                : 'bg-cyan-600/15 dark:bg-cyan-600/20 scale-100 opacity-60'
            : phase === 'recovery'
              ? 'bg-amber-500/30 dark:bg-amber-500/35 scale-125 opacity-90 animate-pulse-glow'
              : 'bg-cyan-500/15 dark:bg-cyan-500/15 scale-95 opacity-50'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '1.2s',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* 2. VÒNG CHỈ BÁO TIẾN TRÌNH SVG */}
      <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
        {/* Vòng nền mờ */}
        <circle
          cx="100"
          cy="100"
          r="90"
          className="stroke-slate-200 dark:stroke-white/10 fill-none"
          strokeWidth="3.5"
        />

        {/* Vòng tiến trình thở (30 nhịp) */}
        {phase === 'breathing' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            className="stroke-cyan-500 dark:stroke-cyan-400 fill-none transition-all duration-300"
            strokeWidth="4.5"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 - (565.48 * (breathCount / targetBreaths))}
            strokeLinecap="round"
          />
        )}

        {/* Vòng tiến trình nín thở theo mục tiêu giáo án */}
        {phase === 'retention' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            className={`fill-none transition-all duration-500 ${
              isMilestoneReached ? 'stroke-emerald-500 dark:stroke-emerald-400' : 'stroke-cyan-500 dark:stroke-cyan-400'
            }`}
            strokeWidth="4.5"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 - (565.48 * (retentionProgress / 100))}
            strokeLinecap="round"
          />
        )}

        {/* Vòng tiến trình 15s phục hồi */}
        {phase === 'recovery' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            className="stroke-amber-500 dark:stroke-amber-400 fill-none transition-all duration-1000 ease-linear"
            strokeWidth="5"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 * ((15 - recoveryTimeLeft) / 15)}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* 3. LỚP VỎ NGOÀI QUẢ CẦU (MIDDLE GLASS SPHERE) */}
      <div 
        className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale'
              ? 'scale-110 border-cyan-400/50 dark:border-cyan-400/40 bg-cyan-50/80 dark:bg-cyan-950/40 shadow-lg dark:shadow-ice-glow'
              : 'scale-75 border-slate-200 dark:border-cyan-700/20 bg-white/60 dark:bg-cyan-950/20 shadow-none'
            : phase === 'retention'
              ? isMilestoneReached
                ? 'scale-100 border-emerald-400/60 dark:border-emerald-400/50 bg-emerald-50/80 dark:bg-emerald-950/30 shadow-md dark:shadow-teal-glow'
                : 'scale-95 border-cyan-300 dark:border-cyan-500/30 bg-white/70 dark:bg-slate-950/50 shadow-md'
            : phase === 'recovery'
              ? 'scale-110 border-amber-400/60 dark:border-amber-400/50 bg-amber-50/80 dark:bg-amber-950/40 shadow-lg dark:shadow-amber-glow'
              : 'scale-90 border-slate-200 dark:border-cyan-500/25 bg-white/60 dark:bg-cyan-950/30 shadow-sm'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '1.0s',
          transitionTimingFunction: phase === 'breathing' 
            ? 'cubic-bezier(0.35, 0, 0.25, 1)' 
            : 'ease-out'
        }}
      />

      {/* 4. LÕI PHÁT SÁNG TRUNG TÂM (GLOWING INNER CORE) */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center w-48 h-48 sm:w-54 sm:h-54 rounded-full backdrop-blur-md shadow-inner transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale'
              ? 'scale-105 bg-gradient-to-tr from-cyan-100 via-teal-50 to-white dark:from-cyan-900/60 dark:via-teal-800/40 dark:to-cyan-500/30 text-slate-900 dark:text-white'
              : 'scale-85 bg-gradient-to-tr from-white to-slate-100 dark:from-slate-950/80 dark:via-cyan-950/30 dark:to-slate-900/60 text-slate-700 dark:text-cyan-200/70'
            : phase === 'retention'
              ? 'scale-100 bg-gradient-to-b from-white to-cyan-50 dark:from-slate-900/90 dark:to-cyan-950/80 text-slate-900 dark:text-white'
              : phase === 'recovery'
                ? 'scale-105 bg-gradient-to-b from-amber-100 via-yellow-50 to-white dark:from-amber-950/80 dark:via-yellow-950/60 dark:to-amber-900/50 text-amber-900 dark:text-amber-100'
                : 'scale-95 bg-white dark:bg-slate-900/80 text-slate-800 dark:text-cyan-100'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '0.8s',
          transitionTimingFunction: 'cubic-bezier(0.35, 0, 0.25, 1)'
        }}
      >
        {/* NỘI DUNG THEO TỪNG PHA */}

        {/* Pha 1: Nhịp Thở Sâu */}
        {phase === 'breathing' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-xs font-bold tracking-widest uppercase transition-colors text-cyan-700 dark:text-cyan-300/90">
              {breathState === 'inhale' ? 'HÍT VÀO' : 'THỞ LỎNG'}
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              {breathCount}
              <span className="text-xl font-normal text-slate-400 dark:text-cyan-300/60 ml-1">/{targetBreaths}</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-cyan-200/60 tracking-wider">
              {breathState === 'inhale' ? 'Căng đầy lồng ngực' : 'Thả trôi tự nhiên'}
            </span>
          </div>
        )}

        {/* Pha 2: Nín Thở (Retention Phase) */}
        {phase === 'retention' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-[11px] font-bold tracking-widest uppercase text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
              NÍN THỞ TĨNH LẶNG
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white drop-shadow-sm">
              {formatTime(retentionSeconds)}
            </div>
            <div className="text-[11px] font-mono text-slate-500 dark:text-cyan-300/70">
              Mục tiêu: {formatTime(targetRetention)}
              {isMilestoneReached && (
                <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-bold">✓ Đạt mốc</span>
              )}
            </div>
          </div>
        )}

        {/* Pha 3: Phục Hồi 15s */}
        {phase === 'recovery' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-[11px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              HÍT CĂNG & GIỮ
            </span>
            <div className="font-mono text-5xl font-extrabold text-amber-600 dark:text-amber-200 drop-shadow-sm">
              {recoveryTimeLeft}s
            </div>
            <span className="text-[11px] text-amber-700 dark:text-amber-300/80 tracking-wide font-medium">
              Đầy phổi & giữ lại
            </span>
          </div>
        )}

        {/* Chờ bắt đầu */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
            <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-300">
              <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-sm font-bold tracking-wider text-slate-900 dark:text-cyan-100">
              CHẠM ĐỂ BẮT ĐẦU
            </span>
            <span className="text-[11px] text-slate-500 dark:text-cyan-300/60">
              Thư giãn & lắng nghe cơ thể
            </span>
          </div>
        )}

        {/* Hoàn thành */}
        {phase === 'completed' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-bold text-cyan-700 dark:text-cyan-200">HOÀN THÀNH</span>
            <span className="text-[11px] text-slate-500 dark:text-cyan-400/80">Buổi thở tuyệt vời!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingBubble;

import React from 'react';

/**
 * Quả Cầu Thở Hữu Cơ Đa Lớp (Zen Organic Breathing Bubble)
 * Co giãn và chuyển sắc mượt mà theo từng pha thở của phương pháp Wim Hof.
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
  // Định dạng hiển thị phút:giây
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tính % hoàn thành nín thở so với mục tiêu giáo án
  const retentionProgress = targetRetention > 0 
    ? Math.min(100, Math.round((retentionSeconds / targetRetention) * 100))
    : 0;

  const isMilestoneReached = retentionSeconds >= targetRetention;

  return (
    <div 
      onClick={onClick}
      className="relative flex items-center justify-center w-72 h-72 sm:w-84 sm:h-84 cursor-pointer select-none"
    >
      {/* 1. Vòng Hào Quang Tỏa Sáng Nền (Ambient Outer Aura) */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale' 
              ? 'bg-cyan-500/30 scale-125 opacity-90' 
              : 'bg-teal-600/15 scale-90 opacity-40'
            : phase === 'retention'
              ? isMilestoneReached
                ? 'bg-emerald-500/35 scale-110 opacity-80 animate-pulse-glow'
                : 'bg-cyan-600/20 scale-100 opacity-60'
            : phase === 'recovery'
              ? 'bg-amber-500/35 scale-125 opacity-90 animate-pulse-glow'
              : 'bg-cyan-500/15 scale-95 opacity-50'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '1.2s',
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* 2. Vòng Chỉ Báo Tiến Trình SVG (Circular Progress Ring) */}
      <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
        {/* Vòng nền mờ */}
        <circle
          cx="100"
          cy="100"
          r="90"
          className="stroke-white/5 fill-none"
          strokeWidth="3"
        />

        {/* Vòng tiến trình giai đoạn thở (30 nhịp) */}
        {phase === 'breathing' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            className="stroke-cyan-400 fill-none transition-all duration-300"
            strokeWidth="4"
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
              isMilestoneReached ? 'stroke-emerald-400' : 'stroke-cyan-400'
            }`}
            strokeWidth="4"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 - (565.48 * (retentionProgress / 100))}
            strokeLinecap="round"
          />
        )}

        {/* Vòng tiến trình đếm ngược 15s phục hồi */}
        {phase === 'recovery' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            className="stroke-amber-400 fill-none transition-all duration-1000 ease-linear"
            strokeWidth="5"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 * ((15 - recoveryTimeLeft) / 15)}
            strokeLinecap="round"
          />
        )}
      </svg>

      {/* 3. Lớp Vỏ Ngoài Quả Cầu Thở (Middle Glass Sphere) */}
      <div 
        className={`absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale'
              ? 'scale-110 border-cyan-400/40 bg-cyan-950/40 shadow-ice-glow'
              : 'scale-75 border-cyan-700/20 bg-cyan-950/20 shadow-none'
            : phase === 'retention'
              ? isMilestoneReached
                ? 'scale-100 border-emerald-400/50 bg-emerald-950/30 shadow-teal-glow'
                : 'scale-95 border-cyan-500/30 bg-slate-950/50 shadow-card-glow'
            : phase === 'recovery'
              ? 'scale-110 border-amber-400/50 bg-amber-950/40 shadow-amber-glow'
              : 'scale-90 border-cyan-500/25 bg-cyan-950/30'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '1.0s',
          transitionTimingFunction: phase === 'breathing' 
            ? 'cubic-bezier(0.35, 0, 0.25, 1)' 
            : 'ease-out'
        }}
      />

      {/* 4. Lõi Phát Sáng Trung Tâm (Glowing Inner Core) */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center w-48 h-48 sm:w-54 sm:h-54 rounded-full backdrop-blur-md transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale'
              ? 'scale-105 bg-gradient-to-tr from-cyan-900/60 via-teal-800/40 to-cyan-500/30 text-white'
              : 'scale-85 bg-gradient-to-tr from-slate-950/80 via-cyan-950/30 to-slate-900/60 text-cyan-200/70'
            : phase === 'retention'
              ? 'scale-100 bg-gradient-to-b from-slate-900/90 to-cyan-950/80 text-white'
              : phase === 'recovery'
                ? 'scale-105 bg-gradient-to-b from-amber-950/80 via-yellow-950/60 to-amber-900/50 text-amber-100'
                : 'scale-95 bg-slate-900/80 text-cyan-100'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '0.8s',
          transitionTimingFunction: 'cubic-bezier(0.35, 0, 0.25, 1)'
        }}
      >
        {/* NỘI DUNG HIỂN THỊ THEO TỪNG PHA */}

        {/* Pha 1: Nhịp Thở Sâu */}
        {phase === 'breathing' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-xs font-semibold tracking-widest uppercase transition-colors text-cyan-300/80">
              {breathState === 'inhale' ? 'HÍT VÀO' : 'THỞ LỎNG'}
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-md">
              {breathCount}
              <span className="text-xl font-normal text-cyan-300/60 ml-1">/{targetBreaths}</span>
            </div>
            <span className="text-[11px] text-cyan-200/60 tracking-wider">
              {breathState === 'inhale' ? 'Căng đầy lồng ngực' : 'Thả trôi tự nhiên'}
            </span>
          </div>
        )}

        {/* Pha 2: Nín Thở Sau Khi Thở Ra (Retention Phase) */}
        {phase === 'retention' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-cyan-400/90 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              NÍN THỞ TĨNH LẶNG
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
              {formatTime(retentionSeconds)}
            </div>
            <div className="text-[11px] font-mono text-cyan-300/70">
              Mục tiêu: {formatTime(targetRetention)}
              {isMilestoneReached && (
                <span className="ml-1 text-emerald-400 font-semibold">✓ Đạt mốc</span>
              )}
            </div>
          </div>
        )}

        {/* Pha 3: Nín Phục Hồi 15 Giây (Recovery Hold) */}
        {phase === 'recovery' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-amber-300 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              HÍT CĂNG & GIỮ
            </span>
            <div className="font-mono text-5xl font-bold text-amber-200 drop-shadow-lg">
              {recoveryTimeLeft}s
            </div>
            <span className="text-[11px] text-amber-300/80 tracking-wide">
              Đầy phổi & nín thở
            </span>
          </div>
        )}

        {/* Trạng thái Chờ / Chưa bắt đầu */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-300">
              <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-wider text-cyan-100">
              CHẠM ĐỂ BẮT ĐẦU
            </span>
            <span className="text-[11px] text-cyan-300/60">
              Thư giãn & lắng nghe cơ thể
            </span>
          </div>
        )}

        {/* Trạng thái Hoàn thành buổi tập */}
        {phase === 'completed' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <span className="text-2xl">✨</span>
            <span className="text-sm font-bold text-cyan-200">HOÀN THÀNH</span>
            <span className="text-[11px] text-cyan-400/80">Buổi thở tuyệt vời!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingBubble;

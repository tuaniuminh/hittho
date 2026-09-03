import React from 'react';
import { ArrowUp, ArrowDown, Sparkles } from 'lucide-react';

/**
 * Đồng Hồ Luyện Thở Đa Lớp & Quả Cầu Khí Huyết Wim Hof (Advanced Breath Flow Gauge)
 * Hiển thị chi tiết thời gian thực quá trình Hít vào (Bụng → Ngực → Đỉnh) và Thở lỏng tự nhiên.
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
      className="relative flex items-center justify-center w-76 h-76 sm:w-88 sm:h-88 cursor-pointer select-none"
    >
      {/* 1. HÀO QUANG NĂNG LƯỢNG NỀN (AMBIENT AURA) */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale' 
              ? 'bg-cyan-500/30 dark:bg-cyan-400/35 scale-125 opacity-90' 
              : 'bg-teal-600/10 dark:bg-teal-600/15 scale-85 opacity-40'
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

      {/* 2. HIỆU ỨNG SÓNG NĂNG LƯỢNG LAN TỎA KHI HÍT ĐẦY (RIPPLE WAVE) */}
      {phase === 'breathing' && breathState === 'inhale' && (
        <div 
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-cyan-400/40 pointer-events-none"
          style={{
            animation: `rippleWave ${duration}s ease-out infinite`
          }}
        />
      )}

      {/* 3. ĐỒNG HỒ KÉP SVG (DUAL CIRCULAR PRECISION GAUGES) */}
      <svg className="absolute w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
        
        {/* --- A. VÒNG NGOÀI (R = 90, Chu vi = 565.48px): TIẾN ĐỘ TỔNG THỂ HIỆP THỞ --- */}
        <circle
          cx="100"
          cy="100"
          r="90"
          className="stroke-slate-200/80 dark:stroke-white/10 fill-none"
          strokeWidth="3.5"
        />

        {/* Vòng ngoài chạy theo tổng số nhịp hiệp (VD: 24/30 nhịp) */}
        {phase === 'breathing' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            className="stroke-cyan-500/50 dark:stroke-cyan-500/40 fill-none transition-all duration-300"
            strokeWidth="3.5"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 - (565.48 * (breathCount / targetBreaths))}
            strokeLinecap="round"
          />
        )}

        {/* Vòng ngoài trong giai đoạn nín thở: đo tiến độ theo mốc mục tiêu */}
        {phase === 'retention' && (
          <circle
            cx="100"
            cy="100"
            r="90"
            className={`fill-none transition-all duration-500 ${
              isMilestoneReached ? 'stroke-emerald-500 dark:stroke-emerald-400' : 'stroke-cyan-500 dark:stroke-cyan-400'
            }`}
            strokeWidth="5"
            strokeDasharray={565.48}
            strokeDashoffset={565.48 - (565.48 * (retentionProgress / 100))}
            strokeLinecap="round"
          />
        )}

        {/* Vòng ngoài trong giai đoạn phục hồi 15s */}
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

        {/* --- B. VÒNG TRONG (R = 76, Chu vi = 477.52px): TIẾN ĐỘ THỜI GIAN THỰC TỪNG NHỊP HÍT/THỞ --- */}
        {phase === 'breathing' && (
          <>
            {/* Rãnh nền vòng trong */}
            <circle
              cx="100"
              cy="100"
              r="76"
              className="stroke-slate-200/50 dark:stroke-white/5 fill-none"
              strokeWidth="5.5"
            />

            {/* Vòng quét thời gian thực: quét đầy khi Hít vào, rút cạn khi Thở ra */}
            <circle
              key={`${breathCount}-${breathState}`}
              cx="100"
              cy="100"
              r="76"
              className={`fill-none ${
                breathState === 'inhale'
                  ? 'stroke-cyan-500 dark:stroke-cyan-300 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'stroke-teal-600/60 dark:stroke-teal-400/50'
              }`}
              strokeWidth="5.5"
              strokeDasharray="477.52"
              style={{
                animation: `${breathState === 'inhale' ? 'fillBreath' : 'drainBreath'} ${duration}s cubic-bezier(0.35, 0, 0.25, 1) forwards`
              }}
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {/* 4. LỚP VỎ NGOÀI QUẢ CẦU THỞ HỮU CƠ */}
      <div 
        className={`absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border transition-all ${
          phase === 'breathing'
            ? breathState === 'inhale'
              ? 'scale-110 border-cyan-400/60 dark:border-cyan-400/40 bg-cyan-50/80 dark:bg-cyan-950/40 shadow-xl dark:shadow-ice-glow'
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

      {/* 5. LÕI THỞ TRUNG TÂM & CHỈ BÁO CHI TIẾT 3 VÙNG DẪN KHÍ */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center w-46 h-46 sm:w-52 sm:h-52 rounded-full backdrop-blur-md shadow-inner transition-all px-2 ${
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
        {/* PHA 1: NHỊP THỞ SÂU KÈM HƯỚNG DẪN CHI TIẾT 3 VÙNG KHÍ */}
        {phase === 'breathing' && (
          <div className="flex flex-col items-center justify-center space-y-1.5 text-center w-full">
            
            {/* Mũi tên và Trạng thái thở */}
            <div className="flex items-center justify-center gap-1.5">
              {breathState === 'inhale' ? (
                <span className="flex items-center gap-1 text-[11px] font-black tracking-widest uppercase text-cyan-600 dark:text-cyan-300">
                  <ArrowUp className="w-3.5 h-3.5 stroke-[3] animate-bounce text-cyan-500" />
                  HÍT VÀO
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-black tracking-widest uppercase text-slate-500 dark:text-teal-300/80">
                  <ArrowDown className="w-3.5 h-3.5 stroke-[3] text-teal-500" />
                  THỞ LỎNG
                </span>
              )}
            </div>

            {/* Bộ đếm nhịp thở chính */}
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-none drop-shadow-sm">
              {breathCount}
              <span className="text-lg font-normal text-slate-400 dark:text-cyan-300/60 ml-1">/{targetBreaths}</span>
            </div>

            {/* CHI TIẾT 3 ĐIỂM CHẠM KHÍ WIM HOF (BỤNG -> NGỰC -> ĐẦU) */}
            {breathState === 'inhale' ? (
              <div className="pt-1 flex items-center justify-center gap-1.5 w-full">
                <span 
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30"
                  style={{ animation: `flowBelly ${duration}s ease-in-out infinite` }}
                >
                  Bụng
                </span>
                <span className="text-[10px] text-slate-400">→</span>
                <span 
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30"
                  style={{ animation: `flowChest ${duration}s ease-in-out infinite` }}
                >
                  Ngực
                </span>
                <span className="text-[10px] text-slate-400">→</span>
                <span 
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30"
                  style={{ animation: `flowHead ${duration}s ease-in-out infinite` }}
                >
                  Đỉnh
                </span>
              </div>
            ) : (
              <div className="pt-1 text-[10px] font-semibold text-slate-500 dark:text-cyan-200/70 tracking-wide italic">
                Thả trôi tự nhiên...
              </div>
            )}
          </div>
        )}

        {/* PHA 2: NÍN THỞ (RETENTION PHASE) */}
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

        {/* PHA 3: PHỤC HỒI 15S */}
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
              Đầy phổi & nín lại
            </span>
          </div>
        )}

        {/* CHỜ BẮT ĐẦU */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-center p-4">
            <div className="w-11 h-11 rounded-full bg-cyan-100 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shadow-sm">
              <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
            <span className="text-sm font-extrabold tracking-wider text-slate-900 dark:text-cyan-100">
              CHẠM ĐỂ BẮT ĐẦU
            </span>
            <span className="text-[11px] text-slate-500 dark:text-cyan-300/60">
              Thư giãn & lắng nghe cơ thể
            </span>
          </div>
        )}

        {/* HOÀN THÀNH */}
        {phase === 'completed' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center">
            <Sparkles className="w-8 h-8 text-cyan-500 animate-bounce" />
            <span className="text-sm font-bold text-cyan-700 dark:text-cyan-200">HOÀN THÀNH</span>
            <span className="text-[11px] text-slate-500 dark:text-cyan-400/80">Buổi thở tuyệt vời!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingBubble;

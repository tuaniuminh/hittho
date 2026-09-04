import React, { useMemo } from 'react';
import { Sparkles, Compass } from 'lucide-react';

/**
 * TÁC PHẨM NGHỆ THUẬT: ĐỒNG HỒ SINH KHÍ & CỰC QUANG WIM HOF (Celestial Prana Mandala)
 * Thiết kế từ góc nhìn của một nghệ sĩ số thị giác (Visual & Generative Artist):
 * - Vành đai tinh tú 30-40 nhịp (Constellation Halo) với mỗi nhịp thở là một vì sao được thắp sáng.
 * - Hoa sen sinh khí (Prana Lotus) 6 cánh hữu cơ co giãn, nở rộ khi hít vào và kết tinh khi nín thở.
 * - Dòng chảy cực quang chuyển sắc mềm mại (Bioluminescent Aurora Flow).
 * - Bộ 3 điểm chạm khí huyết thiền định: Khởi Sinh (Bụng) → Lan Tỏa (Ngực) → Thăng Hoa (Đỉnh).
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

  // Tính tọa độ hình học thiêng liêng (Sacred Geometry) cho các vì tinh tú trên vành đai quỹ đạo
  const starNodes = useMemo(() => {
    const total = targetBreaths || 30;
    const radius = 93;
    const center = 100;
    const nodes = [];

    for (let i = 0; i < total; i++) {
      // Bắt đầu từ đỉnh trên cùng (-90 độ)
      const angle = (i / total) * 2 * Math.PI - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      
      const isCompleted = phase === 'breathing' && i < breathCount - 1;
      const isActive = phase === 'breathing' && i === breathCount - 1;

      nodes.push({ i, x, y, isCompleted, isActive });
    }
    return nodes;
  }, [targetBreaths, breathCount, phase]);

  return (
    <div 
      onClick={onClick}
      className="relative flex items-center justify-center w-80 h-80 sm:w-96 sm:h-96 cursor-pointer select-none"
    >
      {/* ==================== 1. KHÔNG GIAN CỰC QUANG VÔ TẬN (AURORA NEBULA BACKDROP) ==================== */}
      <div 
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-1000 ${
          phase === 'breathing'
            ? breathState === 'inhale' 
              ? 'bg-gradient-to-tr from-cyan-500/25 via-teal-400/30 to-indigo-500/20 scale-130 opacity-95' 
              : 'bg-gradient-to-br from-teal-600/10 via-cyan-900/20 to-slate-900/10 scale-85 opacity-50'
            : phase === 'retention'
              ? isMilestoneReached
                ? 'bg-gradient-to-tr from-emerald-500/35 via-teal-400/30 to-cyan-500/25 scale-115 opacity-90 animate-pulse-glow'
                : 'bg-gradient-to-b from-cyan-900/25 via-blue-950/30 to-slate-950/40 scale-100 opacity-60'
            : phase === 'recovery'
              ? 'bg-gradient-to-tr from-amber-500/35 via-yellow-400/30 to-orange-500/25 scale-130 opacity-95 animate-pulse-glow'
              : 'bg-cyan-500/15 scale-90 opacity-40'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '1.2s',
          transitionTimingFunction: 'cubic-bezier(0.35, 0, 0.25, 1)'
        }}
      />

      {/* Vòng hào quang phụ xoay thiên hà chậm */}
      <div 
        className="absolute inset-4 rounded-full opacity-30 dark:opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(34, 211, 238, 0.15) 70%, transparent 100%)',
          animation: 'slowCelestialSpin 45s linear infinite'
        }}
      />

      {/* Sóng năng lượng nở ra ở đỉnh nhịp hít (Ripple Wave) */}
      {phase === 'breathing' && breathState === 'inhale' && (
        <div 
          className="absolute inset-2 rounded-full border border-cyan-400/35 pointer-events-none"
          style={{ animation: `rippleWave ${duration}s ease-out infinite` }}
        />
      )}

      {/* ==================== 2. MẶT SỐ KHOA HỌC THIỀN ĐỊNH & TINH TÚ (SVG CELESTIAL CANVAS) ==================== */}
      <svg className="absolute w-full h-full pointer-events-none" viewBox="0 0 200 200">
        
        {/* ĐỊNH NGHĨA GRADIENT CỰC QUANG VÀ ÁNH SÁNG NGHỆ THUẬT */}
        <defs>
          <linearGradient id="auroraInhaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="1" />
          </linearGradient>

          <linearGradient id="auroraExhaleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="retentionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          <linearGradient id="recoverySolarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>

          <filter id="celestialGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- LỚP 1: VÒNG QUỸ ĐẠO BỤI SAO MỜ (ORBITAL TRACK) --- */}
        <circle
          cx="100"
          cy="100"
          r="93"
          className="stroke-slate-300/40 dark:stroke-white/10 fill-none"
          strokeWidth="1.2"
          strokeDasharray="2 4"
        />

        {/* --- LỚP 2: CÁC VÌ TINH TÚ TRÊN VÀNH ĐAI THIÊN HÀ (CONSTELLATION NODES) --- */}
        {phase === 'breathing' && starNodes.map((star) => (
          <g key={star.i} className="transition-all duration-500">
            {star.isCompleted ? (
              // Ngôi sao đã thắp sáng
              <circle
                cx={star.x}
                cy={star.y}
                r="2.5"
                className="fill-cyan-500 dark:fill-cyan-300 transition-all duration-300"
                filter="url(#celestialGlow)"
              />
            ) : star.isActive ? (
              // Ngôi sao đang thở hiện tại (Pulsing living star)
              <g>
                <circle
                  cx={star.x}
                  cy={star.y}
                  r="5.5"
                  className="fill-none stroke-cyan-400 dark:stroke-cyan-300"
                  strokeWidth="1.5"
                  style={{ animation: 'starPulse 1.2s ease-in-out infinite' }}
                />
                <circle
                  cx={star.x}
                  cy={star.y}
                  r="3"
                  className="fill-cyan-400 dark:fill-white"
                  filter="url(#celestialGlow)"
                />
              </g>
            ) : (
              // Ngôi sao phía trước chưa tới (Faint cosmic dust)
              <circle
                cx={star.x}
                cy={star.y}
                r="1.5"
                className="fill-slate-300 dark:fill-white/20"
              />
            )}
          </g>
        ))}

        {/* --- LỚP 3: DÒNG CHẢY CỰC QUANG THỜI GIAN THỰC (REAL-TIME STREAM R=78) --- */}
        <g transform="rotate(-90 100 100)">
          {/* Đường dẫn nền */}
          <circle
            cx="100"
            cy="100"
            r="78"
            className="stroke-slate-200/50 dark:stroke-white/5 fill-none"
            strokeWidth="5"
          />

          {/* Dòng khí thời gian thực quét nhịp Hít / Thở */}
          {phase === 'breathing' && (
            <circle
              key={`${breathCount}-${breathState}`}
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke={breathState === 'inhale' ? 'url(#auroraInhaleGrad)' : 'url(#auroraExhaleGrad)'}
              strokeWidth="5.5"
              strokeDasharray="490.09"
              style={{
                animation: `${breathState === 'inhale' ? 'fillBreath' : 'drainBreath'} ${duration}s cubic-bezier(0.35, 0, 0.25, 1) forwards`,
                filter: breathState === 'inhale' ? 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.7))' : 'none'
              }}
              strokeLinecap="round"
            />
          )}

          {/* Tiến trình giai đoạn nín thở */}
          {phase === 'retention' && (
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke={isMilestoneReached ? 'url(#retentionGrad)' : 'url(#auroraInhaleGrad)'}
              strokeWidth="6"
              strokeDasharray="490.09"
              strokeDashoffset={490.09 - (490.09 * (retentionProgress / 100))}
              strokeLinecap="round"
              className="transition-all duration-500"
              style={{
                filter: isMilestoneReached ? 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' : 'none'
              }}
            />
          )}

          {/* Tiến trình phục hồi 15s */}
          {phase === 'recovery' && (
            <circle
              cx="100"
              cy="100"
              r="78"
              fill="none"
              stroke="url(#recoverySolarGrad)"
              strokeWidth="6.5"
              strokeDasharray="490.09"
              strokeDashoffset={490.09 * ((15 - recoveryTimeLeft) / 15)}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.8))' }}
            />
          )}
        </g>

        {/* --- LỚP 4: CÁNH HOA SINH KHÍ (PRANA LOTUS SACRED GEOMETRY) --- */}
        {/* 6 cánh hoa đối xứng chuyển động theo nhịp thở */}
        <g 
          className="transition-all"
          style={{
            transform: `scale(${phase === 'breathing' && breathState === 'inhale' ? 1.08 : 0.92}) rotate(${phase === 'breathing' && breathState === 'inhale' ? '12deg' : '0deg'})`,
            transformOrigin: '100px 100px',
            transitionDuration: phase === 'breathing' ? `${duration}s` : '1.0s',
            transitionTimingFunction: 'cubic-bezier(0.35, 0, 0.25, 1)'
          }}
        >
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse
              key={deg}
              cx="100"
              cy="70"
              rx="15"
              ry="28"
              transform={`rotate(${deg} 100 100)`}
              className={`transition-all duration-700 ${
                phase === 'breathing'
                  ? breathState === 'inhale'
                    ? 'fill-cyan-400/12 stroke-cyan-400/35'
                    : 'fill-teal-500/6 stroke-teal-500/15'
                  : phase === 'retention'
                    ? 'fill-indigo-500/10 stroke-cyan-400/25'
                    : phase === 'recovery'
                      ? 'fill-amber-500/15 stroke-amber-400/40'
                      : 'fill-cyan-500/5 stroke-cyan-500/15'
              }`}
              strokeWidth="0.75"
            />
          ))}
        </g>
      </svg>

      {/* ==================== 3. TÂM HOA SINH KHÍ (PRANA CORE CRYSTAL) ==================== */}
      <div 
        className={`relative z-10 flex flex-col items-center justify-center w-48 h-48 sm:w-56 sm:h-56 rounded-full backdrop-blur-xl shadow-2xl transition-all px-3 text-center ${
          phase === 'breathing'
            ? breathState === 'inhale'
              ? 'scale-105 bg-gradient-to-tr from-cyan-50/90 via-teal-50/70 to-white/95 dark:from-slate-950/85 dark:via-cyan-950/40 dark:to-slate-900/90 border border-cyan-400/40 dark:border-cyan-400/30 text-slate-900 dark:text-white shadow-cyan-500/20'
              : 'scale-90 bg-gradient-to-tr from-white/90 to-slate-100/80 dark:from-slate-950/90 dark:via-slate-900/70 dark:to-black/80 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-cyan-200/70'
            : phase === 'retention'
              ? isMilestoneReached
                ? 'scale-100 bg-gradient-to-b from-emerald-50/90 via-cyan-50/80 to-white dark:from-slate-950/90 dark:via-emerald-950/40 dark:to-slate-900/90 border border-emerald-400/50 text-slate-900 dark:text-white'
                : 'scale-95 bg-gradient-to-b from-white/90 via-cyan-50/60 to-slate-100 dark:from-slate-950/95 dark:via-cyan-950/40 dark:to-black/90 border border-cyan-500/30 text-slate-900 dark:text-white'
            : phase === 'recovery'
              ? 'scale-105 bg-gradient-to-b from-amber-50/95 via-yellow-50/80 to-white dark:from-slate-950/90 dark:via-amber-950/50 dark:to-slate-900/90 border border-amber-400/50 text-amber-950 dark:text-amber-100 shadow-amber-500/20'
              : 'scale-95 bg-white/90 dark:bg-slate-950/85 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-cyan-100'
        }`}
        style={{
          transitionDuration: phase === 'breathing' ? `${duration}s` : '0.8s',
          transitionTimingFunction: 'cubic-bezier(0.35, 0, 0.25, 1)'
        }}
      >
        
        {/* --- NỘI DUNG NGHỆ THUẬT THEO TỪNG GIAI ĐOẠN --- */}

        {/* 1. GIAI ĐOẠN THỞ SÂU (HYPERVENTILATION) */}
        {phase === 'breathing' && (
          <div className="flex flex-col items-center justify-center space-y-1.5 w-full">
            
            {/* Huy hiệu nghệ thuật trạng thái */}
            <div className="flex items-center justify-center">
              {breathState === 'inhale' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 shadow-sm animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  ĐÓN SINH KHÍ
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-slate-200/70 dark:bg-teal-950/50 text-slate-600 dark:text-teal-300 border border-slate-300 dark:border-teal-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  BUÔNG THẢ HƯ KHÔNG
                </span>
              )}
            </div>

            {/* Số nhịp thở lớn thiền định */}
            <div className="relative font-mono text-5xl sm:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
              {breathCount}
              <span className="text-base sm:text-lg font-light text-slate-400 dark:text-cyan-300/60 ml-1">
                /{targetBreaths}
              </span>
            </div>

            {/* 3 ĐIỂM CHẠM KHÍ HUYẾT THIỀN ĐỊNH WIM HOF */}
            {breathState === 'inhale' ? (
              <div className="pt-0.5 flex items-center justify-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider">
                <span 
                  className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border border-cyan-400/30 transition-all"
                  style={{ animation: `flowBelly ${duration}s ease-in-out infinite` }}
                >
                  Khởi Sinh
                </span>
                <span className="text-cyan-400/60 font-light">›</span>
                <span 
                  className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border border-cyan-400/30 transition-all"
                  style={{ animation: `flowChest ${duration}s ease-in-out infinite` }}
                >
                  Lan Tỏa
                </span>
                <span className="text-cyan-400/60 font-light">›</span>
                <span 
                  className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border border-cyan-400/30 transition-all"
                  style={{ animation: `flowHead ${duration}s ease-in-out infinite` }}
                >
                  Thăng Hoa
                </span>
              </div>
            ) : (
              <div className="pt-1 text-[10px] font-medium text-slate-500 dark:text-cyan-200/70 tracking-wider italic">
                Thả lỏng toàn thân vào tĩnh lặng...
              </div>
            )}
          </div>
        )}

        {/* 2. GIAI ĐOẠN NÍN THỞ (RETENTION PHASE - CÕI TĨNH LẶNG VÔ CỰC) */}
        {phase === 'retention' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              TĨNH LẶNG TUYỆT ĐỐI
            </span>
            
            <div className="font-mono text-5xl sm:text-6xl font-black tracking-tight text-slate-900 dark:text-white drop-shadow-sm my-0.5">
              {formatTime(retentionSeconds)}
            </div>

            <div className="text-[11px] font-mono text-slate-500 dark:text-cyan-300/80 flex items-center justify-center gap-1.5">
              <span>Mục tiêu: {formatTime(targetRetention)}</span>
              {isMilestoneReached ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Sparkles className="w-3 h-3 text-emerald-500 animate-bounce" />
                  Đạt Mốc
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 font-sans italic">Hòa cùng nhịp thở</span>
              )}
            </div>
          </div>
        )}

        {/* 3. GIAI ĐOẠN PHỤC HỒI 15S (RECOVERY - HÀO QUANG TÁI SINH) */}
        {phase === 'recovery' && (
          <div className="flex flex-col items-center justify-center space-y-1 text-center w-full">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-400/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              HÀO QUANG PHỤC HỒI
            </span>

            <div className="font-mono text-6xl font-black text-amber-600 dark:text-amber-200 drop-shadow-md my-0.5">
              {recoveryTimeLeft}s
            </div>

            <span className="text-[11px] text-amber-800 dark:text-amber-300/90 font-semibold tracking-wide">
              Hít đầy & tái tạo từng tế bào
            </span>
          </div>
        )}

        {/* 4. CHỜ BẮT ĐẦU (IDLE STATE) */}
        {phase === 'idle' && (
          <div className="flex flex-col items-center justify-center space-y-2 text-center p-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-cyan-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-600 dark:text-cyan-300">
                <Compass className="w-6 h-6 stroke-[2] animate-spin" style={{ animationDuration: '20s' }} />
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="block text-sm font-black tracking-wider text-slate-900 dark:text-white">
                CHẠM ĐỂ BƯỚC VÀO
              </span>
              <span className="block text-[11px] text-slate-500 dark:text-cyan-300/70 italic">
                Khởi đầu hành trình thanh lọc thân tâm
              </span>
            </div>
          </div>
        )}

        {/* 5. HOÀN THÀNH BUỔI TẬP */}
        {phase === 'completed' && (
          <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
            <Sparkles className="w-10 h-10 text-cyan-500 dark:text-cyan-300 animate-bounce" />
            <span className="text-base font-black text-cyan-700 dark:text-cyan-200 tracking-wider">
              VIÊN MÃN
            </span>
            <span className="text-[11px] text-slate-500 dark:text-cyan-300/80 italic">
              Sinh khí tràn ngập thân tâm
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default BreathingBubble;

import React from 'react';
import { Wind, Moon, Sun, Volume2, VolumeX, Flame } from 'lucide-react';
import packageJson from '../../package.json';

const Header = ({ settings, onToggleTheme, onToggleVoice, activePlan, streakDays = 0 }) => {
  const isDark = settings?.theme === 'dark';

  return (
    <header className="w-full safe-top-padding px-5 pb-3 pt-2 bg-white/95 dark:bg-oled/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 z-30 transition-colors duration-300">
      <div className="flex items-center justify-between">
        
        {/* LOGO & TIÊU ĐỀ */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-cyan-400 p-0.5 shadow-sm dark:shadow-ice-glow">
            <div className="w-full h-full bg-white dark:bg-oled rounded-[14px] flex items-center justify-center">
              <Wind className="w-5 h-5 text-cyan-600 dark:text-cyan-400 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-cyan-200 bg-clip-text text-transparent">
                HÍT THỞ
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300 border border-cyan-300/40 dark:border-cyan-500/30">
                v{packageJson.version}
              </span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-ping" />
              <span className="truncate max-w-[160px]">
                {activePlan ? `Giáo án: ${activePlan.name}` : 'Wim Hof Method'}
              </span>
            </div>
          </div>
        </div>

        {/* NÚT THAO TÁC NHANH: STREAK, SOUND, THEME */}
        <div className="flex items-center space-x-2">
          {/* Badge Streak Ngày */}
          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5 fill-current text-amber-500 animate-pulse" />
            <span>{streakDays}</span>
          </div>

          {/* Nút bật/tắt nhanh âm thanh */}
          <button
            onClick={onToggleVoice}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
              settings?.soundEnabled 
                ? 'bg-cyan-50 border-cyan-300 text-cyan-600 dark:bg-cyan-950/40 dark:border-cyan-500/30 dark:text-cyan-300 shadow-sm' 
                : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-white/5 dark:border-white/10 dark:text-slate-400'
            }`}
            title={settings?.soundEnabled ? "Tắt âm thanh" : "Bật âm thanh"}
          >
            {settings?.soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Nút đổi giao diện Sáng / Tối OLED */}
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 transition-all active:scale-95 hover:bg-slate-200 dark:hover:bg-white/10"
            title="Đổi giao diện Sáng / Tối"
          >
            {isDark ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-cyan-700" />
            )}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;

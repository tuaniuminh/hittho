import React from 'react';
import { 
  X, 
  Flame, 
  Trophy, 
  Calendar, 
  Clock, 
  Layers, 
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { getHistory, getUserStats } from '../services/storageService';
import { triggerHapticLight } from '../utils/hapticsUtils';

const HistoryModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const history = getHistory();
  const stats = getUserStats();

  const formatSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}p` : ''}${s > 0 ? `${s}s` : ''}` || '0s';
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#080d14] border border-cyan-500/20 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-900/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Lịch Sử & Thành Tích</h2>
              <p className="text-xs text-cyan-300/60">Theo dõi tiến trình tăng cường dung tích phổi</p>
            </div>
          </div>
          <button
            onClick={() => { triggerHapticLight(); onClose(); }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="p-4 border-b border-white/5 bg-black/20 grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center justify-center gap-1 text-amber-400">
              <Flame className="w-4 h-4 fill-current" />
              <span className="font-mono text-lg font-bold">{stats.streakDays}</span>
            </div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Chuỗi Ngày</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center justify-center gap-1 text-cyan-400">
              <Trophy className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">{formatSeconds(stats.personalBestSeconds)}</span>
            </div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Kỷ Lục Nín</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span className="font-mono text-lg font-bold">{stats.totalSessions}</span>
            </div>
            <span className="block text-[10px] text-slate-400 font-semibold uppercase">Buổi Đã Tập</span>
          </div>
        </div>

        {/* SESSION LIST (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <Clock className="w-8 h-8 mx-auto text-cyan-500/40" />
              <p className="text-sm">Chưa có buổi tập nào được ghi lại.</p>
              <p className="text-xs text-slate-500">Hãy bắt đầu buổi thở đầu tiên để ghi nhận kỷ lục của bạn!</p>
            </div>
          ) : (
            history.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-cyan-500/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{session.planName || 'Giáo Án Wim Hof'}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{formatDate(session.date)}</span>
                </div>

                {/* Danh sách các hiệp trong buổi */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {session.roundDetails?.map((r) => (
                    <div
                      key={r.roundNumber}
                      className="p-2 rounded-xl bg-black/40 border border-white/5 text-center"
                    >
                      <span className="block text-[9px] text-slate-400">Hiệp {r.roundNumber}</span>
                      <span className="block text-xs font-mono font-bold text-white mt-0.5">
                        {formatSeconds(r.retentionSeconds)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400 border-t border-white/5">
                  <span>Tổng nín thở: <strong className="text-cyan-300 font-mono">{formatSeconds(session.totalRetentionSeconds)}</strong></span>
                  <span>Max: <strong className="text-emerald-400 font-mono">{formatSeconds(session.maxRetentionSeconds)}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default HistoryModal;

import React, { useState } from 'react';
import { 
  Flame, 
  Trophy, 
  Clock, 
  Layers, 
  TrendingUp,
  Award,
  Trash2,
  Calendar,
  Lock,
  CheckCircle2
} from 'lucide-react';
import { 
  getHistory, 
  getUserStats, 
  deleteHistoryItem, 
  BADGES_LIST 
} from '../services/storageService';
import { triggerHapticLight, triggerHapticMedium } from '../utils/hapticsUtils';

const History = ({ onStartWorkout }) => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'badges'
  const [historyList, setHistoryList] = useState(getHistory());
  const [stats, setStats] = useState(getUserStats());

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

  const handleDeleteItem = (id) => {
    triggerHapticMedium();
    const updated = deleteHistoryItem(id);
    setHistoryList(updated);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-28 space-y-4">
      
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Thành Tích & Lịch Sử
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Theo dõi hành trình bứt phá dung tích phổi và chuỗi kiên định
        </p>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 shadow-sm space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
            <span className="font-mono text-xl font-extrabold">{stats.streakDays}</span>
          </div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Chuỗi Ngày</span>
        </div>

        <div className="p-3.5 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 shadow-sm space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 text-cyan-600 dark:text-cyan-400">
            <Trophy className="w-4 h-4" />
            <span className="font-mono text-xl font-extrabold">{formatSeconds(stats.personalBestSeconds)}</span>
          </div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Kỷ Lục Nín</span>
        </div>

        <div className="p-3.5 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 shadow-sm space-y-1 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-mono text-xl font-extrabold">{stats.totalSessions}</span>
          </div>
          <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">Buổi Đã Tập</span>
        </div>
      </div>

      {/* SUB-TABS: LỊCH SỬ vs HUY HIỆU */}
      <div className="flex p-1 rounded-2xl bg-slate-200/70 dark:bg-white/5 border border-slate-300/40 dark:border-white/5">
        <button
          onClick={() => { triggerHapticLight(); setActiveTab('history'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-white dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Lịch Sử Buổi Tập ({historyList.length})
        </button>
        <button
          onClick={() => { triggerHapticLight(); setActiveTab('badges'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'badges'
              ? 'bg-white dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Huy Hiệu Vinh Danh
        </button>
      </div>

      {/* TAB 1: DANH SÁCH LỊCH SỬ */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyList.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Clock className="w-10 h-10 mx-auto text-cyan-500/40" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Chưa có buổi tập nào</p>
                <p className="text-xs text-slate-500">Hãy bắt đầu buổi thở đầu tiên để ghi nhận kỷ lục của bạn!</p>
              </div>
              <button
                onClick={onStartWorkout}
                className="px-5 py-2.5 rounded-2xl bg-cyan-500 text-white dark:text-black font-bold text-xs shadow-md active:scale-95 transition-all"
              >
                Bắt Đầu Ngay
              </button>
            </div>
          ) : (
            historyList.map((session) => (
              <div
                key={session.id}
                className="p-4 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 hover:border-cyan-400/50 shadow-sm transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-bold">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{session.planName || 'Giáo Án Wim Hof'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">{formatDate(session.date)}</span>
                    <button
                      onClick={() => handleDeleteItem(session.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      title="Xóa buổi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Các hiệp trong buổi */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {session.roundDetails?.map((r) => (
                    <div
                      key={r.roundNumber}
                      className="p-2 rounded-2xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-center"
                    >
                      <span className="block text-[9px] text-slate-500 dark:text-slate-400 font-medium">Hiệp {r.roundNumber}</span>
                      <span className="block text-xs font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {formatSeconds(r.retentionSeconds)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1.5 text-slate-500 dark:text-slate-400 border-t border-slate-200/80 dark:border-white/5">
                  <span>Tổng nín thở: <strong className="text-cyan-700 dark:text-cyan-300 font-mono">{formatSeconds(session.totalRetentionSeconds)}</strong></span>
                  <span>Kỷ lục hiệp: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatSeconds(session.maxRetentionSeconds)}</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: HUY HIỆU VINH DANH */}
      {activeTab === 'badges' && (
        <div className="grid grid-cols-2 gap-2.5">
          {BADGES_LIST.map((badge) => {
            const isUnlocked = badge.check(stats, historyList);

            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-3xl border transition-all text-center space-y-2 ${
                  isUnlocked
                    ? 'bg-white dark:bg-darkCard border-cyan-400/40 shadow-sm'
                    : 'bg-slate-100/60 dark:bg-slate-900/30 border-slate-200 dark:border-white/5 opacity-50'
                }`}
              >
                <div className="relative w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-2xl">
                  <span>{badge.icon}</span>
                  {!isUnlocked && (
                    <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white">
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                    {badge.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                    {badge.desc}
                  </p>
                </div>

                <div>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    isUnlocked
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
                      : 'bg-slate-200 text-slate-600 dark:bg-white/5 dark:text-slate-500'
                  }`}>
                    {isUnlocked ? '✓ Đã Mở Khóa' : 'Chưa Đạt'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default History;

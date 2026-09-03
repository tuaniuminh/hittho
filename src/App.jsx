import React, { useState, useEffect } from 'react';
import WimHofTimer from './components/WimHofTimer';
import PlanManagerModal from './components/PlanManagerModal';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import { 
  Flame, 
  Trophy, 
  Settings as SettingsIcon, 
  Wind,
  Layers
} from 'lucide-react';
import { 
  getActivePlan, 
  getUserStats, 
  getSettings 
} from './services/storageService';
import { attachGlobalButtonHaptics, triggerHapticLight } from './utils/hapticsUtils';

function App() {
  const [activePlan, setActivePlan] = useState(getActivePlan());
  const [userStats, setUserStats] = useState(getUserStats());
  const [settings, setSettings] = useState(getSettings());

  // Trạng thái mở Modals
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    attachGlobalButtonHaptics();
  }, []);

  const handlePlanSelected = (plan) => {
    setActivePlan(plan);
  };

  const handleSessionCompleted = () => {
    setUserStats(getUserStats());
  };

  return (
    <div className="relative flex flex-col justify-between w-full h-screen overflow-hidden bg-oled text-white safe-top-padding safe-bottom-padding">
      
      {/* 1. HEADER KÍNH MỜ (TOP NAVIGATION BAR) */}
      <header className="relative z-20 flex items-center justify-between px-4 py-2 border-b border-white/5 bg-black/40 backdrop-blur-md">
        
        {/* LOGO & APP TITLE */}
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-black shadow-ice-glow">
            <Wind className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-sm font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              HÍT THỞ
            </span>
            <span className="block text-[9px] text-cyan-300/60 tracking-widest font-mono uppercase">
              WIM HOF METHOD
            </span>
          </div>
        </div>

        {/* RIGHT ACTIONS: STREAK, HISTORY, SETTINGS */}
        <div className="flex items-center space-x-1.5">
          {/* Nút Chuỗi Ngày Streak */}
          <button
            onClick={() => { triggerHapticLight(); setIsHistoryModalOpen(true); }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono font-bold hover:bg-amber-500/20 active:scale-95 transition-all"
            title="Chuỗi ngày tập liên tục"
          >
            <Flame className="w-3.5 h-3.5 fill-current text-amber-400 animate-pulse" />
            <span>{userStats.streakDays || 0}</span>
          </button>

          {/* Nút Lịch Sử & Thành Tích */}
          <button
            onClick={() => { triggerHapticLight(); setIsHistoryModalOpen(true); }}
            className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all"
            title="Lịch sử luyện tập"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Nút Cài Đặt & Cập Nhật */}
          <button
            onClick={() => { triggerHapticLight(); setIsSettingsModalOpen(true); }}
            className="p-2 rounded-full text-slate-400 hover:text-cyan-300 hover:bg-white/5 active:scale-95 transition-all"
            title="Cài đặt & Cập nhật OTA"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. KHU VỰC LUYỆN THỞ TRUNG TÂM */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center overflow-hidden">
        <WimHofTimer
          plan={activePlan}
          onOpenPlanManager={() => setIsPlanModalOpen(true)}
          onSessionCompleted={handleSessionCompleted}
        />
      </main>

      {/* 3. MODALS */}
      <PlanManagerModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onPlanSelected={handlePlanSelected}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSettingsUpdated={(newSettings) => setSettings(newSettings)}
      />

    </div>
  );
}

export default App;

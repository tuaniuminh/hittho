import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Timer from './components/Timer';
import PlanManager from './components/PlanManager';
import History from './components/History';
import Settings from './components/Settings';
import { 
  getSettings, 
  saveSettings, 
  getActivePlan, 
  saveActivePlan, 
  getUserStats 
} from './services/storageService';
import { 
  attachGlobalButtonHaptics, 
  triggerHapticWarning, 
  triggerHapticLight 
} from './utils/hapticsUtils';
import { 
  Wind, 
  ClipboardList, 
  Trophy, 
  Settings as SettingsIcon 
} from 'lucide-react';
import { StatusBar, Style } from '@capacitor/status-bar';

function App() {
  const [activeTab, setActiveTab] = useState('timer'); // 'timer' | 'plans' | 'history' | 'settings'
  const [settings, setSettingsState] = useState(getSettings());
  const [currentPlan, setCurrentPlan] = useState(getActivePlan());
  const [userStats, setUserStats] = useState(getUserStats());
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const mainContentRef = useRef(null);

  // Cuộn lên đầu trang mỗi khi chuyển tab
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Thiết lập phản hồi rung toàn cục và đồng bộ giao diện Dark / Light Mode
  useEffect(() => {
    attachGlobalButtonHaptics();

    const root = document.documentElement;
    const isDark = settings.theme === 'dark';

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Đồng bộ màu thanh trạng thái (Status Bar) iOS / Web
    const syncStatusBar = async () => {
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', isDark ? '#000000' : '#ffffff');
      }

      const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (statusBarMeta) {
        statusBarMeta.setAttribute('content', isDark ? 'black-translucent' : 'default');
      }

      try {
        if (StatusBar && typeof StatusBar.setStyle === 'function') {
          await StatusBar.setStyle({
            style: isDark ? Style.Dark : Style.Light
          });
        }
      } catch (e) {}
    };

    syncStatusBar();
  }, [settings.theme]);

  const handleUpdateSettings = (newSettings) => {
    setSettingsState(newSettings);
    saveSettings(newSettings);
  };

  const handleToggleTheme = () => {
    triggerHapticLight();
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ ...settings, theme: newTheme });
  };

  const handleToggleVoice = () => {
    triggerHapticLight();
    handleUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const handleSelectPlan = (newPlan) => {
    setCurrentPlan(newPlan);
    saveActivePlan(newPlan);
    setActiveTab('timer'); // Chuyển thẳng sang Tab Luyện Thở để bắt đầu
  };

  const handleTabChange = (tabId) => {
    if (isWorkoutActive && tabId !== 'timer') {
      triggerHapticWarning();
      return;
    }
    triggerHapticLight();
    setActiveTab(tabId);
  };

  const handleSessionCompleted = () => {
    setUserStats(getUserStats());
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-100 dark:bg-oled text-slate-900 dark:text-white overflow-hidden font-sans transition-colors duration-300">
      
      {/* 1. HEADER CỐ ĐỊNH CÓ SAFE AREA */}
      <Header 
        settings={settings}
        onToggleTheme={handleToggleTheme}
        onToggleVoice={handleToggleVoice}
        activePlan={currentPlan}
        streakDays={userStats.streakDays || 0}
      />

      {/* 2. NỘI DUNG 4 TABS CHÍNH */}
      <main 
        ref={mainContentRef} 
        className={`flex-1 relative ${activeTab === 'timer' ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}
      >
        {activeTab === 'timer' && (
          <Timer 
            plan={currentPlan}
            onOpenPlans={() => setActiveTab('plans')}
            onWorkoutStateChange={setIsWorkoutActive}
            onSessionCompleted={handleSessionCompleted}
          />
        )}

        {activeTab === 'plans' && (
          <PlanManager 
            onSelectPlan={handleSelectPlan}
          />
        )}

        {activeTab === 'history' && (
          <History 
            onStartWorkout={() => setActiveTab('timer')}
          />
        )}

        {activeTab === 'settings' && (
          <Settings 
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </main>

      {/* 3. BOTTOM NAVIGATION BAR (4 TABS) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-oled/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/5 safe-bottom-padding px-6 pt-2 transition-colors duration-300">
        <div className="flex items-center justify-around max-w-md mx-auto">
          
          {/* Tab 1: Luyện Thở (Cyan / Ice) */}
          <button
            onClick={() => handleTabChange('timer')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 ${
              activeTab === 'timer'
                ? 'text-cyan-600 dark:text-cyan-400 scale-105 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Wind size={22} className={activeTab === 'timer' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] tracking-tight mt-1 font-bold">Luyện Thở</span>
          </button>

          {/* Tab 2: Giáo Án (Teal / Blue) */}
          <button
            onClick={() => handleTabChange('plans')}
            disabled={isWorkoutActive}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 ${
              isWorkoutActive
                ? 'opacity-25 cursor-not-allowed text-slate-400 dark:text-slate-600'
                : activeTab === 'plans'
                ? 'text-teal-600 dark:text-teal-400 scale-105 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title={isWorkoutActive ? "Hãy kết thúc hoặc dừng buổi thở trước khi chuyển tab" : "Giáo Án"}
          >
            <ClipboardList size={22} className={activeTab === 'plans' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] tracking-tight mt-1 font-bold">Giáo Án</span>
          </button>

          {/* Tab 3: Thành Tích (Amber Gold) */}
          <button
            onClick={() => handleTabChange('history')}
            disabled={isWorkoutActive}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 ${
              isWorkoutActive
                ? 'opacity-25 cursor-not-allowed text-slate-400 dark:text-slate-600'
                : activeTab === 'history'
                ? 'text-amber-500 dark:text-amber-400 scale-105 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title={isWorkoutActive ? "Hãy kết thúc hoặc dừng buổi thở trước khi chuyển tab" : "Thành Tích"}
          >
            <Trophy size={22} className={activeTab === 'history' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] tracking-tight mt-1 font-bold">Thành Tích</span>
          </button>

          {/* Tab 4: Cài Đặt (Purple) */}
          <button
            onClick={() => handleTabChange('settings')}
            disabled={isWorkoutActive}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-300 ${
              isWorkoutActive
                ? 'opacity-25 cursor-not-allowed text-slate-400 dark:text-slate-600'
                : activeTab === 'settings'
                ? 'text-purple-600 dark:text-purple-400 scale-105 font-black'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title={isWorkoutActive ? "Hãy kết thúc hoặc dừng buổi thở trước khi chuyển tab" : "Cài Đặt"}
          >
            <SettingsIcon size={22} className={activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-2'} />
            <span className="text-[10px] tracking-tight mt-1 font-bold">Cài Đặt</span>
          </button>

        </div>
      </nav>

    </div>
  );
}

export default App;

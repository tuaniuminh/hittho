/**
 * Dịch vụ Quản lý Lưu Trữ LocalStorage, Giáo Án Luyện Thở, Lịch Sử & Screen Wake Lock
 */

const STORAGE_KEYS = {
  SETTINGS: 'hittho_settings_v1',
  ACTIVE_PLAN_ID: 'hittho_active_plan_id_v1',
  CUSTOM_PLANS: 'hittho_custom_plans_v1',
  HISTORY: 'hittho_history_v1',
  USER_STATS: 'hittho_user_stats_v1'
};

// ==================== 1. SCREEN WAKE LOCK API ====================
let wakeLockInstance = null;

export const requestWakeLock = async () => {
  if (typeof window !== 'undefined' && 'wakeLock' in navigator) {
    try {
      wakeLockInstance = await navigator.wakeLock.request('screen');
    } catch (err) {
      console.warn('Wake Lock error:', err);
    }
  }
};

export const releaseWakeLock = async () => {
  if (wakeLockInstance) {
    try {
      await wakeLockInstance.release();
      wakeLockInstance = null;
    } catch (err) {
      console.warn('Wake Lock release error:', err);
    }
  }
};

// ==================== 2. HỆ THỐNG GIÁO ÁN CHUẨN THEO CẤP ĐỘ ====================
export const DEFAULT_PLANS = [
  {
    id: 'plan_beginner',
    name: 'Nhập Môn Tĩnh Lặng',
    level: 'beginner',
    badge: 'Căn Bản',
    desc: 'Dành cho người mới bắt đầu. Rèn luyện sự định tâm và làm quen với trạng thái giảm oxy an toàn.',
    color: 'emerald',
    rounds: [
      { roundNumber: 1, breaths: 30, speed: 'normal', targetRetention: 60, recoveryHold: 15 },
      { roundNumber: 2, breaths: 30, speed: 'normal', targetRetention: 75, recoveryHold: 15 },
      { roundNumber: 3, breaths: 30, speed: 'normal', targetRetention: 90, recoveryHold: 15 }
    ]
  },
  {
    id: 'plan_intermediate',
    name: 'Năng Lượng Bứt Phá',
    level: 'intermediate',
    badge: 'Trung Cấp',
    desc: 'Tăng cường nồng độ kiềm trong máu, kích thích sản sinh hồng cầu và tăng cường khả năng chịu lạnh.',
    color: 'cyan',
    rounds: [
      { roundNumber: 1, breaths: 35, speed: 'normal', targetRetention: 90, recoveryHold: 15 },
      { roundNumber: 2, breaths: 35, speed: 'normal', targetRetention: 120, recoveryHold: 15 },
      { roundNumber: 3, breaths: 35, speed: 'normal', targetRetention: 150, recoveryHold: 15 },
      { roundNumber: 4, breaths: 35, speed: 'normal', targetRetention: 180, recoveryHold: 15 }
    ]
  },
  {
    id: 'plan_advanced',
    name: 'Băng Giá Thượng Thừa',
    level: 'advanced',
    badge: 'Chuyên Sâu',
    desc: 'Thử thách ngưỡng chịu đựng đỉnh cao của cơ thể và kiểm soát hệ thần kinh tự chủ theo chuẩn Wim Hof.',
    color: 'amber',
    rounds: [
      { roundNumber: 1, breaths: 40, speed: 'fast', targetRetention: 120, recoveryHold: 15 },
      { roundNumber: 2, breaths: 40, speed: 'fast', targetRetention: 180, recoveryHold: 15 },
      { roundNumber: 3, breaths: 40, speed: 'fast', targetRetention: 210, recoveryHold: 15 },
      { roundNumber: 4, breaths: 40, speed: 'fast', targetRetention: 240, recoveryHold: 15 }
    ]
  }
];

export const getCustomPlans = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_PLANS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getAllPlans = () => {
  const custom = getCustomPlans();
  return [...DEFAULT_PLANS, ...custom];
};

export const getActivePlan = () => {
  const all = getAllPlans();
  const activeId = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID) || 'plan_beginner';
  const found = all.find(p => p.id === activeId);
  return found || DEFAULT_PLANS[0];
};

export const setActivePlanId = (planId) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAN_ID, planId);
};

export const saveCustomPlan = (planData) => {
  const custom = getCustomPlans();
  const planId = planData.id || `custom_${Date.now()}`;
  const newPlan = {
    ...planData,
    id: planId,
    level: 'custom',
    badge: 'Tùy Chỉnh',
    color: 'purple',
    updatedAt: new Date().toISOString()
  };

  const existingIdx = custom.findIndex(p => p.id === planId);
  if (existingIdx >= 0) {
    custom[existingIdx] = newPlan;
  } else {
    custom.push(newPlan);
  }

  localStorage.setItem(STORAGE_KEYS.CUSTOM_PLANS, JSON.stringify(custom));
  setActivePlanId(planId);
  return newPlan;
};

export const deleteCustomPlan = (planId) => {
  let custom = getCustomPlans();
  custom = custom.filter(p => p.id !== planId);
  localStorage.setItem(STORAGE_KEYS.CUSTOM_PLANS, JSON.stringify(custom));

  // Nếu giáo án đang kích hoạt bị xóa, quay về giáo án mặc định
  if (localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAN_ID) === planId) {
    setActivePlanId('plan_beginner');
  }
};

// ==================== 3. CÀI ĐẶT ỨNG DỤNG ====================
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  soundVolume: 0.85,
  hapticsEnabled: true,
  ambientDroneEnabled: true,
  repoUrl: 'tuaniuminh/hittho'
};

export const getSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

export const saveSettings = (newSettings) => {
  const current = getSettings();
  const merged = { ...current, ...newSettings };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
  return merged;
};

// ==================== 4. LỊCH SỬ TẬP & CHUỖI STREAK ====================
export const getHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const getUserStats = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  return {
    totalSessions: 0,
    streakDays: 0,
    lastWorkoutDate: null,
    personalBestSeconds: 0,
    totalRetentionSeconds: 0
  };
};

export const saveSessionHistory = (sessionData) => {
  const history = getHistory();
  const stats = getUserStats();

  const sessionEntry = {
    ...sessionData,
    id: `sess_${Date.now()}`,
    date: new Date().toISOString()
  };

  history.unshift(sessionEntry);
  // Giữ tối đa 100 buổi gần nhất
  if (history.length > 100) history.pop();
  localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));

  // Cập nhật thống kê và Streak
  const todayStr = new Date().toDateString();
  const lastDateStr = stats.lastWorkoutDate ? new Date(stats.lastWorkoutDate).toDateString() : null;

  let newStreak = stats.streakDays;
  if (!lastDateStr) {
    newStreak = 1;
  } else if (todayStr !== lastDateStr) {
    const diffDays = Math.floor((new Date(todayStr) - new Date(lastDateStr)) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const maxRetention = Math.max(
    stats.personalBestSeconds || 0,
    sessionData.maxRetentionSeconds || 0
  );

  const updatedStats = {
    totalSessions: (stats.totalSessions || 0) + 1,
    streakDays: newStreak,
    lastWorkoutDate: new Date().toISOString(),
    personalBestSeconds: maxRetention,
    totalRetentionSeconds: (stats.totalRetentionSeconds || 0) + (sessionData.totalRetentionSeconds || 0)
  };

  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updatedStats));
  return { history, stats: updatedStats };
};

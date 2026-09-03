/**
 * Tiện ích Rung Phản Hồi Xúc Giác (Haptic Feedback) chuyên sâu cho iOS & Web.
 * Sử dụng Apple Taptic Engine qua @capacitor/haptics và HTML5 Vibration API làm fallback.
 */

let CapacitorHaptics = null;

// Khởi tạo và nạp động Capacitor Haptics nếu có
const initHaptics = async () => {
  if (typeof window !== 'undefined') {
    try {
      const module = await import('@capacitor/haptics');
      CapacitorHaptics = module.Haptics;
    } catch (e) {
      CapacitorHaptics = null;
    }
  }
};

initHaptics();

// 1. Rung nhẹ khi chạm nút bấm
export const triggerHapticLight = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: 'LIGHT' });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  } catch (e) {}
};

// 2. Rung vừa (Bắt đầu / Tạm dừng / Chuyển chế độ)
export const triggerHapticMedium = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: 'MEDIUM' });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(25);
    }
  } catch (e) {}
};

// 3. Rung đỉnh nhịp thở (Đỉnh Hít vào & Đáy Thở ra)
export const triggerBreathPeakHaptic = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: 'LIGHT' });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(12);
    }
  } catch (e) {}
};

// 4. Rung kích hoạt Chuông Tây Tạng / Bắt đầu Nín Thở
export const triggerSingingBowlHaptic = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: 'HEAVY' });
      setTimeout(async () => {
        try {
          if (CapacitorHaptics) await CapacitorHaptics.impact({ style: 'MEDIUM' });
        } catch (e) {}
      }, 100);
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 50, 20]);
    }
  } catch (e) {}
};

// 5. Rung khi đạt Mốc Thời Gian Mục Tiêu Nín Thở (Target Reached Milestone)
export const triggerMilestoneHaptic = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: 'MEDIUM' });
      setTimeout(async () => {
        try {
          if (CapacitorHaptics) await CapacitorHaptics.impact({ style: 'HEAVY' });
        } catch (e) {}
      }, 140);
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([20, 60, 35]);
    }
  } catch (e) {}
};

// 6. Rung mạnh (Heavy impact)
export const triggerHapticHeavy = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.impact({ style: 'HEAVY' });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 40, 30]);
    }
  } catch (e) {}
};

// 7. Rung thành công (Success notification)
export const triggerHapticSuccess = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.notification({ type: 'SUCCESS' });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 15, 30, 40]);
    }
  } catch (e) {}
};

// 8. Rung cảnh báo (Warning notification)
export const triggerHapticWarning = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.notification({ type: 'WARNING' });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([40, 60, 40]);
    }
  } catch (e) {}
};

// 9. Rung hoàn thành 15s phục hồi
export const triggerRecoveryEndHaptic = async () => {
  try {
    if (CapacitorHaptics) {
      await CapacitorHaptics.notification({ type: 'SUCCESS' });
    } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([15, 30, 20, 40, 50]);
    }
  } catch (e) {}
};

// ==================== TỰ ĐỘNG GẮN PHẢN HỒI RUNG CHO TẤT CẢ NÚT BẤM ====================
export const attachGlobalButtonHaptics = () => {
  if (typeof window === 'undefined') return;

  const handleGlobalClick = (event) => {
    const target = event.target;
    if (!target) return;

    const button = target.closest('button, [role="button"], a, input[type="range"], input[type="checkbox"]');
    if (button) {
      triggerHapticLight();
    }
  };

  window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
};

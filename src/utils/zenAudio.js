/**
 * Bộ Tổng Hợp Âm Thanh Thiền Định Web Audio API (Zen Sound Synthesizer)
 * Hoạt động 100% Offline, Độ Trễ 0ms, Thiết Kế Độc Quyền Cho Phương Pháp Wim Hof.
 */

let audioCtx = null;

export const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

// ==================== 1. ÂM THANH HÍT VÀO (INHALE SOUND) ====================
export const playInhaleSound = (duration = 1.3, volume = 0.35) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bộ tạo sóng âm thanh dạng gió mềm mại kết hợp hài âm
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + duration);

    // Bộ lọc mở dần mô phỏng luồng khí tràn vào lồng ngực
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, now);
    filter.frequency.exponentialRampToValueAtTime(750, now + duration);
    filter.Q.setValueAtTime(2.0, now);

    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.linearRampToValueAtTime(volume * 0.4, now + duration * 0.7);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Inhale audio error:', e);
  }
};

// ==================== 2. ÂM THANH THỞ RA (EXHALE SOUND) ====================
export const playExhaleSound = (duration = 1.2, volume = 0.3) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(160, now + duration);
    filter.Q.setValueAtTime(1.5, now);

    oscGain.gain.setValueAtTime(volume * 0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Exhale audio error:', e);
  }
};

// ==================== 3. TIẾNG CHUÔNG NGÂN TÂY TẠNG (TIBETAN SINGING BOWL) ====================
export const playTibetanBowl = (volume = 0.75) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 5.5;

    // Tần số cơ bản 216Hz (Om Frequency / F#3) cùng các bội âm đặc trưng của chuông xoay
    const harmonics = [
      { freq: 216.0, gain: 1.0, decay: 5.5 },     // Fundamental
      { freq: 216.8, gain: 0.65, decay: 5.0 },    // Chùm sóng giao thoa tạo độ ngân
      { freq: 596.16, gain: 0.45, decay: 4.2 },   // Bội âm 1 (2.76x)
      { freq: 1166.4, gain: 0.22, decay: 3.2 }    // Bội âm 2 (5.4x)
    ];

    harmonics.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(volume * gain * 0.35, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.00001, now + decay);

      osc.connect(g);
      g.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + decay);
    });
  } catch (e) {
    console.warn('Tibetan bowl audio error:', e);
  }
};

// ==================== 4. SÓNG NÃO ALPHA & DRONE THƯ GIÃN KHI NÍN THỞ ====================
let activeDroneNodes = null;

export const startAlphaDrone = (volume = 0.18) => {
  try {
    stopAlphaDrone();
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const masterGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Sóng ấm 108Hz và 216Hz hài hòa
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(108, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(216.5, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(volume, now + 2.0); // Tăng dần êm ái sau 2s

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);

    activeDroneNodes = { osc1, osc2, masterGain };
  } catch (e) {
    console.warn('Alpha drone error:', e);
  }
};

export const stopAlphaDrone = () => {
  if (activeDroneNodes) {
    try {
      const { osc1, osc2, masterGain } = activeDroneNodes;
      const ctx = getAudioContext();
      if (ctx) {
        const now = ctx.currentTime;
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.2);
        setTimeout(() => {
          try {
            osc1.stop();
            osc2.stop();
          } catch (e) {}
        }, 1300);
      }
    } catch (e) {}
    activeDroneNodes = null;
  }
};

// ==================== 5. CHUÔNG CHẠM MỐC MỤC TIÊU (MILESTONE CHIME) ====================
export const playMilestoneChime = (volume = 0.6) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const duration = 2.8;

    // Tần số 528Hz (Solfeggio Transformation)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume * 0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.00001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Milestone chime error:', e);
  }
};

// ==================== 6. CHUÔNG PHỤC HỒI HOÀN THÀNH 15S (RECOVERY CHIME) ====================
export const playRecoveryEndChime = (volume = 0.75) => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Bộ 3 chuông ngũ cung C5 - E5 - G5 (523.25Hz, 659.25Hz, 783.99Hz)
    const notes = [
      { f: 523.25, time: 0 },
      { f: 659.25, time: 0.16 },
      { f: 783.99, time: 0.32 }
    ];

    notes.forEach(({ f, time }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + time);

      gain.gain.setValueAtTime(0.0001, now + time);
      gain.gain.linearRampToValueAtTime(volume * 0.3, now + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + time + 3.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + 3.0);
    });
  } catch (e) {
    console.warn('Recovery chime error:', e);
  }
};

import React, { useState, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Waves, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  Sparkles,
  Sun,
  Moon,
  Music
} from 'lucide-react';
import { getSettings, saveSettings } from '../services/storageService';
import { checkForUpdate, downloadIPAInApp, cancelDownloadIPA } from '../services/updateService';
import { triggerHapticLight, triggerHapticMedium, triggerHapticSuccess } from '../utils/hapticsUtils';
import { playTibetanBowl } from '../utils/zenAudio';
import packageJson from '../../package.json';

const APP_VERSION = packageJson.version;

const Settings = ({ settings, onUpdateSettings }) => {
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateChecked, setUpdateChecked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadFinished, setDownloadFinished] = useState(false);
  
  const downloadCanceledRef = useRef(false);

  const handleToggle = (key) => {
    triggerHapticLight();
    const updated = { ...settings, [key]: !settings[key] };
    onUpdateSettings(updated);
  };

  const handleSetTheme = (themeMode) => {
    triggerHapticLight();
    onUpdateSettings({ ...settings, theme: themeMode });
  };

  const handleVolumeChange = (val) => {
    const updated = { ...settings, soundVolume: parseFloat(val) };
    onUpdateSettings(updated);
  };

  const handleRepoChange = (val) => {
    const updated = { ...settings, repoUrl: val.trim() };
    onUpdateSettings(updated);
  };

  const handlePreviewBowl = () => {
    triggerHapticLight();
    playTibetanBowl(settings.soundVolume);
  };

  // Kiểm tra cập nhật GitHub Releases
  const handleCheckUpdate = async () => {
    triggerHapticLight();
    setCheckingUpdate(true);
    setUpdateChecked(false);
    setDownloadError(null);
    setDownloadFinished(false);

    try {
      const [res] = await Promise.all([
        checkForUpdate(APP_VERSION),
        new Promise(resolve => setTimeout(resolve, 600))
      ]);
      setUpdateInfo(res);
      setUpdateChecked(true);
      if (res.hasUpdate) {
        triggerHapticSuccess();
      }
    } catch (e) {
      setUpdateInfo({ hasUpdate: false, error: e.message });
      setUpdateChecked(true);
    } finally {
      setCheckingUpdate(false);
    }
  };

  // Tải file IPA trực tiếp trong ứng dụng và mở Share Sheet TrollStore
  const handleStartDownloadIPA = async () => {
    if (!updateInfo?.ipaDownloadUrl) return;

    triggerHapticMedium();
    downloadCanceledRef.current = false;
    setIsDownloading(true);
    setDownloadError(null);
    setDownloadFinished(false);
    setDownloadProgress({
      progress: 0,
      downloadedMB: '0.0',
      totalMB: '...',
      speed: '0 KB/s'
    });

    try {
      const res = await downloadIPAInApp(updateInfo.ipaDownloadUrl, (data) => {
        if (downloadCanceledRef.current) return;
        setDownloadProgress(data);
      });
      if (res && res.success && !downloadCanceledRef.current) {
        setDownloadFinished(true);
        triggerHapticSuccess();
      }
    } catch (err) {
      if (!downloadCanceledRef.current) {
        setDownloadError(err.message || "Lỗi tải file IPA. Vui lòng thử lại.");
      }
    } finally {
      if (!downloadCanceledRef.current) {
        setIsDownloading(false);
      }
    }
  };

  const handleCancelDownload = async () => {
    downloadCanceledRef.current = true;
    setIsDownloading(false);
    setDownloadProgress(null);
    setDownloadFinished(false);
    setDownloadError(null);
    await cancelDownloadIPA();
    triggerHapticLight();
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-28 space-y-4">
      
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Cài Đặt & Cập Nhật
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tùy biến giao diện, âm thanh & tải cập nhật qua TrollStore
        </p>
      </div>

      {/* 1. CHỌN GIAO DIỆN SÁNG / TỐI OLED */}
      <div className="p-4 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 shadow-sm space-y-3">
        <span className="block text-xs font-bold text-slate-700 dark:text-cyan-300 uppercase tracking-wider">
          Giao Diện Ứng Dụng (Theme)
        </span>

        <div className="grid grid-cols-2 gap-3">
          {/* Card Tối OLED */}
          <button
            onClick={() => handleSetTheme('dark')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-2 ${
              settings.theme === 'dark'
                ? 'border-cyan-500 bg-cyan-950/30 shadow-sm dark:shadow-ice-glow'
                : 'border-slate-200 dark:border-white/5 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Moon className="w-5 h-5 text-cyan-400" />
              {settings.theme === 'dark' && (
                <div className="w-2 h-2 rounded-full bg-cyan-400" />
              )}
            </div>
            <div>
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white">Tối OLED</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">Đen tuyền, tiết kiệm pin</span>
            </div>
          </button>

          {/* Card Sáng Thanh Khiết */}
          <button
            onClick={() => handleSetTheme('light')}
            className={`p-3.5 rounded-2xl border text-left transition-all space-y-2 ${
              settings.theme === 'light'
                ? 'border-cyan-500 bg-cyan-50/70 shadow-sm'
                : 'border-slate-200 dark:border-white/5 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <Sun className="w-5 h-5 text-amber-500" />
              {settings.theme === 'light' && (
                <div className="w-2 h-2 rounded-full bg-cyan-500" />
              )}
            </div>
            <div>
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white">Sáng Thanh Khiết</span>
              <span className="block text-[10px] text-slate-500 dark:text-slate-400">Trắng tao nhã, dịu mắt</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. CÀI ĐẶT ÂM THANH & RUNG */}
      <div className="p-4 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 shadow-sm space-y-3.5">
        <span className="block text-xs font-bold text-slate-700 dark:text-cyan-300 uppercase tracking-wider">
          Âm Thanh & Cảm Giác Thiền Định
        </span>

        {/* Âm thanh dẫn nhịp & chuông */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <div>
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white">Âm Dẫn Nhịp & Chuông</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">Tiếng gió thở, Chuông Tây Tạng</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('soundEnabled')}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
              settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
              settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Thanh trượt âm lượng & Thử chuông */}
        {settings.soundEnabled && (
          <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-white/5">
            <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Âm Lượng: <strong className="font-mono text-cyan-700 dark:text-cyan-300">{Math.round(settings.soundVolume * 100)}%</strong></span>
              <button
                onClick={handlePreviewBowl}
                className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Music className="w-3 h-3" />
                <span>Thử Chuông</span>
              </button>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        )}

        {/* Sóng não Alpha Drone */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Waves className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <div>
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white">Sóng Não Alpha Khi Nín Thở</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">Âm nền tĩnh tại giúp hạ nhịp tim</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('ambientDroneEnabled')}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
              settings.ambientDroneEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
              settings.ambientDroneEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {/* Rung xúc giác Apple Taptic Engine */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <div>
              <span className="block text-sm font-extrabold text-slate-900 dark:text-white">Rung Xúc Giác Haptics</span>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400">Apple Taptic Engine theo nhịp thở</span>
            </div>
          </div>
          <button
            onClick={() => handleToggle('hapticsEnabled')}
            className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
              settings.hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
              settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* 3. CẬP NHẬT OTA TRỰC TIẾP & TROLLSTORE */}
      <div className="p-4 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-cyan-500/20 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="block text-xs font-bold text-slate-700 dark:text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            Cập Nhật OTA & TrollStore
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold">
            v{APP_VERSION}
          </span>
        </div>

        <div>
          <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1 font-medium">Repository GitHub Cập Nhật:</label>
          <input
            type="text"
            value={settings.repoUrl || ''}
            onChange={(e) => handleRepoChange(e.target.value)}
            placeholder="VD: tuaniuminh/hittho"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <button
          onClick={handleCheckUpdate}
          disabled={checkingUpdate || isDownloading}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-cyan-950/60 border border-slate-300 dark:border-cyan-500/30 text-slate-800 dark:text-cyan-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-cyan-900/50 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
          <span>{checkingUpdate ? 'Đang kiểm tra Releases...' : 'Kiểm Tra Bản Cập Nhật Mới'}</span>
        </button>

        {updateChecked && updateInfo && (
          <div className="pt-2 animate-fade-in space-y-2">
            {updateInfo.hasUpdate ? (
              <div className="p-3.5 rounded-2xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-300 dark:border-cyan-400/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-800 dark:text-cyan-300 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Có Bản Mới: {updateInfo.tagName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {updateInfo.ipaSize ? `${(updateInfo.ipaSize / 1024 / 1024).toFixed(1)} MB` : ''}
                  </span>
                </div>

                {isDownloading && downloadProgress && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-cyan-800 dark:text-cyan-300 font-bold">
                      <span>{downloadProgress.downloadedMB} / {downloadProgress.totalMB} MB</span>
                      <span>{downloadProgress.speed} ({Math.round(downloadProgress.progress * 100)}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-black/60 overflow-hidden border border-cyan-400/20">
                      <div 
                        className="h-full bg-cyan-500 transition-all duration-300"
                        style={{ width: `${Math.round(downloadProgress.progress * 100)}%` }}
                      />
                    </div>
                    <button
                      onClick={handleCancelDownload}
                      className="text-[10px] text-red-500 hover:underline pt-0.5"
                    >
                      Hủy tải bản cập nhật
                    </button>
                  </div>
                )}

                {downloadFinished && (
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-1.5 font-medium">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Đã mở Share Sheet! Chạm TrollStore để cài đè 1-chạm.</span>
                  </div>
                )}

                {downloadError && (
                  <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-500/30 text-red-800 dark:text-red-300 text-[11px] flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{downloadError}</span>
                  </div>
                )}

                {!isDownloading && !downloadFinished && (
                  <button
                    onClick={handleStartDownloadIPA}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 text-white dark:text-black font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải IPA & Mở TrollStore</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>{updateInfo.message || 'Bạn đang ở phiên bản mới nhất!'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. THÔNG TIN PHẦN MỀM */}
      <div className="text-center py-3 space-y-1 text-slate-400 text-[11px]">
        <p className="font-bold text-slate-600 dark:text-slate-300">Hít Thở • Wim Hof Method Mobile</p>
        <p>Phát triển bằng React 18, Vite, Tailwind CSS & Native Swift</p>
      </div>

    </div>
  );
};

export default Settings;

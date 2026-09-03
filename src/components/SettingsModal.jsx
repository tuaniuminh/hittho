import React, { useState, useRef } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Waves, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  Smartphone, 
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { getSettings, saveSettings } from '../services/storageService';
import { checkForUpdate, downloadIPAInApp, cancelDownloadIPA } from '../services/updateService';
import { triggerHapticLight, triggerHapticMedium, triggerHapticSuccess } from '../utils/hapticsUtils';

const APP_VERSION = '1.0.0';

const SettingsModal = ({ isOpen, onClose, onSettingsUpdated }) => {
  const [settings, setSettingsState] = useState(getSettings());

  // Trạng thái kiểm tra & tải OTA In-App
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [updateChecked, setUpdateChecked] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [downloadFinished, setDownloadFinished] = useState(false);
  
  const downloadCanceledRef = useRef(false);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    triggerHapticLight();
    const updated = { ...settings, [key]: !settings[key] };
    setSettingsState(updated);
    saveSettings(updated);
    onSettingsUpdated?.(updated);
  };

  const handleVolumeChange = (val) => {
    const updated = { ...settings, soundVolume: parseFloat(val) };
    setSettingsState(updated);
    saveSettings(updated);
    onSettingsUpdated?.(updated);
  };

  const handleRepoChange = (val) => {
    const updated = { ...settings, repoUrl: val.trim() };
    setSettingsState(updated);
    saveSettings(updated);
    onSettingsUpdated?.(updated);
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
        new Promise(resolve => setTimeout(resolve, 600)) // Giảm nhấp nháy UI
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl bg-[#080d14] border border-cyan-500/20 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-900/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Cài Đặt & Cập Nhật</h2>
              <p className="text-xs text-cyan-300/60">Tùy biến âm thanh, xúc giác & OTA TrollStore</p>
            </div>
          </div>
          <button
            onClick={() => { triggerHapticLight(); onClose(); }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* 1. CÀI ĐẶT ÂM THANH & RUNG */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/5 space-y-3.5">
            <span className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              Âm Thanh & Phản Hồi Xúc Giác
            </span>

            {/* Bật / Tắt âm thanh */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <span className="block text-sm font-semibold text-white">Âm Thanh Dẫn Nhịp & Chuông</span>
                  <span className="block text-[11px] text-slate-400">Tiếng gió hít thở, Chuông Tây Tạng</span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('soundEnabled')}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                  settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Thanh trượt âm lượng */}
            {settings.soundEnabled && (
              <div className="space-y-1 pt-1 border-t border-white/5">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Âm Lượng</span>
                  <span className="font-mono text-cyan-300 font-bold">{Math.round(settings.soundVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.soundVolume}
                  onChange={(e) => handleVolumeChange(e.target.value)}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}

            {/* Sóng thiền Alpha Drone */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <Waves className="w-4 h-4 text-teal-400" />
                <div>
                  <span className="block text-sm font-semibold text-white">Sóng Não Alpha Khi Nín Thở</span>
                  <span className="block text-[11px] text-slate-400">Âm nền tĩnh tại hạ nhịp tim</span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('ambientDroneEnabled')}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                  settings.ambientDroneEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  settings.ambientDroneEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Rung Taptic Engine */}
            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <Vibrate className="w-4 h-4 text-purple-400" />
                <div>
                  <span className="block text-sm font-semibold text-white">Rung Xúc Giác Haptics</span>
                  <span className="block text-[11px] text-slate-400">Apple Taptic Engine theo đỉnh nhịp</span>
                </div>
              </div>
              <button
                onClick={() => handleToggle('hapticsEnabled')}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                  settings.hapticsEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  settings.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* 2. CẬP NHẬT OTA TRỰC TIẾP & TROLLSTORE */}
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-cyan-500/20 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                Cập Nhật OTA & TrollStore
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 font-mono text-[10px]">
                v{APP_VERSION}
              </span>
            </div>

            {/* Nhập GitHub Repository */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Repository GitHub Cập Nhật:</label>
              <input
                type="text"
                value={settings.repoUrl || ''}
                onChange={(e) => handleRepoChange(e.target.value)}
                placeholder="VD: tuaniuminh/hittho"
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Nút kiểm tra cập nhật */}
            <button
              onClick={handleCheckUpdate}
              disabled={checkingUpdate || isDownloading}
              className="w-full py-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-200 font-semibold text-xs hover:bg-cyan-900/50 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
              <span>{checkingUpdate ? 'Đang kiểm tra Releases...' : 'Kiểm Tra Bản Cập Nhật Mới'}</span>
            </button>

            {/* Kết quả kiểm tra */}
            {updateChecked && updateInfo && (
              <div className="pt-2 animate-fade-in space-y-2">
                {updateInfo.hasUpdate ? (
                  <div className="p-3.5 rounded-xl bg-cyan-950/50 border border-cyan-400/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Có Bản Phát Hành Mới: {updateInfo.tagName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {updateInfo.ipaSize ? `${(updateInfo.ipaSize / 1024 / 1024).toFixed(1)} MB` : ''}
                      </span>
                    </div>

                    {updateInfo.body && (
                      <p className="text-[11px] text-slate-300/80 bg-black/30 p-2 rounded-lg leading-relaxed whitespace-pre-line max-h-24 overflow-y-auto">
                        {updateInfo.body}
                      </p>
                    )}

                    {/* Tiến trình tải IPA */}
                    {isDownloading && downloadProgress && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] font-mono text-cyan-300">
                          <span>{downloadProgress.downloadedMB} / {downloadProgress.totalMB} MB</span>
                          <span>{downloadProgress.speed} ({Math.round(downloadProgress.progress * 100)}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-cyan-500/20">
                          <div 
                            className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300"
                            style={{ width: `${Math.round(downloadProgress.progress * 100)}%` }}
                          />
                        </div>
                        <button
                          onClick={handleCancelDownload}
                          className="text-[10px] text-red-400 hover:underline pt-0.5"
                        >
                          Hủy tải bản cập nhật
                        </button>
                      </div>
                    )}

                    {downloadFinished && (
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Đã mở Share Sheet! Chạm vào TrollStore để cài đè 1-chạm.</span>
                      </div>
                    )}

                    {downloadError && (
                      <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{downloadError}</span>
                      </div>
                    )}

                    {!isDownloading && !downloadFinished && (
                      <button
                        onClick={handleStartDownloadIPA}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-black font-bold text-xs shadow-ice-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải IPA & Mở TrollStore</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 text-slate-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{updateInfo.message || 'Bạn đang ở phiên bản mới nhất!'}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. THÔNG TIN ỨNG DỤNG */}
          <div className="text-center py-2 space-y-1 text-slate-500 text-[11px]">
            <p className="text-slate-400 font-semibold">Hít Thở • Wim Hof Method Mobile</p>
            <p>Xây dựng bằng React 18, Vite, Tailwind CSS & Native Swift</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

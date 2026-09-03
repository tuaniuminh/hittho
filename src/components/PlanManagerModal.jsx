import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Clock, 
  Wind, 
  Flame, 
  Layers, 
  Sparkles, 
  Edit3,
  ChevronRight
} from 'lucide-react';
import { 
  getAllPlans, 
  getActivePlan, 
  setActivePlanId, 
  saveCustomPlan, 
  deleteCustomPlan 
} from '../services/storageService';
import { triggerHapticLight, triggerHapticMedium, triggerHapticSuccess } from '../utils/hapticsUtils';

const PlanManagerModal = ({ isOpen, onClose, onPlanSelected }) => {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'builder' | 'custom'
  const [activePlan, setActivePlanState] = useState(getActivePlan());
  const [allPlans, setAllPlansState] = useState(getAllPlans());

  // Form tạo giáo án tùy chỉnh
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [roundsCount, setRoundsCount] = useState(3);
  const [roundsConfig, setRoundsConfig] = useState([
    { roundNumber: 1, breaths: 30, speed: 'normal', targetRetention: 60, recoveryHold: 15 },
    { roundNumber: 2, breaths: 30, speed: 'normal', targetRetention: 90, recoveryHold: 15 },
    { roundNumber: 3, breaths: 30, speed: 'normal', targetRetention: 120, recoveryHold: 15 }
  ]);

  if (!isOpen) return null;

  const refreshData = () => {
    const plans = getAllPlans();
    setAllPlansState(plans);
    setActivePlanState(getActivePlan());
  };

  const handleSelectPlan = (plan) => {
    triggerHapticSuccess();
    setActivePlanId(plan.id);
    setActivePlanState(plan);
    onPlanSelected?.(plan);
    onClose();
  };

  const handleRoundsCountChange = (count) => {
    const newCount = Math.max(1, Math.min(6, count));
    setRoundsCount(newCount);
    
    setRoundsConfig(prev => {
      const updated = [...prev];
      if (newCount > updated.length) {
        for (let i = updated.length; i < newCount; i++) {
          const lastTarget = updated[updated.length - 1]?.targetRetention || 60;
          updated.push({
            roundNumber: i + 1,
            breaths: 30,
            speed: 'normal',
            targetRetention: Math.min(300, lastTarget + 30),
            recoveryHold: 15
          });
        }
      } else if (newCount < updated.length) {
        return updated.slice(0, newCount);
      }
      return updated;
    });
  };

  const updateRoundConfig = (index, field, value) => {
    setRoundsConfig(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSaveCustomPlan = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;

    triggerHapticSuccess();
    const newPlan = saveCustomPlan({
      name: customName.trim(),
      desc: customDesc.trim() || 'Giáo án tùy chỉnh cá nhân',
      rounds: roundsConfig
    });

    refreshData();
    onPlanSelected?.(newPlan);
    onClose();
  };

  const handleDeletePlan = (e, planId) => {
    e.stopPropagation();
    triggerHapticMedium();
    deleteCustomPlan(planId);
    refreshData();
  };

  const formatSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m > 0 ? `${m}p` : ''}${s > 0 ? `${s}s` : ''}` || '0s';
  };

  const presetPlans = allPlans.filter(p => p.level !== 'custom');
  const customPlans = allPlans.filter(p => p.level === 'custom');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl bg-[#080d14] border border-cyan-500/20 shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-900/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">Giáo Án Luyện Thở</h2>
              <p className="text-xs text-cyan-300/60">Tùy biến nhịp thở & mục tiêu nín thở</p>
            </div>
          </div>
          <button
            onClick={() => { triggerHapticLight(); onClose(); }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex px-4 pt-3 gap-2 border-b border-white/5 bg-black/20">
          <button
            onClick={() => { triggerHapticLight(); setActiveTab('presets'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'presets'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cấp Độ Chuẩn ({presetPlans.length})
          </button>
          <button
            onClick={() => { triggerHapticLight(); setActiveTab('builder'); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
              activeTab === 'builder'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            + Tạo Giáo Án Mới
          </button>
          {customPlans.length > 0 && (
            <button
              onClick={() => { triggerHapticLight(); setActiveTab('custom'); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                activeTab === 'custom'
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Của Tôi ({customPlans.length})
            </button>
          )}
        </div>

        {/* MODAL BODY (SCROLLABLE) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: GIÁO ÁN CẤP ĐỘ CHUẨN */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              {presetPlans.map((plan) => {
                const isSelected = activePlan?.id === plan.id;
                const totalBreaths = plan.rounds.reduce((acc, r) => acc + r.breaths, 0);

                return (
                  <div
                    key={plan.id}
                    onClick={() => handleSelectPlan(plan)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-ice-glow'
                        : 'border-white/10 bg-slate-900/40 hover:border-cyan-500/40 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            plan.level === 'beginner' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : plan.level === 'intermediate'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {plan.badge}
                          </span>
                          <h3 className="text-base font-bold text-white">{plan.name}</h3>
                        </div>
                        <p className="text-xs text-slate-300/80 leading-relaxed pr-6">{plan.desc}</p>
                      </div>

                      {isSelected && (
                        <div className="p-1 rounded-full bg-cyan-400 text-black">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Danh sách các hiệp & mốc nín thở */}
                    <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                      {plan.rounds.map((r) => (
                        <div key={r.roundNumber} className="p-2 rounded-xl bg-black/40 border border-white/5">
                          <span className="block text-[10px] font-semibold text-cyan-400">Hiệp {r.roundNumber}</span>
                          <span className="block text-xs font-mono font-bold text-white mt-0.5">
                            {formatSeconds(r.targetRetention)}
                          </span>
                          <span className="block text-[9px] text-slate-400 mt-0.5">{r.breaths} nhịp</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-300/70">
                      <span>Tổng: {plan.rounds.length} hiệp • {totalBreaths} nhịp thở</span>
                      <span className="font-semibold text-cyan-400">
                        {isSelected ? '✓ Đang kích hoạt' : 'Chạm để chọn →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: TỰ TẠO GIÁO ÁN MỚI */}
          {activeTab === 'builder' && (
            <form onSubmit={handleSaveCustomPlan} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                    Tên Giáo Án
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="VD: Rèn Luyện Sáng Sớm / Vượt Ngưỡng 3 Phút"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-cyan-500/30 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider mb-1">
                    Mô Tả Ngắn
                  </label>
                  <input
                    type="text"
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value)}
                    placeholder="Mục tiêu hoặc lưu ý khi thực hiện"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                {/* Số hiệp */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                      Số Hiệp: <span className="font-mono text-cyan-400 text-sm font-bold">{roundsCount} Hiệp</span>
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => { triggerHapticLight(); handleRoundsCountChange(num); }}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            roundsCount === num 
                              ? 'bg-cyan-500 text-black shadow-ice-glow' 
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Danh sách thiết lập từng hiệp */}
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Thiết Lập Nhịp Thở & Mục Tiêu Nín Thở Từng Hiệp
                  </span>

                  {roundsConfig.map((round, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-2xl bg-black/40 border border-cyan-900/40 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Wind className="w-3.5 h-3.5" />
                          Hiệp {round.roundNumber}
                        </span>
                        <span className="font-mono text-cyan-400">
                          Mục tiêu nín: {formatSeconds(round.targetRetention)}
                        </span>
                      </div>

                      {/* Slider nín thở */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-slate-400">
                          <span>Thời gian nín thở mục tiêu</span>
                          <span className="font-mono text-cyan-300 font-bold">{round.targetRetention}s ({formatSeconds(round.targetRetention)})</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="300"
                          step="5"
                          value={round.targetRetention}
                          onChange={(e) => updateRoundConfig(idx, 'targetRetention', parseInt(e.target.value))}
                          className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Chọn số nhịp thở & tốc độ */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-1">Số nhịp thở</span>
                          <select
                            value={round.breaths}
                            onChange={(e) => updateRoundConfig(idx, 'breaths', parseInt(e.target.value))}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white font-mono"
                          >
                            <option value={20}>20 nhịp</option>
                            <option value={25}>25 nhịp</option>
                            <option value={30}>30 nhịp</option>
                            <option value={35}>35 nhịp</option>
                            <option value={40}>40 nhịp</option>
                            <option value={50}>50 nhịp</option>
                          </select>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-1">Tốc độ thở</span>
                          <select
                            value={round.speed}
                            onChange={(e) => updateRoundConfig(idx, 'speed', e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-white"
                          >
                            <option value="slow">Chậm (4.0s)</option>
                            <option value="normal">Chuẩn (2.5s)</option>
                            <option value="fast">Nhanh (1.8s)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 font-bold text-black text-sm tracking-wide shadow-ice-glow hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  Lưu & Bắt Đầu Tập Giáo Án Này
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: GIÁO ÁN TÙY CHỈNH CỦA TÔI */}
          {activeTab === 'custom' && (
            <div className="space-y-3">
              {customPlans.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Sparkles className="w-8 h-8 mx-auto text-cyan-400/50" />
                  <p className="text-sm">Bạn chưa tạo giáo án tùy chỉnh nào.</p>
                </div>
              ) : (
                customPlans.map((plan) => {
                  const isSelected = activePlan?.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-purple-400 bg-purple-950/40 shadow-ice-glow'
                          : 'border-white/10 bg-slate-900/40 hover:border-purple-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Tùy Chỉnh
                          </span>
                          <h3 className="text-base font-bold text-white mt-1">{plan.name}</h3>
                          <p className="text-xs text-slate-300/70">{plan.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleDeletePlan(e, plan.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Xóa giáo án"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          {isSelected && (
                            <div className="p-1 rounded-full bg-purple-400 text-black">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                        {plan.rounds.map((r) => (
                          <div key={r.roundNumber} className="p-2 rounded-xl bg-black/40 border border-white/5">
                            <span className="block text-[10px] text-purple-300">Hiệp {r.roundNumber}</span>
                            <span className="block text-xs font-mono font-bold text-white">
                              {formatSeconds(r.targetRetention)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PlanManagerModal;

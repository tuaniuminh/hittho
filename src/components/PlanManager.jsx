import React, { useState } from 'react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Wind, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Clock
} from 'lucide-react';
import { 
  getAllPlans, 
  getActivePlan, 
  saveActivePlan, 
  saveCustomPlan, 
  deleteCustomPlan 
} from '../services/storageService';
import { triggerHapticLight, triggerHapticMedium, triggerHapticSuccess } from '../utils/hapticsUtils';

const PlanManager = ({ onSelectPlan }) => {
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'builder' | 'custom'
  const [activePlan, setActivePlanState] = useState(getActivePlan());
  const [allPlans, setAllPlansState] = useState(getAllPlans());

  // Form tạo giáo án
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [roundsCount, setRoundsCount] = useState(3);
  const [roundsConfig, setRoundsConfig] = useState([
    { roundNumber: 1, breaths: 30, speed: 'normal', targetRetention: 60, recoveryHold: 15 },
    { roundNumber: 2, breaths: 30, speed: 'normal', targetRetention: 90, recoveryHold: 15 },
    { roundNumber: 3, breaths: 30, speed: 'normal', targetRetention: 120, recoveryHold: 15 }
  ]);

  const refreshData = () => {
    const plans = getAllPlans();
    setAllPlansState(plans);
    setActivePlanState(getActivePlan());
  };

  const handleSelectPlan = (plan) => {
    triggerHapticSuccess();
    saveActivePlan(plan);
    setActivePlanState(plan);
    onSelectPlan?.(plan);
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
    onSelectPlan?.(newPlan);
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
    <div className="w-full max-w-lg mx-auto px-4 py-4 pb-28 space-y-4">
      
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Giáo Án Luyện Thở
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Lựa chọn cấp độ phù hợp hoặc tự thiết lập thời gian nín thở từng hiệp
        </p>
      </div>

      {/* SUB-TABS */}
      <div className="flex p-1 rounded-2xl bg-slate-200/70 dark:bg-white/5 border border-slate-300/40 dark:border-white/5">
        <button
          onClick={() => { triggerHapticLight(); setActiveTab('presets'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'presets'
              ? 'bg-white dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Cấp Độ ({presetPlans.length})
        </button>
        <button
          onClick={() => { triggerHapticLight(); setActiveTab('builder'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'builder'
              ? 'bg-white dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          + Tạo Mới
        </button>
        {customPlans.length > 0 && (
          <button
            onClick={() => { triggerHapticLight(); setActiveTab('custom'); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'custom'
                ? 'bg-white dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Của Tôi ({customPlans.length})
          </button>
        )}
      </div>

      {/* TAB 1: CẤP ĐỘ CHUẨN */}
      {activeTab === 'presets' && (
        <div className="space-y-3.5">
          {presetPlans.map((plan) => {
            const isSelected = activePlan?.id === plan.id;
            const totalBreaths = plan.rounds.reduce((acc, r) => acc + r.breaths, 0);

            return (
              <div
                key={plan.id}
                onClick={() => handleSelectPlan(plan)}
                className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 shadow-md dark:shadow-ice-glow'
                    : 'border-slate-200 dark:border-white/5 bg-white dark:bg-darkCard hover:border-cyan-400/50 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        plan.level === 'beginner' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30'
                          : plan.level === 'intermediate'
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                      }`}>
                        {plan.badge}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{plan.name}</h3>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300/80 leading-relaxed pr-4">{plan.desc}</p>
                  </div>

                  {isSelected ? (
                    <div className="p-1.5 rounded-full bg-cyan-500 text-white dark:text-black shadow-sm">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="text-slate-400 dark:text-slate-600">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Danh sách các hiệp & mốc nín thở */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/5 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                  {plan.rounds.map((r) => (
                    <div key={r.roundNumber} className="p-2 rounded-2xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                      <span className="block text-[10px] font-bold text-cyan-700 dark:text-cyan-400">Hiệp {r.roundNumber}</span>
                      <span className="block text-xs font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {formatSeconds(r.targetRetention)}
                      </span>
                      <span className="block text-[9px] text-slate-500 mt-0.5">{r.breaths} nhịp</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-cyan-300/70">
                  <span>Tổng: {plan.rounds.length} hiệp • {totalBreaths} nhịp thở</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">
                    {isSelected ? '✓ Đang áp dụng' : 'Chạm để chọn tập →'}
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
          <div className="p-4 rounded-3xl bg-white dark:bg-darkCard border border-slate-200 dark:border-white/5 shadow-sm space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-cyan-300 uppercase tracking-wider mb-1">
                Tên Giáo Án
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="VD: Rèn Luyện Sáng Sớm / Thử Thách 3 Phút"
                required
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-cyan-300 uppercase tracking-wider mb-1">
                Mô Tả Ngắn
              </label>
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Mục tiêu hoặc lưu ý khi thực hiện"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Chọn số hiệp */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-cyan-300 uppercase tracking-wider">
                  Số Hiệp: <span className="font-mono text-cyan-600 dark:text-cyan-400 text-sm font-bold">{roundsCount} Hiệp</span>
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => { triggerHapticLight(); handleRoundsCountChange(num); }}
                      className={`w-7 h-7 rounded-xl text-xs font-bold transition-all ${
                        roundsCount === num 
                          ? 'bg-cyan-500 text-white dark:text-black shadow-sm' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
              <span className="block text-xs font-bold text-slate-700 dark:text-cyan-300 uppercase tracking-wider">
                Thiết Lập Nhịp Thở & Mục Tiêu Nín Thở Từng Hiệp
              </span>

              {roundsConfig.map((round, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-1 text-cyan-700 dark:text-cyan-300">
                      <Wind className="w-3.5 h-3.5" />
                      Hiệp {round.roundNumber}
                    </span>
                    <span className="font-mono text-cyan-600 dark:text-cyan-400">
                      Mục tiêu nín: {formatSeconds(round.targetRetention)}
                    </span>
                  </div>

                  {/* Slider nín thở */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>Thời gian nín thở mục tiêu</span>
                      <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">{round.targetRetention}s ({formatSeconds(round.targetRetention)})</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="300"
                      step="5"
                      value={round.targetRetention}
                      onChange={(e) => updateRoundConfig(idx, 'targetRetention', parseInt(e.target.value))}
                      className="w-full accent-cyan-500 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  {/* Số nhịp & Tốc độ */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Số nhịp thở</span>
                      <select
                        value={round.breaths}
                        onChange={(e) => updateRoundConfig(idx, 'breaths', parseInt(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white font-mono"
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
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 mb-1">Tốc độ thở</span>
                      <select
                        value={round.speed}
                        onChange={(e) => updateRoundConfig(idx, 'speed', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
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

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 font-extrabold text-white dark:text-black text-sm tracking-wide shadow-md hover:brightness-105 active:scale-[0.98] transition-all"
          >
            Lưu & Áp Dụng Giáo Án Này
          </button>
        </form>
      )}

      {/* TAB 3: GIÁO ÁN CỦA TÔI */}
      {activeTab === 'custom' && (
        <div className="space-y-3.5">
          {customPlans.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-cyan-500/40" />
              <p className="text-sm">Bạn chưa tạo giáo án tùy chỉnh nào.</p>
            </div>
          ) : (
            customPlans.map((plan) => {
              const isSelected = activePlan?.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => handleSelectPlan(plan)}
                  className={`relative p-4 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 shadow-md'
                      : 'border-slate-200 dark:border-white/5 bg-white dark:bg-darkCard hover:border-purple-400/50 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                        Tùy Chỉnh
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{plan.name}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300/70">{plan.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleDeletePlan(e, plan.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Xóa giáo án"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isSelected && (
                        <div className="p-1.5 rounded-full bg-purple-500 text-white shadow-sm">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-white/5 grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
                    {plan.rounds.map((r) => (
                      <div key={r.roundNumber} className="p-2 rounded-2xl bg-slate-100/80 dark:bg-black/40 border border-slate-200 dark:border-white/5">
                        <span className="block text-[10px] font-bold text-purple-700 dark:text-purple-300">Hiệp {r.roundNumber}</span>
                        <span className="block text-xs font-mono font-extrabold text-slate-900 dark:text-white">
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
  );
};

export default PlanManager;


import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ProteinChart from './components/ProteinChart';
import { MilkPowder, IntakeLog } from './types';
import { INITIAL_MILK_POWDERS, PROTEIN_FORMULA_COEFF_1, PROTEIN_FORMULA_COEFF_2 } from './constants';

const App = () => {
  // Load milk powders from localStorage or use initial values
  const [milkPowders, setMilkPowders] = useState<MilkPowder[]>(() => {
    const saved = localStorage.getItem('milk_powders');
    return saved ? JSON.parse(saved) : INITIAL_MILK_POWDERS;
  });

  const [weightJin, setWeightJin] = useState<number>(30);
  const [logs, setLogs] = useState<IntakeLog[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // New powder form state
  const [newPowder, setNewPowder] = useState<Omit<MilkPowder, 'id'>>({
    name: '',
    proteinPercentage: 15,
    unitWeight: 5,
    unitName: '勺'
  });

  // Persist milk powders to localStorage
  useEffect(() => {
    localStorage.setItem('milk_powders', JSON.stringify(milkPowders));
  }, [milkPowders]);

  // Sync logs when milk powders change
  useEffect(() => {
    setLogs(prev => {
      const newLogs = [...prev];
      milkPowders.forEach(p => {
        if (!newLogs.find(l => l.productId === p.id)) {
          newLogs.push({ productId: p.id, quantity: 0 });
        }
      });
      return newLogs;
    });
  }, [milkPowders]);

  const dailyTarget = useMemo(() => {
    const weightKg = weightJin / 2;
    return Number((weightKg * PROTEIN_FORMULA_COEFF_1 * PROTEIN_FORMULA_COEFF_2).toFixed(2));
  }, [weightJin]);

  const totalIntake = useMemo(() => {
    return logs.reduce((acc, log) => {
      const powder = milkPowders.find(p => p.id === log.productId);
      if (!powder) return acc;
      const proteinPerUnit = (powder.unitWeight * powder.proteinPercentage) / 100;
      return acc + (log.quantity * proteinPerUnit);
    }, 0);
  }, [logs, milkPowders]);

  const updateQuantity = (productId: string, delta: number) => {
    setLogs(prev => prev.map(log => {
      if (log.productId === productId) {
        const nextVal = Math.max(0, log.quantity + delta);
        return { ...log, quantity: Number(nextVal.toFixed(1)) };
      }
      return log;
    }));
  };

  const handleManualQuantityChange = (productId: string, value: string) => {
    const num = parseFloat(value);
    setLogs(prev => prev.map(log => {
      if (log.productId === productId) {
        return { ...log, quantity: isNaN(num) ? 0 : Math.max(0, num) };
      }
      return log;
    }));
  };

  const handleAddPowder = () => {
    if (!newPowder.name.trim()) return;
    const id = `custom-${Date.now()}`;
    const newItem: MilkPowder = { ...newPowder, id };
    setMilkPowders(prev => [...prev, newItem]);
    setIsAdding(false);
    setNewPowder({ name: '', proteinPercentage: 15, unitWeight: 5, unitName: '勺' });
  };

  const removePowder = (id: string) => {
    if (window.confirm('确定要删除这种奶粉规格吗？')) {
      setMilkPowders(prev => prev.filter(p => p.id !== id));
      setLogs(prev => prev.filter(l => l.productId !== id));
    }
  };

  const resetLogs = () => {
    if (window.confirm('确定要重置今日所有摄入记录吗？')) {
      setLogs(prev => prev.map(log => ({ ...log, quantity: 0 })));
    }
  };

  return (
    <div className="min-h-screen pb-36 bg-slate-50">
      <Header />
      
      <main className="max-w-xl mx-auto px-4 mt-8 space-y-8">
        {/* Weight Input Section */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/></svg>
              身体数据 (1kg = 2斤)
            </h2>
          </div>
          <div className="flex flex-col space-y-3">
            <label className="text-base font-semibold text-slate-600">当前体重 (单位：斤)</label>
            <div className="relative">
              <input 
                type="number" 
                value={weightJin}
                onChange={(e) => setWeightJin(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all rounded-2xl px-6 py-4 text-3xl font-bold text-slate-800 outline-none"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">斤</span>
            </div>
          </div>
        </section>

        {/* Dashboard Section */}
        <section className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-blue-100 text-sm font-bold uppercase tracking-widest">每日目标</p>
              <h3 className="text-5xl font-black tracking-tight mt-1">{dailyTarget}<span className="text-xl font-normal opacity-70 ml-1">g</span></h3>
            </div>
            <button onClick={resetLogs} className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 shadow-lg" title="重置今日记录">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex-1 space-y-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                <p className="text-blue-100 text-xs mb-1 uppercase tracking-widest font-bold">累计摄入量</p>
                <p className="text-3xl font-bold">{totalIntake.toFixed(2)} <span className="text-sm font-normal opacity-70">g</span></p>
                <div className="mt-3 w-full bg-white/20 rounded-full h-2 overflow-hidden">
                  <div className="bg-white h-full transition-all duration-500 rounded-full" style={{ width: `${Math.min((totalIntake / dailyTarget) * 100, 100)}%` }}></div>
                </div>
              </div>
            </div>
            <div className="shrink-0 scale-110">
               <ProteinChart current={totalIntake} target={dailyTarget} />
            </div>
          </div>
        </section>

        {/* Add New Powder Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">奶粉规格</h2>
            <button 
              onClick={() => setIsAdding(!isAdding)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-bold transition-all ${isAdding ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-300 ${isAdding ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
              {isAdding ? '取消' : '添加规格'}
            </button>
          </div>

          {isAdding && (
            <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-blue-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">奶粉名称</label>
                  <input 
                    type="text" 
                    placeholder="例如: 澳洲A2" 
                    className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={newPowder.name}
                    onChange={e => setNewPowder({...newPowder, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">蛋白含量 (每100g含多少g)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={newPowder.proteinPercentage}
                    onChange={e => setNewPowder({...newPowder, proteinPercentage: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">单次重量 (g)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={newPowder.unitWeight}
                    onChange={e => setNewPowder({...newPowder, unitWeight: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase mb-2 block tracking-wider">单位名称</label>
                  <select 
                    className="w-full bg-slate-50 rounded-2xl px-5 py-3 text-lg outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none font-medium"
                    value={newPowder.unitName}
                    onChange={e => setNewPowder({...newPowder, unitName: e.target.value})}
                  >
                    <option value="勺">勺</option>
                    <option value="袋">袋</option>
                    <option value="克">克</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleAddPowder}
                    className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-[0.98]"
                  >
                    保存并使用
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5">
            {milkPowders.map((powder) => {
              const log = logs.find(l => l.productId === powder.id);
              const count = log?.quantity || 0;
              const proteinPerUnit = ((powder.unitWeight * powder.proteinPercentage) / 100).toFixed(2);

              return (
                <div key={powder.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                  <div className="space-y-2 relative pr-4">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-slate-800 text-lg tracking-tight">{powder.name}</h4>
                      {!INITIAL_MILK_POWDERS.find(p => p.id === powder.id) && (
                        <button onClick={() => removePowder(powder.id)} className="text-slate-300 hover:text-red-400 transition-colors p-1" title="删除该规格">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                       <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">
                        {powder.proteinPercentage}% 蛋白
                      </span>
                      <span className="text-xs bg-slate-50 text-slate-500 px-3 py-1 rounded-full font-medium">
                        1{powder.unitName} ≈ {powder.unitWeight}g
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 font-medium">
                      每{powder.unitName}含 <span className="text-blue-600 font-bold">{proteinPerUnit}g</span> 蛋白
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(powder.id, -0.2)} 
                      className="w-10 h-10 rounded-xl bg-white shadow-sm flex flex-col items-center justify-center text-slate-400 hover:text-red-500 transition-all active:scale-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" /></svg>
                      <span className="text-[9px] font-black mt-[-1px]">0.2</span>
                    </button>
                    
                    <div className="relative">
                      <input 
                        type="number" 
                        step="0.1"
                        value={count === 0 ? '' : count}
                        onChange={(e) => handleManualQuantityChange(powder.id, e.target.value)}
                        placeholder="0"
                        className="w-14 bg-white border border-slate-200 rounded-lg py-1.5 text-center font-black text-slate-800 text-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <button 
                      onClick={() => updateQuantity(powder.id, 0.2)} 
                      className="w-10 h-10 rounded-xl bg-blue-600 shadow-sm flex flex-col items-center justify-center text-white hover:bg-blue-700 transition-all active:scale-90"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" /></svg>
                      <span className="text-[9px] font-black mt-[-1px]">0.2</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Summary Details */}
        <section className="bg-slate-100/50 rounded-3xl p-8 border border-dashed border-slate-300">
           <h4 className="text-base font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-widest">今日摄入明细报表</h4>
           <div className="space-y-4">
             {logs.map(log => {
               if (log.quantity === 0) return null;
               const powder = milkPowders.find(p => p.id === log.productId);
               if (!powder) return null;
               const protein = (log.quantity * powder.unitWeight * powder.proteinPercentage) / 100;
               return (
                 <div key={log.productId} className="flex justify-between text-base">
                   <span className="text-slate-600 font-medium">{powder.name} ({log.quantity.toFixed(1)}{powder.unitName})</span>
                   <span className="font-bold text-slate-800 tabular-nums">{protein.toFixed(2)} g</span>
                 </div>
               );
             })}
             {totalIntake === 0 && <p className="text-slate-400 text-base italic text-center py-4">暂无摄入记录，请在上方点击加号记录</p>}
           </div>
        </section>

        {/* Info Section */}
        <section className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
           <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
             使用须知与公式
           </h4>
           <div className="space-y-3 text-sm text-blue-700 font-medium leading-relaxed">
             <p>• <strong>计算公式</strong>：每日蛋白质 = 体重(kg) × 2.1 × 0.8</p>
             <p>• <strong>单位转换</strong>：系统已自动将输入的“斤”转换为“kg”进行科学计算。</p>
             <p>• <strong>高精调节</strong>：支持 0.2 粒度精细加减，也支持点击数字框直接输入实际摄入量。</p>
             <p>• <strong>数据安全</strong>：所有自定义规格和记录均仅保存在本地浏览器中。</p>
           </div>
        </section>
      </main>

      {/* Footer Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-6 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] z-40 rounded-t-[2.5rem]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">今日达成率</span>
              <span className="text-2xl font-black text-blue-600 tracking-tight">{totalIntake.toFixed(2)} <span className="text-sm font-medium text-slate-400 ml-1">/ {dailyTarget} g</span></span>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-base font-black text-slate-600">{((totalIntake / dailyTarget) * 100).toFixed(0)}%</span>
              <div className="w-32 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out" style={{ width: `${Math.min((totalIntake / dailyTarget) * 100, 100)}%` }}></div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default App;

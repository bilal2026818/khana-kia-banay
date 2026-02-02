import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { AppScreen, Dish, WeeklySchedule, MealCategory, DayPlan, SuggestionResult } from './types';
import { INITIAL_DISHES, DAYS_OF_WEEK } from './constants';
import { getAiSuggestion } from './services/geminiService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dishes, setDishes] = useState<Dish[]>(() => {
    const saved = localStorage.getItem('kb_dishes');
    return saved ? JSON.parse(saved) : INITIAL_DISHES;
  });
  const [schedule, setSchedule] = useState<WeeklySchedule>(() => {
    const saved = localStorage.getItem('kb_schedule');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isNotifEnabled, setIsNotifEnabled] = useState(() => localStorage.getItem('kb_notif_enabled') === 'true');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDish, setViewingDish] = useState<Dish | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formState, setFormState] = useState({ 
    name: '', 
    category: 'Dinner' as MealCategory, 
    description: '',
    imageUrl: ''
  });

  const [isShuffling, setIsShuffling] = useState(false);
  const [suggestion, setSuggestion] = useState<SuggestionResult | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('kb_dishes', JSON.stringify(dishes));
  }, [dishes]);

  useEffect(() => {
    localStorage.setItem('kb_schedule', JSON.stringify(schedule));
  }, [schedule]);

  const getTodayDishName = () => {
    const today = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
    const dishId = schedule[today]?.Dinner;
    const dish = dishes.find(d => d.id === dishId);
    return dish ? dish.name : null;
  };

  const openAddModal = () => {
    setEditingDish(null);
    setFormState({ name: '', category: 'Dinner', description: '', imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, dish: Dish) => {
    e.stopPropagation(); 
    setEditingDish(dish);
    setFormState({ 
      name: dish.name, 
      category: dish.category, 
      description: dish.description || '',
      imageUrl: dish.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveDish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name.trim()) return;
    const finalImageUrl = formState.imageUrl || `https://picsum.photos/seed/${formState.name.replace(/\s+/g, '')}/400/300`;
    if (editingDish) {
      setDishes(dishes.map(d => 
        d.id === editingDish.id 
          ? { ...d, name: formState.name, category: formState.category, description: formState.description, imageUrl: finalImageUrl }
          : d
      ));
    } else {
      const dish: Dish = { id: Date.now().toString(), name: formState.name, category: formState.category, description: formState.description, tags: [], imageUrl: finalImageUrl };
      setDishes([...dishes, dish]);
    }
    setIsModalOpen(false);
    setEditingDish(null);
  };

  const handleDeleteDish = (e: React.MouseEvent, dishId: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this dish?")) {
      setDishes(dishes.filter(d => d.id !== dishId));
    }
  };

  const updateSchedule = (day: string, meal: keyof DayPlan, dishId: string) => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [meal]: dishId } }));
  };

  const autoFillSchedule = () => {
    if (dishes.length === 0) return;
    const newSchedule: WeeklySchedule = {};
    DAYS_OF_WEEK.forEach(day => {
      const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
      newSchedule[day] = { Dinner: randomDish.id };
    });
    setSchedule(newSchedule);
  };

  const clearSchedule = () => {
    if (window.confirm("Clear your entire weekly plan?")) setSchedule({});
  };

  const generateSuggestion = async () => {
    if (isOffline) {
      setSuggestion({ dish: dishes[Math.floor(Math.random() * dishes.length)], reason: "You're offline! Try again when connected to the internet." });
      setIsShuffling(false); // Ensure shuffling state is reset
      return;
    }
    if (dishes.length === 0) return;
    setIsShuffling(true);
    setSuggestion(null);
    try {
      const result = await getAiSuggestion(dishes);
      setSuggestion(result);
    } catch (error) {
      console.error("AI failed:", error);
      const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
      setSuggestion({ dish: randomDish, reason: "Manual choice: Perfect for a busy day!" });
    } finally {
      setIsShuffling(false);
    }
  };

  const today = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];
  const todayPlan = schedule[today];

  const renderHome = () => {
    const todayDishId = todayPlan?.Dinner;
    const todayDish = dishes.find(d => d.id === todayDishId);
    const plannedCount = (Object.values(schedule) as DayPlan[]).filter(day => day.Dinner).length;

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 safe-area-top">
        {isOffline && (
          <div className="bg-orange-500 rounded-2xl p-4 flex items-center gap-3 text-white shadow-lg animate-pulse">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/></svg>
            <p className="text-sm font-bold">Offline: Using stored data.</p>
          </div>
        )}

        <div>
          <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">Today's Menu</p>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-1">What's Cooking?</h2>
        </div>

        <div className="relative group cursor-pointer overflow-hidden rounded-[32px] shadow-2xl active:scale-[0.98] transition-all duration-300" onClick={() => todayDish ? setViewingDish(todayDish) : setScreen(AppScreen.PLANNER)}>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
          <img src={todayDish ? todayDish.imageUrl : 'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=800'} className="w-full h-[320px] object-cover group-hover:scale-110 transition-transform duration-700" alt="Today" />
          <div className="absolute bottom-8 left-8 right-8 z-20">
            <span className="bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Highlight</span>
            <h3 className="text-white text-3xl font-black mt-3 leading-tight">{todayDish ? todayDish.name : "Plan Your Day"}</h3>
            <p className="text-white/70 text-sm font-medium mt-1">{todayDish ? "View full recipe & notes" : "Tap here to decide what to cook"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setScreen(AppScreen.DISHES)} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-3 active:scale-95 transition-all text-left group">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Kitchen Library</p>
              <p className="text-xl font-black text-gray-800">{dishes.length} Dishes</p>
            </div>
          </button>
          <button onClick={() => setScreen(AppScreen.PLANNER)} className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 flex flex-col gap-3 active:scale-95 transition-all text-left group">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 7v5l3 3"/></svg>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Weekly Progress</p>
              <p className="text-xl font-black text-gray-800">{plannedCount}/7 Days</p>
            </div>
          </button>
        </div>
      </div>
    );
  };

  return (
    <Layout 
      activeScreen={screen} 
      onNavigate={setScreen} 
      title={screen === AppScreen.HOME ? "Khana Kia Banay" : screen === AppScreen.DISHES ? "My Dishes" : screen === AppScreen.PLANNER ? "Meal Planner" : "AI Suggest"} 
      isNotificationsEnabled={isNotifEnabled}
      isOffline={isOffline}
    >
      {screen === AppScreen.HOME && renderHome()}
      {screen === AppScreen.DISHES && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
          <div className="grid gap-4 mt-4">
            {dishes.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 7v5l3 3"/></svg>
                </div>
                <p className="text-gray-500 font-medium">Your library is empty. Add some dishes!</p>
              </div>
            )}
            {dishes.map(dish => (
              <div key={dish.id} onClick={() => setViewingDish(dish)} className="bg-white p-4 rounded-[24px] shadow-sm flex items-center gap-4 border border-gray-100 active:bg-orange-50 transition-all cursor-pointer group">
                <img src={dish.imageUrl} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt={dish.name} />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{dish.name}</h4>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-bold uppercase">{dish.category}</span>
                  </div>
                </div>
                <button onClick={(e) => openEditModal(e, dish)} className="p-3 text-gray-300 hover:text-orange-500"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                <button onClick={(e) => handleDeleteDish(e, dish.id)} className="p-3 text-gray-300 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"  viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg></button>

              </div>
            ))}
          </div>
        </div>
      )}
      {screen === AppScreen.PLANNER && (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500">
          <div className="bg-orange-600 rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <svg width="120" height="120" fill="currentColor" viewBox="0 0 24 24"><path d="M19 4H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
            </div>
            <h2 className="text-2xl font-black leading-tight">Plan your week in seconds.</h2>
            <button onClick={autoFillSchedule} className="mt-6 w-full bg-white text-orange-600 py-4 rounded-2xl font-black shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest">Magic Auto-Fill</button>
            <button onClick={clearSchedule} className="mt-3 w-full bg-orange-700/50 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest">Reset Schedule</button>
          </div>
          
          <div className="space-y-4">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className="bg-white p-5 rounded-[28px] shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="shrink-0 w-24">
                  <h3 className="font-black text-gray-800 text-sm uppercase tracking-tighter">{day}</h3>
                </div>
                <div className="flex-1 relative">
                  <select 
                    value={schedule[day]?.Dinner || ''} 
                    onChange={(e) => updateSchedule(day, 'Dinner', e.target.value)} 
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 rounded-2xl border-none font-bold text-gray-900 appearance-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Decide dinner...</option>
                    {dishes.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {screen === AppScreen.SUGGEST && (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
          {!suggestion ? (
            <div className="space-y-8 max-w-sm w-full">
              <div className={`relative w-40 h-40 mx-auto ${isShuffling ? 'animate-pulse-soft' : ''}`}>
                <div className="absolute inset-0 bg-orange-100 rounded-full animate-ping opacity-20" />
                <div className="relative w-40 h-40 bg-orange-50 rounded-full flex items-center justify-center shadow-inner border-8 border-white">
                  <span className="text-6xl">🥘</span>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900">Feeling Indecisive?</h2>
                {isOffline ? (
                  <p className="text-orange-600 font-bold">AI suggestions require an internet connection.</p>
                ) : (
                  <p className="text-gray-500 font-medium">Let Gemini AI pick the perfect meal from your library based on today's vibes.</p>
                )}
              </div>
              <button 
                disabled={isShuffling || dishes.length === 0 || isOffline} 
                onClick={generateSuggestion} 
                className="w-full py-6 bg-orange-600 text-white rounded-[24px] font-black text-lg shadow-2xl shadow-orange-200 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
              >
                {isShuffling ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Asking Gemini...</span>
                  </div>
                ) : "Ask for a Suggestion"}
              </button>
              {dishes.length === 0 && !isOffline && <p className="text-orange-600 text-xs font-bold">Add dishes to your library first!</p>}
              {isOffline && dishes.length > 0 && !suggestion && (
                <button
                  onClick={() => setSuggestion({ dish: dishes[Math.floor(Math.random() * dishes.length)], reason: "Random choice while offline!" })}
                  className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-xs uppercase tracking-widest active:bg-gray-100 transition-colors"
                >
                  Pick a Random Dish Offline
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-[40px] p-8 shadow-2xl text-left w-full max-w-md animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 space-y-8 border border-orange-50">
               <div className="flex items-center gap-5">
                  <div className="relative">
                    <img src={suggestion.dish.imageUrl} className="w-24 h-24 rounded-[24px] object-cover shadow-xl border-4 border-white" alt={suggestion.dish.name} />
                    <div className="absolute -top-2 -right-2 bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                  </div>
                  <div className="flex-1">
                     <p className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Gemini Recommends</p>
                     <h2 className="text-2xl font-black text-gray-900 leading-tight mt-1">{suggestion.dish.name}</h2>
                  </div>
               </div>
               <div className="p-6 bg-orange-50/50 rounded-3xl border border-orange-100/50 relative">
                  <div className="absolute -top-3 left-6 px-2 bg-white text-orange-600 text-[10px] font-black uppercase tracking-widest">Why this?</div>
                  <p className="text-orange-950 text-sm font-medium italic leading-relaxed">"{suggestion.reason}"</p>
               </div>
               <div className="flex flex-col gap-3">
                 <button onClick={() => { const updated = {...schedule}; updated[today] = { Dinner: suggestion.dish.id }; setSchedule(updated); setScreen(AppScreen.HOME); }} className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">Lock it for Today</button>
                 <button onClick={() => setSuggestion(null)} className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold text-xs uppercase tracking-widest active:bg-gray-100 transition-colors">Surprise me again</button>
               </div>
            </div>
          )}
        </div>
      )}

      <button onClick={openAddModal} className="fixed bottom-24 right-6 w-16 h-16 bg-orange-600 text-white rounded-2xl shadow-2xl z-50 flex items-center justify-center active:scale-90 active:rotate-90 transition-all shadow-orange-300">
        <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3.5"><line x1="16" y1="8" x2="16" y2="24"/><line x1="8" y1="16" x2="24" y2="16"/></svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] flex items-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)} />
          <form onSubmit={handleSaveDish} className="relative bg-white w-full rounded-t-[40px] p-8 pb-12 space-y-8 animate-in slide-in-from-bottom-full duration-500 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-center -mt-2"><div className="w-16 h-1.5 bg-gray-100 rounded-full" /></div>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900">{editingDish ? 'Refine Dish' : 'New Dish'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-300 hover:text-gray-900"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dish Name</label>
                <input required value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full p-5 bg-gray-50 rounded-[20px] font-bold text-gray-900 outline-none focus:ring-4 focus:ring-orange-100 border-none transition-all" placeholder="e.g. Peshawari Karahi" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image Link (Optional)</label>
                <input value={formState.imageUrl} onChange={e => setFormState({...formState, imageUrl: e.target.value})} className="w-full p-5 bg-gray-50 rounded-[20px] outline-none border-none text-sm text-gray-600 focus:ring-4 focus:ring-orange-100 transition-all" placeholder="https://unsplash.com/..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chef's Notes</label>
                <textarea value={formState.description} onChange={e => setFormState({...formState, description: e.target.value})} className="w-full p-5 bg-gray-50 rounded-[24px] min-h-[120px] outline-none border-none text-gray-800 focus:ring-4 focus:ring-orange-100 transition-all" placeholder="Tell us more about this dish..." />
              </div>
            </div>
            <button type="submit" className="w-full py-6 bg-orange-600 text-white rounded-[24px] font-black shadow-xl shadow-orange-100 active:scale-[0.98] transition-all uppercase tracking-widest">Save to Kitchen</button>
          </form>
        </div>
      )}

      {viewingDish && (
        <div className="fixed inset-0 left-1/2 -translate-x-1/2 w-full max-w-md z-[100] flex items-end">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-xl" onClick={() => setViewingDish(null)} />
          <div className="relative bg-white w-full rounded-t-[48px] overflow-hidden animate-in slide-in-from-bottom-full duration-500 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img src={viewingDish.imageUrl} className="w-full h-80 object-cover shadow-2xl" alt={viewingDish.name} />
              <button onClick={() => setViewingDish(null)} className="absolute top-6 right-6 bg-black/30 backdrop-blur-md text-white p-3 rounded-2xl"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>
            <div className="p-10 pb-16 space-y-6">
              <div className="space-y-2">
                <span className="text-orange-600 font-black text-[10px] uppercase tracking-widest">{viewingDish.category}</span>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-none">{viewingDish.name}</h2>
              </div>
              <div className="w-12 h-1 bg-orange-600 rounded-full" />
              <p className="text-gray-600 leading-relaxed font-medium text-lg italic">
                {viewingDish.description || "No specific notes provided for this dish. Just delicious!"}
              </p>
              <div className="flex gap-4 pt-8">
                <button onClick={(e) => { setViewingDish(null); openEditModal(e, viewingDish); }} className="flex-1 py-5 bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-100 uppercase tracking-widest text-xs">Edit Details</button>
                <button onClick={(e) => { setViewingDish(null); handleDeleteDish(e, viewingDish.id); }} className="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black shadow-lg shadow-red-100 uppercase tracking-widest text-xs">Delete Dish</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
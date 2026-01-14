
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { analyzeFood } from './services/geminiService';
import { FoodLogEntry, UserProfile, NutritionInfo } from './types';
import NutrientRing from './components/NutrientRing';
import { 
  Leaf, 
  Plus, 
  Camera, 
  Utensils, 
  TrendingUp, 
  Smile, 
  Wind, 
  Moon, 
  Zap,
  Trash2,
  CheckCircle2,
  X
} from 'lucide-react';

const App: React.FC = () => {
  const [logs, setLogs] = useState<FoodLogEntry[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [mood, setMood] = useState<FoodLogEntry['mood']>('balanced');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock user profile
  const [user] = useState<UserProfile>({
    name: 'Alex',
    dailyCalorieGoal: 2200,
    auraScore: 85
  });

  // Calculate daily totals
  const dailyTotal = logs.reduce((acc, log) => ({
    calories: acc.calories + log.nutrition.calories,
    protein: acc.protein + log.nutrition.protein,
    carbs: acc.carbs + log.nutrition.carbs,
    fat: acc.fat + log.nutrition.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setLoading(true);
    try {
      const result = await analyzeFood(textInput);
      const newEntry: FoodLogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        name: result.name,
        nutrition: result.nutrition,
        mood,
        description: textInput,
        insight: result.insight
      };
      setLogs([newEntry, ...logs]);
      setTextInput('');
      setIsLogging(false);
    } catch (error) {
      console.error("Failed to analyze food:", error);
      alert("Something went wrong. Let's try that again.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        const result = await analyzeFood({ data: base64Data, mimeType: file.type });
        
        const newEntry: FoodLogEntry = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
          name: result.name,
          image: reader.result as string,
          nutrition: result.nutrition,
          mood,
          description: "Logged via camera",
          insight: result.insight
        };
        setLogs([newEntry, ...logs]);
        setIsLogging(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Image analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeLog = (id: string) => {
    setLogs(logs.filter(l => l.id !== id));
  };

  return (
    <div className="min-h-screen pb-24 nature-gradient selection:bg-emerald-100">
      {/* Header */}
      <header className="px-6 py-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Leaf className="text-emerald-500 w-8 h-8" />
            AuraNutri <span className="text-emerald-600 font-light italic">AI</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Nurturing your body, mindfully.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/80 backdrop-blur rounded-full px-4 py-1.5 flex items-center gap-2 aura-glow border border-emerald-50">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-emerald-700 text-sm">{user.auraScore}%</span>
          </div>
          <img 
            src={`https://picsum.photos/seed/${user.name}/100`} 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            alt="Profile"
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 space-y-8">
        {/* Daily Summary Card */}
        <section className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 border border-white/40 shadow-xl aura-glow grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              Daily Aura <span className="text-emerald-500 text-sm font-normal bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Synchronized</span>
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">Calories</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-700">{Math.round(dailyTotal.calories)}</span>
                  <span className="text-slate-400 text-xs">/ {user.dailyCalorieGoal}</span>
                </div>
                <div className="w-full bg-emerald-200/30 h-1.5 rounded-full mt-2">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (dailyTotal.calories / user.dailyCalorieGoal) * 100)}%` }} 
                  />
                </div>
              </div>
              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Protein</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-700">{Math.round(dailyTotal.protein)}g</span>
                </div>
                <div className="w-full bg-amber-200/30 h-1.5 rounded-full mt-2">
                  <div className="bg-amber-500 h-full rounded-full w-1/2" />
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <NutrientRing protein={dailyTotal.protein} carbs={dailyTotal.carbs} fat={dailyTotal.fat} />
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Protein</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Carbs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">Fat</span>
              </div>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <section className="flex justify-center">
          <button 
            onClick={() => setIsLogging(true)}
            className="group relative bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg transition-all duration-300 flex items-center gap-3 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-6 h-6" />
            Log a Mindful Meal
          </button>
        </section>

        {/* Logs List */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">Recent Reflections</h3>
            <button className="text-emerald-600 text-sm font-semibold hover:underline">View History</button>
          </div>
          
          {logs.length === 0 ? (
            <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center">
              <Wind className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
              <p className="text-slate-500 font-medium">Your aura is clear. Log a meal to begin the reflection.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {logs.map(log => (
                <div key={log.id} className="bg-white/80 rounded-3xl p-6 shadow-sm border border-white aura-glow flex flex-col md:flex-row gap-6 items-start fluid-card">
                  {log.image ? (
                    <img src={log.image} className="w-full md:w-32 h-32 rounded-2xl object-cover shadow-sm" alt={log.name} />
                  ) : (
                    <div className="w-full md:w-32 h-32 bg-emerald-50 rounded-2xl flex items-center justify-center">
                      <Utensils className="text-emerald-200 w-10 h-10" />
                    </div>
                  )}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">{log.name}</h4>
                        <p className="text-slate-400 text-xs flex items-center gap-1">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="mx-1">•</span>
                          Logged with mindfulness
                        </p>
                      </div>
                      <button onClick={() => removeLog(log.id)} className="text-slate-300 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 italic text-slate-600 text-sm relative">
                      <span className="absolute -left-1 -top-1">✨</span>
                      "{log.insight}"
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {log.nutrition.calories} kcal
                      </span>
                      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                        {log.nutrition.protein}g Protein
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                        {log.nutrition.fat}g Fat
                      </span>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase border border-indigo-100">
                        Mood: {log.mood}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Logging Overlay */}
      {isLogging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsLogging(false)} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Add to Aura</h2>
                <button onClick={() => setIsLogging(false)} className="bg-slate-100 hover:bg-slate-200 p-2 rounded-xl text-slate-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700">Analyzing your choice...</p>
                    <p className="text-sm text-slate-500">Gemini is translating nutrition into mindfulness.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">How do you feel?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'energized', icon: Zap, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                        { id: 'content', icon: Smile, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                        { id: 'balanced', icon: Wind, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                        { id: 'heavy', icon: Moon, color: 'bg-slate-50 text-slate-600 border-slate-100' },
                        { id: 'lethargic', icon: Moon, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                        { id: 'uncertain', icon: Wind, color: 'bg-rose-50 text-rose-600 border-rose-100' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setMood(item.id as any)}
                          className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                            mood === item.id 
                              ? `${item.color.replace('border-', 'border-opacity-100 border-2 border-')} shadow-sm scale-105` 
                              : 'bg-white border-slate-100 text-slate-400 opacity-60 grayscale hover:opacity-100'
                          }`}
                        >
                          <item.icon className="w-6 h-6" />
                          <span className="text-[10px] font-bold uppercase">{item.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleTextSubmit} className="space-y-4">
                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block">What did you nourish with?</label>
                    <textarea 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="e.g., 'A bowl of fresh greek yogurt with berries and a sprinkle of walnuts'"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all resize-none text-slate-700"
                    />
                    
                    <div className="flex gap-4">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 bg-white border border-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        Snap Photo
                      </button>
                      <button 
                        type="submit"
                        disabled={!textInput.trim()}
                        className="flex-1 bg-emerald-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        Analyze
                      </button>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                  </form>
                </div>
              )}
            </div>
            <div className="bg-emerald-50 p-4 text-center">
              <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-[0.2em]">Mindful Choice Powered by Google Gemini</p>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Navigation (Mobile Friendly) */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl px-6 py-3 flex items-center gap-8 aura-glow z-40">
        <button className="flex flex-col items-center gap-1 text-emerald-600">
          <Leaf className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Growth</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors">
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Insights</span>
        </button>
        <div className="w-px h-8 bg-slate-200 mx-2" />
        <button onClick={() => setIsLogging(true)} className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg -mt-8 border-4 border-white active:scale-95 transition-transform">
          <Plus className="w-6 h-6" />
        </button>
        <div className="w-px h-8 bg-slate-200 mx-2" />
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors">
          <Utensils className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Journal</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-500 transition-colors">
          <Smile className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Zen</span>
        </button>
      </nav>
    </div>
  );
};

export default App;

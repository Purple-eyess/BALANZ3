import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Heart, PiggyBank, Plus, Minus, History, Trash2, TrendingUp, 
  Lightbulb, X, Calendar, Edit2, Eye, EyeOff, Moon, Sun, 
  Download, RefreshCw, AlertCircle, Settings, Target, ChevronLeft, ChevronRight, CheckCircle2,
  Bug, Trophy, Medal, Star, Award, Sparkles, Bot, MessageSquare, Key
} from 'lucide-react';

// --- API CONFIG ---
// Clave del propietario para facilitar el uso a los usuarios
const apiKey = "AIzaSyBfdH-HOAYi0k9kCf6lHr8504QIl8BTdW4";

// --- DATA ---
const FINANCIAL_TIPS = [
  { quote: "No ahorres lo que te queda después de gastar, gasta lo que te queda después de ahorrar.", author: "Warren Buffett" },
  { quote: "Cuida los pequeños gastos; un pequeño agujero hunde un gran barco.", author: "Benjamin Franklin" },
  { quote: "La riqueza no consiste en tener grandes posesiones, sino en tener pocas necesidades.", author: "Epicteto" },
  { quote: "El interés compuesto es la octava maravilla del mundo.", author: "Albert Einstein" },
  { quote: "Un presupuesto es decirle a tu dinero a dónde ir, en lugar de preguntarte a dónde fue.", author: "John C. Maxwell" },
  { quote: "Nunca gastes tu dinero antes de ganarlo.", author: "Thomas Jefferson" },
  { quote: "Invierte en ti mismo. Tu carrera es el motor de tu riqueza.", author: "Paul Clitheroe" },
  { quote: "No es cuánto dinero ganas, sino cuánto dinero conservas.", author: "Robert Kiyosaki" },
  { quote: "El precio es lo que pagas. El valor es lo que obtienes.", author: "Warren Buffett" },
  { quote: "La paz financiera no es comprar cosas, es aprender a vivir con menos de lo que ganas.", author: "Dave Ramsey" },
  { quote: "Compra solo aquello que estarías encantado de conservar aunque el mercado cerrara 10 años.", author: "Warren Buffett" },
  { quote: "El dinero es un buen siervo, pero un mal amo.", author: "Francis Bacon" },
  { quote: "La disciplina es el puente entre tus metas y tus logros.", author: "Jim Rohn" },
  { quote: "Si no puedes comprarlo dos veces al contado, no puedes permitírtelo.", author: "Jay-Z" },
  { quote: "La riqueza es la capacidad de experimentar totalmente la vida.", author: "Henry David Thoreau" }
];

// --- COMPONENTES AUXILIARES ---
const ZenPieChart = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  
  if (total === 0) return (
    <div className="h-32 w-32 rounded-full border-4 border-stone-100 flex items-center justify-center text-xs text-stone-300 dark:border-stone-700">Sin datos</div>
  );

  let currentAngle = 0;
  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32 transform -rotate-90">
      {data.map((item, index) => {
        const angle = (item.value / total) * 360;
        const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
        const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
        const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
        const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
        const pathData = total === item.value 
          ? `M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0`
          : `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
        const path = <path key={index} d={pathData} fill={item.color} />;
        currentAngle += angle;
        return path;
      })}
    </svg>
  );
};

// --- APP PRINCIPAL ---
export default function App() {
  // Inicialización segura de estados
  const [transactions, setTransactions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('balanz3_transactions')) || []; } catch { return []; }
  });
  
  const [savingsGoal, setSavingsGoal] = useState(() => {
    try { return JSON.parse(localStorage.getItem('balanz3_savings_goal')) || { name: 'Fondo de Paz', target: 0 }; } catch { return { name: 'Fondo de Paz', target: 0 }; }
  });

  const [fixedExpensesGoal, setFixedExpensesGoal] = useState(() => {
    try { return JSON.parse(localStorage.getItem('balanz3_fixed_expenses')) || 0; } catch { return 0; }
  });

  const [seenAchievements, setSeenAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('balanz3_seen_achievements')) || []; } catch { return []; }
  });
  
  const [darkMode, setDarkMode] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)').matches : false);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [hideBalances, setHideBalances] = useState(false);
  const [view, setView] = useState('dashboard'); 
  const [editId, setEditId] = useState(null); 
  
  // Form States
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('needs');
  const [isAntExpense, setIsAntExpense] = useState(false);
  
  // UI & AI States
  const [showConfetti, setShowConfetti] = useState(false);
  const [newAchievement, setNewAchievement] = useState(null); 
  const [dailyTip, setDailyTip] = useState(FINANCIAL_TIPS[0]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showWarning, setShowWarning] = useState(false); 
  const [pendingExpense, setPendingExpense] = useState(null);
  const [showFixedConfig, setShowFixedConfig] = useState(false);
  const [isZenBotOpen, setIsZenBotOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Persistence
  useEffect(() => localStorage.setItem('balanz3_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('balanz3_savings_goal', JSON.stringify(savingsGoal)), [savingsGoal]);
  useEffect(() => localStorage.setItem('balanz3_fixed_expenses', JSON.stringify(fixedExpensesGoal)), [fixedExpensesGoal]);
  useEffect(() => localStorage.setItem('balanz3_seen_achievements', JSON.stringify(seenAchievements)), [seenAchievements]);
  
  useEffect(() => {
    setDailyTip(FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)]);
    if (fixedExpensesGoal === 0 && showWelcome === false) setShowFixedConfig(true);
  }, [showWelcome]);

  // --- FECHAS ESTRICTAS ---
  const getCapitalizedMonth = (dateObj) => {
    if (!dateObj) return '';
    const month = dateObj.toLocaleString('es-ES', { month: 'long' });
    return month.charAt(0).toUpperCase() + month.slice(1);
  };

  const formatDateStrict = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const monthCap = getCapitalizedMonth(dateObj);
    return `${day}/${monthCap}/${year}`;
  };

  const formatStringDate = (dateStr) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T12:00:00');
    return formatDateStrict(dateObj);
  };

  const getMonthYearTitle = (dateObj) => {
    if (!dateObj) return '';
    const year = dateObj.getFullYear();
    const monthCap = getCapitalizedMonth(dateObj);
    return `${monthCap} ${year}`;
  };

  const navigateMonth = (dir) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(currentMonthDate.getMonth() + dir);
    setCurrentMonthDate(newDate);
  };

  // --- LÓGICA ---
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date + 'T12:00:00'); 
      return tDate.getMonth() === currentMonthDate.getMonth() && tDate.getFullYear() === currentMonthDate.getFullYear();
    });
  }, [transactions, currentMonthDate]);

  const globalBalances = useMemo(() => transactions.reduce((acc, t) => {
    if (t.type === 'income') acc.savings += t.amount * 0.20;
    else if (t.category === 'savings') acc.savings -= t.amount;
    return acc;
  }, { savings: 0 }), [transactions]);

  const balances = useMemo(() => monthlyTransactions.reduce((acc, t) => {
    if (t.type === 'income') {
      acc.needs += t.amount * 0.50; acc.wants += t.amount * 0.30; acc.savings += t.amount * 0.20; acc.total += t.amount;
    } else {
      acc[t.category] -= t.amount; acc.total -= t.amount;
      if (t.isAnt) acc.antTotal += t.amount;
    }
    return acc;
  }, { needs: 0, wants: 0, savings: 0, total: 0, antTotal: 0 }), [monthlyTransactions]);

  const achievements = useMemo(() => [
    { id: 'beginner', title: 'Primeros Pasos', desc: 'Registra tu primera transacción', icon: <Star size={24} />, color: 'text-yellow-500 bg-yellow-100', unlocked: transactions.length > 0 },
    { id: 'ant_hunter', title: 'Cazador de Hormigas', desc: 'Identifica 5 gastos hormiga', icon: <Bug size={24} />, color: 'text-red-500 bg-red-100', unlocked: transactions.filter(t => t.isAnt).length >= 5 },
    { id: 'saver_bronze', title: 'Ahorrador Novato', desc: 'Acumula $100.000 en ahorros', icon: <Medal size={24} />, color: 'text-orange-600 bg-orange-100', unlocked: globalBalances.savings >= 100000 },
    { id: 'saver_gold', title: 'Club del Millón', desc: '¡Logra tu primer millón!', icon: <Trophy size={24} />, color: 'text-yellow-600 bg-yellow-100 border-2 border-yellow-200', unlocked: globalBalances.savings >= 1000000 },
    { id: 'consistency', title: 'Disciplina Zen', desc: 'Registra 50 movimientos', icon: <Award size={24} />, color: 'text-purple-600 bg-purple-100', unlocked: transactions.length >= 50 }
  ], [transactions, globalBalances]);

  useEffect(() => {
    const brandNew = achievements.find(a => a.unlocked && !seenAchievements.includes(a.id));
    if (brandNew) {
      setNewAchievement(brandNew);
      setSeenAchievements(prev => [...prev, brandNew.id]);
      setTimeout(() => setNewAchievement(null), 4000); 
    }
  }, [achievements, seenAchievements]);

  const isFixedCovered = balances.needs >= fixedExpensesGoal && fixedExpensesGoal > 0;
  
  // --- ZENBOT AI ---
  const generateFinancialAdvice = async () => {
    setIsAiLoading(true);
    setAiAdvice('');
    const contextPrompt = `Actúa como ZenBot (BALANZ3), un asesor financiero amigable. Analiza:
      Mes: ${getMonthYearTitle(currentMonthDate)}
      Disponible: ${balances.total}
      Necesidades: ${balances.needs} (Meta: ${fixedExpensesGoal})
      Deseos: ${balances.wants}
      Ahorros: ${balances.savings} (Meta: ${savingsGoal.target})
      Hormigas: ${balances.antTotal}
      Transacciones recientes: ${JSON.stringify(monthlyTransactions.slice(0, 3).map(t => ({d: t.description, a: t.amount, type: t.type})))}
      Instrucciones: Dame un consejo corto, empático y usa emojis. Si hay muchos gastos hormiga, adviérteme.`;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: contextPrompt }] }] })
      });
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      setAiAdvice(data.candidates?.[0]?.content?.parts?.[0]?.text || "No pude conectar. Intenta luego.");
    } catch (e) { 
      setAiAdvice("Error de conexión. 🤖\nVerifica tu conexión a internet."); 
    }
    finally { setIsAiLoading(false); }
  };

  // --- ACTIONS ---
  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!amount) return;
    const val = parseFloat(amount);
    const payload = { amount: val, description, date, category: view === 'add-income' ? undefined : selectedCategory, isAnt: isAntExpense };
    
    if (editId) {
      setTransactions(transactions.map(t => t.id === editId ? { ...t, ...payload } : t));
    } else {
      if (view === 'add-expense' && balances[selectedCategory] < val) {
        setPendingExpense({ id: Date.now(), type: 'expense', ...payload });
        setShowWarning(true); return;
      }
      const newT = { id: Date.now(), type: view === 'add-income' ? 'income' : 'expense', ...payload };
      setTransactions([newT, ...transactions]);
      triggerCelebration();
    }
    resetForm();
  };

  const confirmExpense = () => {
    setTransactions([pendingExpense, ...transactions]);
    setShowWarning(false); setPendingExpense(null); resetForm();
  };

  const deleteTransaction = (id) => confirm('¿Eliminar?') && setTransactions(transactions.filter(t => t.id !== id));
  
  const prepareEdit = (t) => {
    setEditId(t.id); setAmount(t.amount); setDescription(t.description); 
    setDate(t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    if (t.type === 'expense') { setSelectedCategory(t.category); setIsAntExpense(t.isAnt || false); }
    setView(t.type === 'income' ? 'add-income' : 'add-expense');
  };

  const resetForm = () => {
    setAmount(''); setDescription(''); setDate(new Date().toISOString().split('T')[0]);
    setEditId(null); setIsAntExpense(false); setView('dashboard'); setShowWarning(false);
  };

  const triggerCelebration = () => { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); };
  const formatCurrency = (val) => !hideBalances ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val) : '****';
  
  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + ['Fecha,Tipo,Descripción,Categoría,Monto,Hormiga'].concat(transactions.map(t => `${t.date},${t.type},"${t.description}",${t.category||''},${t.amount},${t.isAnt?'SI':'NO'}`)).join("\n");
    const link = document.createElement("a"); link.setAttribute("href", encodeURI(csvContent)); link.setAttribute("download", "balanz3.csv"); document.body.appendChild(link); link.click();
  };

  const categories = {
    needs: { label: 'Necesidades (50%)', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', barColor: 'bg-blue-400', icon: <Home className="w-5 h-5"/>, desc: 'Vivienda, Mercado, Transporte.' },
    wants: { label: 'Deseos (30%)', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300', barColor: 'bg-rose-400', icon: <Heart className="w-5 h-5"/>, desc: 'Gustos, salidas.' },
    savings: { label: 'Ahorro (20%)', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300', barColor: 'bg-emerald-400', icon: <PiggyBank className="w-5 h-5"/>, desc: 'Futuro e Inversión.' }
  };
  const pieData = [{ value: Math.max(0, balances.needs), color: '#60A5FA' }, { value: Math.max(0, balances.wants), color: '#FB7185' }, { value: Math.max(0, balances.savings), color: '#34D399' }];

  return (
    <div className={`${darkMode ? 'dark' : ''} transition-colors duration-300`}>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 font-sans text-stone-800 dark:text-stone-100 selection:bg-purple-200 dark:selection:bg-purple-900 pb-32">
        
        {/* Header */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-stone-100 dark:border-stone-800">
          <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><span className="text-2xl">💲✨</span></div>
              <div><h1 className="text-2xl font-black text-stone-800 dark:text-white leading-none">BALANZ<span className="text-purple-600">3</span></h1><p className="text-[10px] font-bold text-purple-500 uppercase mt-1">Tu Paz Financiera</p></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('achievements')} className={`p-2 transition-colors ${view==='achievements'?'text-yellow-500':'text-stone-400'}`}><Trophy size={20}/></button>
              <button onClick={() => setHideBalances(!hideBalances)} className="p-2 text-stone-400">{hideBalances ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
              <button onClick={() => setView(view==='settings'?'dashboard':'settings')} className="p-2 text-stone-400"><Settings size={20}/></button>
            </div>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-md mx-auto px-6 py-6 space-y-6 relative z-0">
          
          {/* Dashboard */}
          {view === 'dashboard' && (
            <>
              {/* Mes */}
              <div className="flex justify-between bg-white dark:bg-stone-800 p-2 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl"><ChevronLeft/></button>
                <p className="font-bold text-stone-800 dark:text-white capitalize pt-2">{getMonthYearTitle(currentMonthDate)}</p>
                <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl"><ChevronRight/></button>
              </div>

              {/* Total + Gráfico */}
              <div className="flex justify-between gap-4 mt-4">
                <div className="flex-1">
                  <p className="text-xs text-stone-400 uppercase font-semibold mb-1">Disponible Mes</p>
                  <p className="text-3xl font-bold text-stone-800 dark:text-white">{formatCurrency(balances.total)}</p>
                </div>
                {balances.total > 0 && <div className="shrink-0"><ZenPieChart data={pieData} /></div>}
              </div>

              {/* Consejo */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex gap-4 items-start shadow-sm mt-4">
                <div className="p-2 bg-white dark:bg-stone-800 rounded-xl text-indigo-500 shadow-sm shrink-0"><Lightbulb size={20}/></div>
                <div>
                  <p className="text-xs font-bold text-indigo-400 uppercase mb-1">Sabiduría</p>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200 italic">"{dailyTip.quote}"</p>
                  <p className="text-xs text-indigo-400 font-semibold mt-2 text-right">— {dailyTip.author}</p>
                </div>
              </div>

              {/* Detector Hormiga */}
              {balances.antTotal > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-3xl border border-red-100 dark:border-red-900/30 flex justify-between animate-in slide-in-from-left-4 mt-4">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 bg-white dark:bg-stone-800 rounded-full text-red-500 shadow-sm"><Bug size={20}/></div>
                    <div><p className="text-xs font-bold text-red-800 dark:text-red-300 uppercase">Detector Hormiga</p><p className="text-xs text-red-600/70">Fugas de dinero</p></div>
                  </div>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(balances.antTotal)}</p>
                </div>
              )}

              {/* Categorías */}
              <div className="space-y-4 mt-6">
                <p className="text-stone-500 text-sm font-medium">Sobres Virtuales ({getMonthYearTitle(currentMonthDate)})</p>
                {Object.entries(categories).map(([key, config]) => (
                  <div key={key} className="bg-white dark:bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 transition-all active:scale-[0.98]">
                    <div className="flex justify-between mb-3">
                      <div className={`p-3 rounded-2xl ${config.color} mb-2`}>{config.icon}</div>
                      <p className={`text-2xl font-bold ${balances[key] < 0 ? 'text-red-500' : 'text-stone-700 dark:text-white'}`}>{formatCurrency(balances[key])}</p>
                    </div>
                    {key === 'needs' && fixedExpensesGoal > 0 && (
                      <div className={`mb-3 p-3 rounded-xl border flex justify-between gap-3 ${isFixedCovered ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20'}`}>
                        <div><p className="text-xs font-semibold text-stone-600 dark:text-stone-300">Gastos Fijos</p><p className="text-[10px] text-stone-400">Meta: {formatCurrency(fixedExpensesGoal)}</p></div>
                        <div className="text-right">{isFixedCovered ? <div className="text-green-600 font-bold text-xs flex gap-1"><CheckCircle2 size={14}/> Cubierto</div> : <p className="text-xs font-bold text-blue-600">{Math.round((balances.needs/fixedExpensesGoal)*100)}%</p>}</div>
                      </div>
                    )}
                    {key === 'savings' && (
                      <div className="mb-3 bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border flex justify-between cursor-pointer" onClick={() => setView('edit-goal')}>
                        <div className="flex gap-2 items-center"><Target size={14} className="text-emerald-500"/><p className="text-xs font-semibold text-stone-600 dark:text-stone-300">{savingsGoal.name}</p></div>
                        <p className="text-xs font-bold text-emerald-600">{savingsGoal.target > 0 ? Math.round((balances.savings/savingsGoal.target)*100) : 0}%</p>
                      </div>
                    )}
                    <div><h3 className="font-semibold text-stone-700 dark:text-stone-200">{config.label}</h3><p className="text-xs text-stone-400 mt-1">{config.desc}</p></div>
                    <div className="w-full bg-stone-100 h-1.5 rounded-full mt-4 overflow-hidden"><div className={`h-full ${config.barColor} transition-all duration-1000 ease-out`} style={{ width: balances[key]>0?'100%':'0%' }}></div></div>
                  </div>
                ))}
              </div>

              {/* Historial */}
              <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-stone-700 mt-6">
                <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-stone-700 dark:text-stone-200 flex gap-2"><History size={16}/> Movimientos de {getMonthYearTitle(currentMonthDate)}</h3></div>
                <div className="space-y-3">
                  {monthlyTransactions.length === 0 ? <p className="text-center py-8 text-stone-400 text-sm">Todo tranquilo. Añade un ingreso.</p> : 
                    monthlyTransactions.slice(0, 5).map(t => (
                      <div key={t.id} className="flex justify-between py-2 border-b border-stone-50 dark:border-stone-700/50 last:border-0">
                        <div className="flex gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${t.type==='income'?'bg-purple-400':'bg-stone-300'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{t.description}</p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-wide">{formatStringDate(t.date)} • {t.isAnt && '🐜'} {t.type==='income'?'Ingreso':categories[t.category]?.label.split('(')[0]}</p>
                          </div>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span className={`font-semibold text-sm ${t.type==='income'?'text-purple-600':'text-stone-600 dark:text-stone-400'}`}>{t.type==='income'?'+':'-'}{formatCurrency(t.amount)}</span>
                          <button onClick={() => prepareEdit(t)} className="text-stone-300 hover:text-blue-400"><Edit2 size={14}/></button>
                          <button onClick={() => deleteTransaction(t.id)} className="text-stone-300 hover:text-red-400"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </>
          )}

          {/* OTRAS VISTAS (Formularios, Config, Logros) se mantienen ocultas hasta que se activan */}
          {(view === 'add-income' || view === 'add-expense') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={resetForm} className="mb-6 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-white flex items-center gap-1">← Volver</button>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6">{editId ? 'Editar' : (view === 'add-income' ? 'Nuevo Ingreso' : 'Registrar Gasto')}</h2>
              <form onSubmit={handleSaveTransaction} className="space-y-6">
                <div><label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Fecha</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-white p-4 rounded-2xl border border-stone-200 dark:border-stone-700" /></div>
                <div><label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Monto</label><input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-white dark:bg-stone-800 text-3xl font-bold text-stone-700 dark:text-white p-4 rounded-2xl border border-stone-200 dark:border-stone-700" placeholder="0" autoFocus={!editId} /></div>
                {view === 'add-expense' && (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(categories).map(([key, config]) => (
                        <button key={key} type="button" onClick={() => setSelectedCategory(key)} className={`p-4 rounded-xl border-2 text-left flex items-center gap-3 ${selectedCategory===key ? `border-${config.color.split('-')[1]}-400 bg-${config.color.split('-')[1]}-50 dark:bg-stone-800` : 'border-transparent bg-white dark:bg-stone-800'}`}>
                          <div className={`p-2 rounded-lg ${config.color}`}>{config.icon}</div>
                          <div className="flex-1"><span className="block font-semibold text-stone-700 dark:text-stone-200 text-sm">{config.label}</span><span className="block text-xs text-stone-400">Disponible: {formatCurrency(balances[key])}</span></div>
                          {selectedCategory === key && <div className="w-4 h-4 rounded-full bg-stone-800 dark:bg-white"></div>}
                        </button>
                      ))}
                    </div>
                    <div onClick={() => setIsAntExpense(!isAntExpense)} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between ${isAntExpense ? 'bg-red-50 border-red-200' : 'bg-white border-stone-100 dark:bg-stone-800 dark:border-stone-700'}`}>
                      <div className="flex gap-3 items-center"><Bug className={isAntExpense?'text-red-500':'text-stone-400'} size={20}/><span className="font-semibold text-sm text-stone-700 dark:text-stone-200">¿Gasto Hormiga?</span></div>
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors ${isAntExpense ? 'bg-red-500' : 'bg-stone-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isAntExpense ? 'translate-x-6' : ''}`}></div></div>
                    </div>
                  </>
                )}
                <div><label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Descripción</label><input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-white p-4 rounded-2xl border border-stone-200 dark:border-stone-700" placeholder="Ej. Nómina, Cena..." /></div>
                <button type="submit" className="w-full bg-stone-800 dark:bg-purple-600 text-white p-5 rounded-2xl font-bold text-lg shadow-lg">Guardar</button>
              </form>
            </div>
          )}

          {view === 'achievements' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="flex items-center gap-3 mb-4"><button onClick={() => setView('dashboard')} className="text-stone-500 hover:text-stone-800 dark:hover:text-white"><ChevronLeft /></button><h2 className="text-xl font-bold text-stone-800 dark:text-white">Sala de Trofeos</h2></div>
              <div className="space-y-3">
                {achievements.map(achievement => (
                  <div key={achievement.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${achievement.unlocked ? 'bg-white dark:bg-stone-800 border-stone-100' : 'bg-stone-100 dark:bg-stone-900 border-transparent opacity-60 grayscale'}`}>
                    <div className={`p-3 rounded-full ${achievement.unlocked ? achievement.color : 'bg-stone-200 text-stone-400'}`}>{achievement.icon}</div>
                    <div><h3 className="font-bold text-stone-800 dark:text-white text-sm">{achievement.title}</h3><p className="text-xs text-stone-500">{achievement.desc}</p></div>
                    {achievement.unlocked && <CheckCircle2 size={16} className="ml-auto text-green-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === 'settings' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <div className="flex items-center gap-3 mb-4"><button onClick={() => setView('dashboard')} className="text-stone-500 hover:text-stone-800 dark:hover:text-white"><ChevronLeft /></button><h2 className="text-xl font-bold text-stone-800 dark:text-white">Ajustes</h2></div>
              <div className="space-y-3">
                
                <button onClick={() => setShowFixedConfig(true)} className="w-full bg-white dark:bg-stone-800 p-4 rounded-2xl flex items-center gap-3 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"><Home size={20} className="text-blue-500" /><span>Configurar Gastos Fijos</span></button>
                <button onClick={() => setDarkMode(!darkMode)} className="w-full bg-white dark:bg-stone-800 p-4 rounded-2xl flex justify-between items-center text-stone-700 shadow-sm"><div className="flex gap-3"><Moon size={20} className="text-purple-400"/><span>Modo Oscuro</span></div><div className={`w-12 h-6 rounded-full p-1 transition-colors ${darkMode?'bg-purple-500':'bg-stone-300'}`}><div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${darkMode?'translate-x-6':''}`}></div></div></button>
                <button onClick={exportToCSV} className="w-full bg-white dark:bg-stone-800 p-4 rounded-2xl flex items-center gap-3 text-stone-700 shadow-sm"><Download size={20} className="text-blue-500" /><span>Exportar CSV</span></button>
              </div>
            </div>
          )}

          {view === 'edit-goal' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={() => setView('dashboard')} className="mb-6 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-white flex items-center gap-1">← Volver</button>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6">Configurar Meta</h2>
              <div className="space-y-6">
                <div><label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Nombre</label><input type="text" value={savingsGoal.name} onChange={(e) => setSavingsGoal({...savingsGoal, name: e.target.value})} className="w-full bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700" /></div>
                <div><label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Monto</label><input type="number" value={savingsGoal.target} onChange={(e) => setSavingsGoal({...savingsGoal, target: parseFloat(e.target.value)})} className="w-full bg-white dark:bg-stone-800 p-4 rounded-2xl border border-stone-200 dark:border-stone-700" /></div>
                <button onClick={() => setView('dashboard')} className="w-full bg-stone-800 dark:bg-emerald-600 text-white p-5 rounded-2xl font-bold text-lg shadow-lg">Guardar</button>
              </div>
            </div>
          )}
        </main>

        {/* MODALES FLOTANTES */}
        {showWelcome && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <span className="text-4xl">💲✨</span><h2 className="text-2xl font-bold mt-4 dark:text-white">Bienvenido a tu Paz</h2>
              <p className="text-stone-600 dark:text-stone-300 my-4">Tu tranquilidad empieza en tu billetera.</p>
              <button onClick={() => setShowWelcome(false)} className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold">Comenzar a Fluir</button>
            </div>
          </div>
        )}

        {showFixedConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in zoom-in-95">
             <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold dark:text-white mb-2">Primero lo Primero 🏠</h3>
              <p className="text-sm text-stone-600 mb-4">¿Cuánto suman tus gastos fijos mensuales? (Arriendo, Servicios...)</p>
              <input type="number" value={fixedExpensesGoal||''} onChange={(e) => setFixedExpensesGoal(parseFloat(e.target.value)||0)} className="w-full bg-stone-50 dark:bg-stone-900 text-2xl font-bold p-3 rounded-xl border mb-6" placeholder="0" />
              <button onClick={() => setShowFixedConfig(false)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Listo</button>
             </div>
          </div>
        )}

        {/* ZENBOT AI MODAL FLOTANTE */}
        {isZenBotOpen && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-stone-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-purple-100 flex flex-col max-h-[80vh]">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3"><Bot className="text-white" size={24}/><h3 className="font-bold text-white">ZenBot AI</h3></div>
                <button onClick={() => setIsZenBotOpen(false)} className="text-white/80 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 bg-stone-50 dark:bg-stone-900">
                {!aiAdvice ? (
                  <div className="text-center py-8">
                    <Sparkles className="text-purple-400 mx-auto mb-4 animate-pulse" size={48} />
                    <p className="text-stone-600 dark:text-stone-300 font-medium mb-4">Analizaré tus finanzas de este mes.</p>
                    <button onClick={generateFinancialAdvice} disabled={isAiLoading} className="bg-stone-800 dark:bg-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 mx-auto disabled:opacity-50">
                      {isAiLoading ? 'Pensando...' : 'Analizar Ahora 🚀'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700 text-sm leading-relaxed whitespace-pre-wrap dark:text-stone-200">{aiAdvice}</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-20 pointer-events-none">
          <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-2 rounded-full shadow-2xl flex items-center gap-2 pl-6 pr-2 pointer-events-auto">
            <span className="text-sm font-semibold mr-2 hidden sm:inline">Acción</span>
            <button onClick={() => setView('add-expense')} className="bg-stone-800 dark:bg-stone-100 hover:bg-stone-700 text-white dark:text-stone-800 px-5 py-3 rounded-full flex items-center gap-2"><Minus size={18}/> Gasto</button>
            <button onClick={() => setView('add-income')} className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-full flex items-center gap-2"><Plus size={18}/> Ingreso</button>
          </div>
        </div>

        {/* --- BOTÓN FLOTANTE ZENBOT (FAB) --- */}
        <button 
          onClick={() => setIsZenBotOpen(!isZenBotOpen)}
          className="fixed bottom-28 right-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-purple-900/40 hover:scale-110 transition-transform flex items-center justify-center border-4 border-white dark:border-stone-800"
        >
          <Bot size={28} />
          {/* Notificación visual */}
          <span className="absolute top-0 right-0 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
        </button>

      </div>
    </div>
  );
}

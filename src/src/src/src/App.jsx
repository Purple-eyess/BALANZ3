import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Heart, PiggyBank, Plus, Minus, History, Trash2, TrendingUp, 
  Lightbulb, X, Calendar, Edit2, Eye, EyeOff, Moon, Sun, 
  Download, RefreshCw, AlertCircle, Settings, Target, ChevronLeft, ChevronRight, CheckCircle2
} from 'lucide-react';

// --- CONFIGURACIÓN Y UTILIDADES ---

const FINANCIAL_TIPS = [
  "Págate a ti mismo primero: El ahorro no es lo que sobra, es prioridad.",
  "Tus gastos fijos no deberían superar el 50% de tus ingresos para vivir tranquilo.",
  "Diferencia entre 'lo necesito' y 'lo quiero' antes de sacar la billetera.",
  "Un fondo de emergencia es tu chaleco antibalas contra la mala suerte.",
  "El presupuesto no te limita, te da libertad de gastar sin culpa.",
  "Invierte en educación financiera, paga los mejores intereses.",
  "Si no puedes comprarlo dos veces al contado, no puedes permitírtelo.",
  "Revisa tus suscripciones mensuales, son vampiros silenciosos de dinero.",
  "La riqueza se construye con hábitos, no con golpes de suerte.",
  "No trabajes por dinero, haz que el dinero trabaje para ti.",
  "La paciencia es el activo más importante del inversor.",
  "Evita la inflación de estilo de vida: Si ganas más, no gastes más, ahorra más.",
  "Nunca dependas de una sola fuente de ingresos.",
  "El mejor momento para plantar un árbol fue hace 20 años. El segundo mejor es hoy.",
  "El interés compuesto es la fuerza más poderosa del universo financiero.",
  "No ahorres lo que te queda después de gastar, gasta lo que te queda después de ahorrar.",
  "La deuda de consumo es el enemigo de tu futuro.",
  "Cuida los centavos y los pesos se cuidarán solos.",
  "La tranquilidad financiera vale más que cualquier estatus social.",
  "Define tus metas: Un barco sin rumbo no llega a ningún puerto."
];

// --- COMPONENTES AUXILIARES ---

// Gráfico Circular Minimalista (SVG)
const ZenPieChart = ({ data }) => {
  const total = data.reduce((acc, item) => acc + item.value, 0);
  let currentAngle = 0;

  if (total === 0) return (
    <div className="h-32 w-32 rounded-full border-4 border-stone-100 flex items-center justify-center text-xs text-stone-300 dark:border-stone-700">
      Sin datos
    </div>
  );

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32 transform -rotate-90">
      {data.map((item, index) => {
        const angle = (item.value / total) * 360;
        const x1 = 50 + 50 * Math.cos((Math.PI * currentAngle) / 180);
        const y1 = 50 + 50 * Math.sin((Math.PI * currentAngle) / 180);
        const x2 = 50 + 50 * Math.cos((Math.PI * (currentAngle + angle)) / 180);
        const y2 = 50 + 50 * Math.sin((Math.PI * (currentAngle + angle)) / 180);
        
        const pathData = total === item.value 
          ? `M 50 50 m -50 0 a 50 50 0 1 0 100 0 a 50 50 0 1 0 -100 0` // Círculo completo
          : `M 50 50 L ${x1} ${y1} A 50 50 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;

        const path = <path key={index} d={pathData} fill={item.color} />;
        currentAngle += angle;
        return path;
      })}
    </svg>
  );
};

// --- COMPONENTE PRINCIPAL ---

export default function App() {
  // --- ESTADOS ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('balanz3_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [savingsGoal, setSavingsGoal] = useState(() => {
    const saved = localStorage.getItem('balanz3_savings_goal');
    return saved ? JSON.parse(saved) : { name: 'Fondo de Paz', target: 0 };
  });

  const [fixedExpensesGoal, setFixedExpensesGoal] = useState(() => {
    const saved = localStorage.getItem('balanz3_fixed_expenses');
    return saved ? JSON.parse(saved) : 0;
  });

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Estado para el mes actual seleccionado (siempre empieza en el mes real actual)
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  const [hideBalances, setHideBalances] = useState(false);
  const [view, setView] = useState('dashboard'); 
  const [editId, setEditId] = useState(null); 
  
  // Form States
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedCategory, setSelectedCategory] = useState('needs');
  
  // UI States
  const [showConfetti, setShowConfetti] = useState(false);
  const [dailyTip, setDailyTip] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showWarning, setShowWarning] = useState(false); 
  const [pendingExpense, setPendingExpense] = useState(null);
  const [showFixedConfig, setShowFixedConfig] = useState(false); // Modal para configurar gastos fijos al inicio

  // --- EFECTOS ---

  useEffect(() => {
    localStorage.setItem('balanz3_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('balanz3_savings_goal', JSON.stringify(savingsGoal));
  }, [savingsGoal]);

  useEffect(() => {
    localStorage.setItem('balanz3_fixed_expenses', JSON.stringify(fixedExpensesGoal));
  }, [fixedExpensesGoal]);

  useEffect(() => {
    setDailyTip(FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)]);
    // Si no ha configurado gastos fijos, sugerirlo
    if (fixedExpensesGoal === 0 && showWelcome === false) {
      setShowFixedConfig(true);
    }
  }, [showWelcome]);

  // --- LÓGICA DE FECHAS ---

  const monthYearString = currentMonthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const displayDate = currentMonthDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  const navigateMonth = (direction) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(currentMonthDate.getMonth() + direction);
    setCurrentMonthDate(newDate);
  };

  // --- LÓGICA DE NEGOCIO (FILTRADO POR MES) ---

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Ajustar zona horaria local para comparación precisa
      const tDate = new Date(t.date + 'T00:00:00'); 
      return tDate.getMonth() === currentMonthDate.getMonth() && 
             tDate.getFullYear() === currentMonthDate.getFullYear();
    });
  }, [transactions, currentMonthDate]);

  const balances = useMemo(() => {
    return monthlyTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === 'income') {
          acc.needs += transaction.amount * 0.50;
          acc.wants += transaction.amount * 0.30;
          acc.savings += transaction.amount * 0.20;
          acc.total += transaction.amount;
        } else {
          acc[transaction.category] -= transaction.amount;
          acc.total -= transaction.amount;
        }
        return acc;
      },
      { needs: 0, wants: 0, savings: 0, total: 0 }
    );
  }, [monthlyTransactions]);

  // Cálculo de cobertura de gastos fijos
  const fixedExpensesCovered = Math.min(100, (balances.needs / fixedExpensesGoal) * 100);
  const isFixedCovered = balances.needs >= fixedExpensesGoal && fixedExpensesGoal > 0;
  // Cálculo del saldo a favor (excedente en necesidades sobre la meta fija)
  const fixedSurplus = Math.max(0, balances.needs - fixedExpensesGoal);

  // Manejo de Transacciones
  const handleSaveTransaction = (e) => {
    e.preventDefault();
    if (!amount) return;
    
    const val = parseFloat(amount);
    
    if (editId) {
      setTransactions(transactions.map(t => 
        t.id === editId 
          ? { ...t, amount: val, description, date, category: t.type === 'expense' ? selectedCategory : undefined } 
          : t
      ));
      resetForm();
      return;
    }

    if (view === 'add-income') {
      const newTransaction = {
        id: Date.now(),
        type: 'income',
        amount: val,
        description: description || 'Ingreso',
        date: date,
      };
      setTransactions([newTransaction, ...transactions]);
      triggerCelebration();
      resetForm();
    } 
    else if (view === 'add-expense') {
      // Advertencia de saldo
      if (balances[selectedCategory] < val) {
        setPendingExpense({
          id: Date.now(),
          type: 'expense',
          amount: val,
          description: description || 'Gasto',
          category: selectedCategory,
          date: date,
        });
        setShowWarning(true);
        return;
      }
      confirmExpense({
        id: Date.now(),
        type: 'expense',
        amount: val,
        description: description || 'Gasto',
        category: selectedCategory,
        date: date,
      });
    }
  };

  const confirmExpense = (transactionData) => {
    const data = transactionData || pendingExpense;
    setTransactions([data, ...transactions]);
    setShowWarning(false);
    setPendingExpense(null);
    resetForm();
  };

  const prepareEdit = (t) => {
    setEditId(t.id);
    setAmount(t.amount);
    setDescription(t.description);
    setDate(t.date ? t.date.split('T')[0] : new Date().toISOString().split('T')[0]);
    if (t.type === 'expense') setSelectedCategory(t.category);
    setView(t.type === 'income' ? 'add-income' : 'add-expense');
  };

  const deleteTransaction = (id) => {
    if(confirm('¿Eliminar esta transacción?')) {
      setTransactions(transactions.filter(t => t.id !== id));
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setEditId(null);
    setView('dashboard');
    setShowWarning(false);
  };

  const triggerCelebration = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Utilidades
  const formatCurrency = (val) => {
    if (hideBalances) return '****';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const exportToCSV = () => {
    const headers = ['Fecha,Tipo,Descripción,Categoría,Monto'];
    const rows = transactions.map(t => 
      `${t.date},${t.type},"${t.description}",${t.category || 'N/A'},${t.amount}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "balanz3_export.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Configuración de Categorías
  const categories = {
    needs: {
      label: 'Necesidades (50%)',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      barColor: 'bg-blue-400',
      pieColor: '#60A5FA', 
      icon: <Home className="w-5 h-5" />,
      desc: 'Vivienda, Alimentación, Transporte, Servicios.'
    },
    wants: {
      label: 'Deseos (30%)',
      color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
      barColor: 'bg-rose-400',
      pieColor: '#FB7185',
      icon: <Heart className="w-5 h-5" />,
      desc: 'Diversión, hobbies, gustos, salidas.'
    },
    savings: {
      label: 'Ahorro (20%)',
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
      barColor: 'bg-emerald-400',
      pieColor: '#34D399',
      icon: <PiggyBank className="w-5 h-5" />,
      desc: 'Tu "Yo" del futuro e inversiones.'
    }
  };

  const pieData = [
    { value: Math.max(0, balances.needs), color: categories.needs.pieColor },
    { value: Math.max(0, balances.wants), color: categories.wants.pieColor },
    { value: Math.max(0, balances.savings), color: categories.savings.pieColor },
  ];

  return (
    <div className={`${darkMode ? 'dark' : ''} transition-colors duration-300`}>
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 font-sans text-stone-800 dark:text-stone-100 selection:bg-purple-200 dark:selection:bg-purple-900 transition-colors duration-300">
        
        {/* Modal Bienvenida */}
        {showWelcome && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💲✨</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-3">Bienvenido a tu Paz</h2>
              <p className="text-stone-600 dark:text-stone-300 mb-6 leading-relaxed">
                Tu tranquilidad empieza en tu billetera.
              </p>
              <button 
                onClick={() => setShowWelcome(false)}
                className="w-full bg-stone-800 dark:bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-stone-700 dark:hover:bg-purple-700 transition-colors"
              >
                Comenzar a Fluir
              </button>
            </div>
          </div>
        )}

        {/* Modal Configuración Gastos Fijos (Inicial) */}
        {showFixedConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200">
             <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-xl font-bold text-stone-800 dark:text-white mb-2 flex items-center gap-2">
                <Home size={20} className="text-blue-500"/> Primero lo Primero
              </h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-4">
                Para priorizar tu paz mental, dinos cuánto suman tus <strong>Gastos Fijos Mensuales</strong>.
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 bg-stone-100 dark:bg-stone-700 p-3 rounded-xl">
                Incluye: Arriendo, Alimentación, Transporte, Servicios y Educación.
              </p>
              
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-light text-xl">$</span>
                <input
                  type="number"
                  value={fixedExpensesGoal || ''}
                  onChange={(e) => setFixedExpensesGoal(parseFloat(e.target.value) || 0)}
                  className="w-full bg-stone-50 dark:bg-stone-900 text-2xl font-bold text-stone-700 dark:text-white p-3 pl-10 rounded-xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
              </div>

              <button 
                onClick={() => setShowFixedConfig(false)}
                className="w-full bg-stone-800 dark:bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-stone-700 dark:hover:bg-blue-700 transition-colors"
              >
                Establecer Prioridad
              </button>
             </div>
          </div>
        )}

        {/* Modal Soft Warning */}
        {showWarning && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center border-t-4 border-yellow-400">
              <div className="mb-4 flex justify-center text-yellow-500">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-2">¿Estás seguro?</h3>
              <p className="text-sm text-stone-600 dark:text-stone-300 mb-6">
                Este gasto excederá tu saldo disponible en este mes para <strong>{categories[pendingExpense?.category]?.label.split('(')[0]}</strong>. 
                El saldo quedará en negativo.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowWarning(false)}
                  className="flex-1 py-3 rounded-xl font-medium text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => confirmExpense()}
                  className="flex-1 bg-stone-800 dark:bg-yellow-600 text-white py-3 rounded-xl font-semibold hover:bg-stone-700 dark:hover:bg-yellow-700 transition-colors"
                >
                  Sí, gastar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Zen */}
        <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-stone-100 dark:border-stone-800 transition-colors duration-300">
          <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💲✨</span>
              </div>
              <div>
                <h1 className="text-2xl font-black text-stone-800 dark:text-white tracking-tighter leading-none">
                  BALANZ<span className="text-purple-600 dark:text-purple-400">3</span>
                </h1>
                <p className="text-[10px] font-bold text-purple-500 dark:text-purple-300 uppercase tracking-widest mt-1">
                  Tu Paz Financiera
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setHideBalances(!hideBalances)}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                {hideBalances ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <button 
                onClick={() => setView(view === 'settings' ? 'dashboard' : 'settings')}
                className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        <main className="max-w-md mx-auto px-6 py-6 pb-32 space-y-6">
          
          {/* VISTA: CONFIGURACIÓN */}
          {view === 'settings' && (
            <div className="animate-in slide-in-from-right-4 duration-300 space-y-6">
              <h2 className="text-xl font-bold text-stone-800 dark:text-white mb-4">Ajustes</h2>
              
              <div className="space-y-3">
                <button 
                  onClick={() => setShowFixedConfig(true)}
                  className="w-full bg-white dark:bg-stone-800 p-4 rounded-2xl flex items-center gap-3 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <Home size={20} className="text-blue-500" />
                  <div className="text-left">
                    <span className="font-medium block">Configurar Gastos Fijos</span>
                    <span className="text-xs text-stone-400">Define tu meta mensual obligatoria</span>
                  </div>
                </button>

                <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    {darkMode ? <Moon size={20} className="text-purple-400" /> : <Sun size={20} className="text-orange-400" />}
                    <span className="font-medium text-stone-700 dark:text-stone-200">Modo Oscuro</span>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-purple-500' : 'bg-stone-300'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : ''}`}></div>
                  </button>
                </div>

                <button 
                  onClick={exportToCSV}
                  className="w-full bg-white dark:bg-stone-800 p-4 rounded-2xl flex items-center gap-3 text-stone-700 dark:text-stone-200 shadow-sm hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors"
                >
                  <Download size={20} className="text-blue-500" />
                  <span className="font-medium">Exportar a Excel (CSV)</span>
                </button>

              </div>
              <div className="bg-stone-100 dark:bg-stone-800/50 p-4 rounded-xl text-xs text-stone-500 dark:text-stone-400 text-center">
                BALANZ3 v1.2 - Tus datos se guardan solo en tu dispositivo.
              </div>
            </div>
          )}

          {/* VISTA: DASHBOARD */}
          {view === 'dashboard' && (
            <>
              {/* Navegación de Meses (Estilo Banco) */}
              <div className="flex items-center justify-between bg-white dark:bg-stone-800 p-2 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
                <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors">
                  <ChevronLeft className="text-stone-500" />
                </button>
                <div className="text-center">
                  <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Mostrando Mes</p>
                  <p className="font-bold text-stone-800 dark:text-white capitalize">{monthYearString}</p>
                </div>
                <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-700 rounded-xl transition-colors">
                  <ChevronRight className="text-stone-500" />
                </button>
              </div>

              {/* Resumen Visual (Total + Gráfico) */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-1">Disponible Mes</p>
                  <p className="text-3xl font-bold text-stone-800 dark:text-white transition-all">
                    {formatCurrency(balances.total)}
                  </p>
                </div>
                {balances.total > 0 && (
                  <div className="shrink-0 animate-in fade-in duration-700">
                    <ZenPieChart data={pieData} />
                  </div>
                )}
              </div>

              {/* Banner Consejo */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 flex gap-4 items-start shadow-sm">
                <div className="p-2 bg-white dark:bg-stone-800 rounded-xl text-indigo-500 shadow-sm shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">Sabiduría BALANZ3</p>
                  <p className="text-sm text-indigo-900 dark:text-indigo-200 font-medium italic leading-snug">"{dailyTip}"</p>
                </div>
              </div>

              {/* Tarjetas de Categorías */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-stone-500 dark:text-stone-400 text-sm font-medium">Sobres Virtuales ({monthYearString})</p>
                </div>
                
                {Object.entries(categories).map(([key, config]) => (
                  <div key={key} className="bg-white dark:bg-stone-800 p-5 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-700 transition-all active:scale-[0.98]">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-3 rounded-2xl ${config.color} mb-2`}>
                        {config.icon}
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${balances[key] < 0 ? 'text-red-500' : 'text-stone-700 dark:text-white'}`}>
                          {formatCurrency(balances[key])}
                        </p>
                      </div>
                    </div>

                    {/* Lógica Específica para Necesidades (Gastos Fijos) */}
                    {key === 'needs' && fixedExpensesGoal > 0 && (
                      <div className={`mb-3 p-3 rounded-xl border flex items-center justify-between gap-3 ${isFixedCovered ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'}`}>
                        <div>
                          <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">Cobertura Gastos Fijos</p>
                          <p className="text-[10px] text-stone-400">Meta: {formatCurrency(fixedExpensesGoal)}</p>
                        </div>
                        <div className="text-right">
                          {isFixedCovered ? (
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-1 text-green-600 dark:text-green-400 text-xs font-bold">
                                <CheckCircle2 size={14} /> Cubierto
                              </div>
                              {fixedSurplus > 0 && (
                                <p className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-0.5">
                                  + {formatCurrency(fixedSurplus)} a favor
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {Math.round((balances.needs / fixedExpensesGoal) * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Meta de Ahorro (Solo en tarjeta savings) */}
                    {key === 'savings' && (
                      <div className="mb-3 bg-stone-50 dark:bg-stone-900/50 p-3 rounded-xl border border-stone-100 dark:border-stone-700 flex justify-between items-center group cursor-pointer" onClick={() => setView('edit-goal')}>
                        <div className="flex items-center gap-2">
                          <Target size={14} className="text-emerald-500" />
                          <div>
                            <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">{savingsGoal.name}</p>
                            <p className="text-[10px] text-stone-400">Meta: {formatCurrency(savingsGoal.target)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {savingsGoal.target > 0 ? Math.round((balances.savings / savingsGoal.target) * 100) : 0}%
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-stone-700 dark:text-stone-200">{config.label}</h3>
                      <p className="text-xs text-stone-400 mt-1 dark:text-stone-500">{config.desc}</p>
                    </div>
                    
                    <div className="w-full bg-stone-100 dark:bg-stone-700 h-1.5 rounded-full mt-4 overflow-hidden">
                      <div 
                        className={`h-full ${config.barColor} transition-all duration-1000 ease-out`} 
                        style={{ width: balances[key] > 0 ? '100%' : '0%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Historial */}
              <div className="bg-white dark:bg-stone-800 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-stone-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-stone-700 dark:text-stone-200 flex items-center gap-2">
                    <History size={16} /> Movimientos de {monthYearString}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {monthlyTransactions.length === 0 ? (
                    <div className="text-center py-8 text-stone-400">
                      <p className="text-sm">Todo está tranquilo en {monthYearString}.</p>
                      <p className="text-xs mt-1">Añade un ingreso para empezar el mes.</p>
                    </div>
                  ) : (
                    monthlyTransactions.slice(0, 5).map((t) => (
                      <div key={t.id} className="flex justify-between items-center py-2 border-b border-stone-50 dark:border-stone-700/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-purple-400' : 'bg-stone-300'}`}></div>
                          <div>
                            <p className="text-sm font-medium text-stone-700 dark:text-stone-300">{t.description}</p>
                            <p className="text-[10px] text-stone-400 uppercase tracking-wide flex items-center gap-1">
                              {t.date} • {t.type === 'income' ? 'Ingreso' : categories[t.category]?.label.split('(')[0]}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-purple-600 dark:text-purple-400' : 'text-stone-600 dark:text-stone-400'}`}>
                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                          </span>
                          <button onClick={() => prepareEdit(t)} className="text-stone-300 hover:text-blue-400 transition-colors">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => deleteTransaction(t.id)} className="text-stone-300 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* VISTA: FORMS (Añadir/Editar) */}
          {(view === 'add-income' || view === 'add-expense') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={resetForm} className="mb-6 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-white flex items-center gap-1">
                ← Volver
              </button>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6">
                {editId ? 'Editar Transacción' : (view === 'add-income' ? 'Nuevo Ingreso' : 'Registrar Gasto')}
              </h2>
              
              <form onSubmit={handleSaveTransaction} className="space-y-6">
                {/* Selector de Fecha */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Fecha</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                      <Calendar size={18} />
                    </span>
                    <input 
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-white p-4 pl-12 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                {/* Input Monto */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Monto</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-light text-xl">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full bg-white dark:bg-stone-800 text-3xl font-bold text-stone-700 dark:text-white p-4 pl-10 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 ${view === 'add-income' ? 'focus:ring-purple-200' : 'focus:ring-red-200'}`}
                      placeholder="0"
                      autoFocus={!editId}
                    />
                  </div>
                </div>

                {/* Selector Categoría (Solo Gastos) */}
                {view === 'add-expense' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Categoría</label>
                    <div className="grid grid-cols-1 gap-3">
                      {Object.entries(categories).map(([key, config]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedCategory(key)}
                          className={`p-4 rounded-xl border-2 text-left flex items-center gap-3 transition-all ${
                            selectedCategory === key 
                              ? `border-${config.color.split('-')[1]}-400 bg-${config.color.split('-')[1]}-50 dark:bg-${config.color.split('-')[1]}-900/40` 
                              : 'border-transparent bg-white dark:bg-stone-800 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700'
                          }`}
                        >
                          <div className={`p-2 rounded-lg ${config.color}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1">
                            <span className="block font-semibold text-stone-700 dark:text-stone-200 text-sm">{config.label}</span>
                            <span className="block text-xs text-stone-400">
                              Disponible: {formatCurrency(balances[key])}
                            </span>
                          </div>
                          {selectedCategory === key && <div className="w-4 h-4 rounded-full bg-stone-800 dark:bg-white"></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Descripción */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Descripción</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-white p-4 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-200"
                    placeholder="Ej. Nómina, Cena..."
                  />
                </div>

                {/* Previsualización 50/30/20 (Solo Ingresos) */}
                {view === 'add-income' && amount > 0 && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800/50">
                    <p className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                      <TrendingUp size={16} /> Distribución Mágica (50/30/20)
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-purple-900 dark:text-purple-200">
                        <span className="opacity-70">Necesidades</span>
                        <span className="font-semibold">{formatCurrency(amount * 0.5)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-purple-900 dark:text-purple-200">
                        <span className="opacity-70">Deseos</span>
                        <span className="font-semibold">{formatCurrency(amount * 0.3)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-purple-900 dark:text-purple-200">
                        <span className="opacity-70">Ahorro</span>
                        <span className="font-semibold">{formatCurrency(amount * 0.2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  className={`w-full p-5 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] ${
                    view === 'add-income' 
                      ? 'bg-stone-800 text-white dark:bg-purple-600 hover:bg-stone-700 dark:hover:bg-purple-700 shadow-stone-200 dark:shadow-none' 
                      : 'bg-white text-stone-800 border-2 border-stone-100 hover:border-red-200 hover:text-red-600 dark:bg-stone-800 dark:text-white dark:border-stone-700 dark:hover:border-red-900'
                  }`}
                >
                  {editId ? 'Guardar Cambios' : (view === 'add-income' ? 'Ingresar y Distribuir' : 'Registrar Gasto')}
                </button>
              </form>
            </div>
          )}

          {/* VISTA: EDITAR META AHORRO */}
          {view === 'edit-goal' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button onClick={() => setView('dashboard')} className="mb-6 text-sm text-stone-500 hover:text-stone-800 dark:hover:text-white flex items-center gap-1">
                ← Volver
              </button>
              <h2 className="text-2xl font-bold text-stone-800 dark:text-white mb-6">Configurar Meta de Ahorro</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Nombre de la Meta</label>
                  <input
                    type="text"
                    value={savingsGoal.name}
                    onChange={(e) => setSavingsGoal({...savingsGoal, name: e.target.value})}
                    className="w-full bg-white dark:bg-stone-800 text-stone-700 dark:text-white p-4 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="Ej. Viaje a Bali, Fondo de Paz..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-stone-400 mb-2">Monto Objetivo</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-light text-xl">$</span>
                    <input
                      type="number"
                      value={savingsGoal.target}
                      onChange={(e) => setSavingsGoal({...savingsGoal, target: parseFloat(e.target.value)})}
                      className="w-full bg-white dark:bg-stone-800 text-3xl font-bold text-stone-700 dark:text-white p-4 pl-10 rounded-2xl border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    />
                  </div>
                </div>
                
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-center">
                  <p className="text-sm text-emerald-800 dark:text-emerald-300 mb-2">Progreso Actual</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {savingsGoal.target > 0 ? ((balances.savings / savingsGoal.target) * 100).toFixed(1) : 0}%
                  </p>
                  <div className="w-full bg-emerald-200 dark:bg-emerald-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 ease-out" 
                      style={{ width: `${Math.min(100, (balances.savings / savingsGoal.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <button 
                  onClick={() => setView('dashboard')}
                  className="w-full bg-stone-800 dark:bg-emerald-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-stone-700 dark:hover:bg-emerald-700 transition-colors shadow-lg"
                >
                  Guardar Meta
                </button>
              </div>
            </div>
          )}

        </main>

        {/* Navegación Inferior Flotante */}
        {view === 'dashboard' && (
          <div className="fixed bottom-8 left-0 right-0 px-6 flex justify-center z-20">
            <div className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 p-2 rounded-full shadow-2xl shadow-stone-400/50 dark:shadow-stone-900/50 flex items-center gap-2 pl-6 pr-2 transition-colors duration-300">
              <span className="text-sm font-semibold mr-2 hidden sm:inline">Transacción</span>
              <button 
                onClick={() => setView('add-expense')}
                className="bg-stone-800 dark:bg-stone-100 hover:bg-stone-700 dark:hover:bg-stone-200 text-white dark:text-stone-800 px-5 py-3 rounded-full flex items-center gap-2 transition-colors"
              >
                <Minus size={18} /> Gasto
              </button>
              <button 
                onClick={() => setView('add-income')}
                className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-full flex items-center gap-2 transition-colors font-semibold shadow-md shadow-purple-900/20"
              >
                <Plus size={18} /> Ingreso
              </button>
            </div>
          </div>
        )}

        {/* Efecto Confetti Simple */}
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute animate-bounce text-4xl" style={{top: '20%', left: '20%'}}>✨</div>
            <div className="absolute animate-bounce delay-100 text-4xl" style={{top: '40%', right: '20%'}}>💸</div>
            <div className="absolute animate-bounce delay-200 text-4xl" style={{top: '60%', left: '50%'}}>🎉</div>
            <div className="absolute animate-bounce delay-300 text-4xl" style={{top: '30%', right: '40%'}}>💰</div>
          </div>
        )}
      </div>
    </div>
  );
}

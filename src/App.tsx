import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Apple, Search, Send, ChefHat, AlertCircle, RefreshCw, CalendarDays, Utensils, Scale } from 'lucide-react';
import Markdown from 'react-markdown';
import { FatCalculator } from './components/FatCalculator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'evaluate' | 'mealPlan' | 'fatCalculator'>('evaluate');
  const [foodInput, setFoodInput] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEvaluate = async () => {
    if (!foodInput.trim()) return;

    setIsLoading(true);
    setError('');
    setEvaluation('');

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ food: foodInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء التقييم');
      }

      setEvaluation(data.result);
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMealPlan = async () => {
    setIsLoading(true);
    setError('');
    setMealPlan('');

    try {
      const response = await fetch('/api/meal-plan', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إنشاء خطة الوجبات');
      }

      setMealPlan(data.result);
    } catch (err: any) {
      setError(err.message || 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && activeTab === 'evaluate') {
      handleEvaluate();
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">مستشار التغذية العلاجية</h1>
              <p className="text-xs text-slate-500 mt-1">المرارة وارتجاع المريء</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          
          {/* Tabs */}
          <div className="grid grid-cols-3 bg-slate-200/60 p-1 rounded-2xl mb-8 border border-slate-200/80 gap-1">
            <button
              onClick={() => setActiveTab('evaluate')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 sm:px-4 rounded-xl font-medium transition-all text-xs sm:text-sm md:text-base ${
                activeTab === 'evaluate' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search size={16} className="shrink-0" />
              <span className="truncate">تقييم أكلة</span>
            </button>
            <button
              onClick={() => setActiveTab('mealPlan')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 sm:px-4 rounded-xl font-medium transition-all text-xs sm:text-sm md:text-base ${
                activeTab === 'mealPlan' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CalendarDays size={16} className="shrink-0" />
              <span className="truncate">خطة يوم كامل</span>
            </button>
            <button
              onClick={() => setActiveTab('fatCalculator')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 px-2 sm:px-4 rounded-xl font-medium transition-all text-xs sm:text-sm md:text-base ${
                activeTab === 'fatCalculator' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Scale size={16} className="shrink-0" />
              <span className="truncate">حاسبة دهون الوجبة</span>
            </button>
          </div>

          {activeTab === 'evaluate' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Hero Section */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 text-teal-500 mb-4 shadow-sm border border-teal-100">
                  <Apple size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  هل هذه الأكلة مناسبة لحالتك؟
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  أدخل اسم الأكلة أو المكون الغذائي وسأقوم بتقييمه فوراً بناءً على قواعد التغذية العلاجية الصارمة لمرضى التهاب المرارة وارتجاع المريء معاً.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative mb-8 shadow-md rounded-2xl bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all">
                <div className="flex items-center px-4 py-3">
                  <Search className="text-slate-400 ml-3" size={24} />
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 placeholder:text-slate-400 py-2"
                    placeholder="مثال: مكرونة بالبشاميل، تفاح، قهوة..."
                    value={foodInput}
                    onChange={(e) => setFoodInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleEvaluate}
                    disabled={!foodInput.trim() || isLoading}
                    className="mr-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white p-3 rounded-xl transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                  >
                    {isLoading ? (
                      <RefreshCw className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} className="rotate-180" />
                    )}
                  </button>
                </div>
              </div>

              {/* Results Area */}
              <AnimatePresence mode="wait">
                {evaluation && !isLoading && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                      <ChefHat className="text-slate-500" size={20} />
                      <h3 className="font-semibold text-slate-700">التقييم الغذائي</h3>
                    </div>
                    <div className="p-6 md:p-8 markdown-content text-slate-700 text-lg leading-relaxed">
                      <Markdown>{evaluation}</Markdown>
                    </div>
                  </motion.div>
                )}
                
                {isLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse">جاري تقييم {foodInput} بناءً على حالتك...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tips Section (Empty State) */}
              {!evaluation && !isLoading && !error && (
                <div className="mt-12 grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      أمثلة مقبولة
                    </h4>
                    <ul className="text-sm text-green-700/80 space-y-2">
                      <li>• صدور الدجاج المشوية (بدون جلد)</li>
                      <li>• الخضروات المسلوقة (كوسة، جزر)</li>
                      <li>• التفاح والكمثرى</li>
                    </ul>
                  </div>
                  <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      أمثلة ممنوعة
                    </h4>
                    <ul className="text-sm text-red-700/80 space-y-2">
                      <li>• البطاطس المقلية والوجبات السريعة</li>
                      <li>• صلصة الطماطم الحمراء والشطة</li>
                      <li>• القهوة والشوكولاتة والنعناع</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'mealPlan' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mb-4 shadow-sm border border-indigo-100">
                  <Utensils size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  خطة وجبات يوم كامل
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  هل تحتاج إلى أفكار لوجبات يوم كامل خالية من الممنوعات؟ اضغط على الزر أدناه لتوليد خطة غذائية صحية تناسب المرارة والارتجاع.
                </p>
              </div>

              {!mealPlan && !isLoading && (
                <div className="flex justify-center mb-8">
                  <button
                    onClick={handleGenerateMealPlan}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-3 text-lg"
                  >
                    <CalendarDays size={24} />
                    توليد خطة الوجبات
                  </button>
                </div>
              )}

              {/* Meal Plan Results Area */}
              <AnimatePresence mode="wait">
                {mealPlan && !isLoading && (
                  <motion.div
                    key="meal-plan-result"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8"
                  >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="text-indigo-600" size={20} />
                        <h3 className="font-semibold text-slate-700">الخطة المقترحة</h3>
                      </div>
                      <button 
                        onClick={handleGenerateMealPlan}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <RefreshCw size={16} />
                        توليد خطة أخرى
                      </button>
                    </div>
                    <div className="p-6 md:p-8 markdown-content text-slate-700 text-lg leading-relaxed prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-indigo-900 prose-a:text-indigo-600 prose-p:leading-relaxed prose-li:my-1 prose-strong:text-slate-900 rtl:prose-li:marker:ml-2">
                      <Markdown>{mealPlan}</Markdown>
                    </div>
                  </motion.div>
                )}
                
                {isLoading && (
                  <motion.div
                    key="loading-meal-plan"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center gap-4"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse mt-2">يقوم المساعد الطبي بتجهيز خطة الوجبات لك...</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'fatCalculator' && (
            <FatCalculator />
          )}

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg flex items-start gap-3 mt-6"
              >
                <AlertCircle className="text-red-500 mt-0.5" size={20} />
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}

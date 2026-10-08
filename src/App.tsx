import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Apple, Search, Send, ChefHat, AlertCircle, RefreshCw, CalendarDays, Utensils, Scale, Camera, Clock, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';
import { FatCalculator } from './components/FatCalculator';
import { ImageScanner } from './components/ImageScanner';
import { RecoveryGuide } from './components/RecoveryGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<'evaluate' | 'imageScanner' | 'fatCalculator' | 'mealPlan'>('evaluate');
  const [foodInput, setFoodInput] = useState('');
  const [evaluation, setEvaluation] = useState('');
  const [mealPlan, setMealPlan] = useState('');
  const [mealPlanStage, setMealPlanStage] = useState<'initial' | 'post'>('initial');
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [planLoading, setPlanLoading] = useState(false);
  const [planError, setPlanError] = useState('');

  type Tab = typeof activeTab;
  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setEvalError('');
    setPlanError('');
  };

  const handleEvaluate = async () => {
    if (!foodInput.trim() || evalLoading) return;

    setEvalLoading(true);
    setEvalError('');
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
      setEvalError(err.message || 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setEvalLoading(false);
    }
  };

  const handleGenerateMealPlan = async (stage: 'initial' | 'post' = mealPlanStage) => {
    if (planLoading) return;
    setPlanLoading(true);
    setPlanError('');
    setMealPlan('');

    try {
      const response = await fetch('/api/meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إنشاء خطة الوجبات');
      }

      setMealPlan(data.result);
    } catch (err: any) {
      setPlanError(err.message || 'فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
    } finally {
      setPlanLoading(false);
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
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-none">مستشار التغذية العلاجية</h1>
              <p className="text-xs text-slate-500 mt-1">بعد استئصال المرارة وارتجاع المريء المزمن</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="max-w-3xl mx-auto">
          
          {/* Recovery Timeline & Differences Guide */}
          <RecoveryGuide />

          {/* Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-200/60 p-1 rounded-2xl mb-8 border border-slate-200/80 gap-1">
            <button
              type="button"
              onClick={() => switchTab('evaluate')}
              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-medium transition-all text-xs sm:text-sm cursor-pointer ${
                activeTab === 'evaluate' 
                  ? 'bg-white text-teal-700 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search size={16} className="shrink-0" />
              <span className="truncate">تقييم بالاسم</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('imageScanner')}
              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-medium transition-all text-xs sm:text-sm cursor-pointer ${
                activeTab === 'imageScanner' 
                  ? 'bg-white text-cyan-700 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Camera size={16} className="shrink-0 text-cyan-600" />
              <span className="truncate">فحص بالصورة/الكاميرا</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('fatCalculator')}
              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-medium transition-all text-xs sm:text-sm cursor-pointer ${
                activeTab === 'fatCalculator' 
                  ? 'bg-white text-amber-700 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Scale size={16} className="shrink-0 text-amber-600" />
              <span className="truncate">حاسبة الدهون</span>
            </button>
            <button
              type="button"
              onClick={() => switchTab('mealPlan')}
              className={`flex items-center justify-center gap-1.5 py-3 px-2 rounded-xl font-medium transition-all text-xs sm:text-sm cursor-pointer ${
                activeTab === 'mealPlan' 
                  ? 'bg-white text-indigo-700 shadow-sm font-bold' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CalendarDays size={16} className="shrink-0 text-indigo-600" />
              <span className="truncate">خطة يوم كامل</span>
            </button>
          </div>

          {activeTab === 'evaluate' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {/* Hero Section */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-50 text-teal-500 mb-4 shadow-sm border border-teal-100">
                  <Apple size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                  هل هذه الأكلة مناسبة بعد استئصال المرارة والارتجاع؟
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  أدخل اسم الأكلة أو المكون وسيقوم المساعد الطبي بتقييمها فوراً بناءً على ضوابط تدفق الصفراء وتجنب الإسهال الدهني وحماية صمام المريء مع مقارنة مرحلتي النقاهة والتكيف.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative mb-3 shadow-md rounded-2xl bg-white border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-teal-500 transition-all">
                <div className="flex items-center px-4 py-3">
                  <Search className="text-slate-400 ml-3" size={24} />
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 placeholder:text-slate-400 py-2"
                    placeholder="مثال: مكرونة بالبشاميل، تفاح، قهوة، سمك مشوي..."
                    value={foodInput}
                    onChange={(e) => setFoodInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={evalLoading}
                    maxLength={200}
                  />
                  <button
                    type="button"
                    onClick={handleEvaluate}
                    disabled={!foodInput.trim() || evalLoading}
                    className="mr-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white p-3 rounded-xl transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer"
                  >
                    {evalLoading ? (
                      <RefreshCw className="animate-spin" size={20} />
                    ) : (
                      <Send size={20} className="rotate-180" />
                    )}
                  </button>
                </div>
              </div>

              {/* Camera Scanner Shortcut */}
              <div className="flex items-center justify-between px-2 mb-8 text-xs text-slate-500">
                <span>هل لديك منتج معبأ أو جدول غذائي؟</span>
                <button
                  type="button"
                  onClick={() => switchTab('imageScanner')}
                  className="text-cyan-700 hover:text-cyan-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Camera size={14} />
                  فحص الملصق بالكاميرا / رفع صورة
                </button>
              </div>

              {/* Results Area */}
              <AnimatePresence mode="wait">
                {evaluation && !evalLoading && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8"
                  >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
                      <ChefHat className="text-teal-600" size={20} />
                      <h3 className="font-semibold text-slate-700">التقييم الطبي التغذوي</h3>
                    </div>
                    <div className="p-6 md:p-8 markdown-content text-slate-700 text-lg leading-relaxed">
                      <Markdown>{evaluation}</Markdown>
                    </div>
                  </motion.div>
                )}
                
                {evalLoading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center gap-4 mb-8"
                  >
                    <div className="relative w-16 h-16">
                      <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-teal-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-medium animate-pulse mt-2">يقوم المساعد الطبي بتحليل الأكلة ومطابقتها مع مرحلة ما بعد استئصال المرارة والارتجاع...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Info Cards */}
              {!evaluation && !evalLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      أمثلة مقبولة
                    </h4>
                    <ul className="text-sm text-green-700/80 space-y-2">
                      <li>• صدور الدجاج والسمك الأبيض المشوي بدون جلد أو زيوت</li>
                      <li>• الخضروات المسلوقة المقشرة (كوسة، جزر، بطاطس)</li>
                      <li>• التفاح والكمثرى والموز والأرز الأبيض</li>
                    </ul>
                  </div>
                  <div className="bg-red-50/50 rounded-xl p-5 border border-red-100">
                    <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      أمثلة ممنوعة
                    </h4>
                    <ul className="text-sm text-red-700/80 space-y-2">
                      <li>• المقليات والدهون الثقيلة والزيوت المهدرجة</li>
                      <li>• صلصة الطماطم الحمراء والليمون والبهارات الحارة</li>
                      <li>• القهوة والشوكولاتة والنعناع (ترخي صمام المريء)</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'imageScanner' && (
            <ImageScanner />
          )}

          {activeTab === 'fatCalculator' && (
            <FatCalculator />
          )}

          {activeTab === 'mealPlan' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 mb-4 shadow-sm border border-indigo-100">
                  <Utensils size={32} />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  خطة وجبات يوم كامل
                </h2>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  اختر مرحلتك الحالية لتوليد خطة غذائية صحية تناسب تدفق الصفراء وتمنع الارتجاع:
                </p>
              </div>

              {/* Stage Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  disabled={planLoading}
                  onClick={() => {
                    setMealPlanStage('initial');
                    handleGenerateMealPlan('initial');
                  }}
                  className={`p-4 rounded-xl border-2 text-right transition-all flex items-start gap-3 cursor-pointer ${
                    mealPlanStage === 'initial'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${mealPlanStage === 'initial' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">مرحلة النقاهة الأولى (أول شهرين)</h4>
                    <p className="text-xs text-slate-500 mt-1">وجبات شديدة الخفة (أقل من 3 جم دهن بالوجبة) مسلوقة لمنع الإسهال الصفراوي.</p>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={planLoading}
                  onClick={() => {
                    setMealPlanStage('post');
                    handleGenerateMealPlan('post');
                  }}
                  className={`p-4 rounded-xl border-2 text-right transition-all flex items-start gap-3 cursor-pointer ${
                    mealPlanStage === 'post'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${mealPlanStage === 'post' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">مرحلة ما بعد التكيف (بعد 3 أشهر)</h4>
                    <p className="text-xs text-slate-500 mt-1">تنوع أكبر مع دهون صحية معتدلة (5-7 جم بالوجبة) واستمرار حظر مهيجات الارتجاع.</p>
                  </div>
                </button>
              </div>

              {!mealPlan && !planLoading && (
                <div className="flex justify-center mb-8">
                  <button
                    type="button"
                    onClick={() => handleGenerateMealPlan(mealPlanStage)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-3 text-base cursor-pointer"
                  >
                    <CalendarDays size={22} />
                    توليد خطة الوجبات لهذه المرحلة
                  </button>
                </div>
              )}

              {/* Meal Plan Results Area */}
              <AnimatePresence mode="wait">
                {mealPlan && !planLoading && (
                  <motion.div
                    key="meal-plan-result"
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8"
                  >
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="text-indigo-600" size={20} />
                        <h3 className="font-semibold text-slate-700">
                          {mealPlanStage === 'initial' ? 'خطة وجبات مرحلة النقاهة الأولى' : 'خطة وجبات مرحلة ما بعد التكيف'}
                        </h3>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleGenerateMealPlan(mealPlanStage)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <RefreshCw size={16} />
                        توليد خطة أخرى
                      </button>
                    </div>
                    <div className="p-6 md:p-8 markdown-content text-slate-700 text-lg leading-relaxed">
                      <Markdown>{mealPlan}</Markdown>
                    </div>
                  </motion.div>
                )}
                
                {planLoading && (
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

          {/* Error Message */}
          <AnimatePresence>
            {(activeTab === 'evaluate' ? evalError : activeTab === 'mealPlan' ? planError : '') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg flex items-start gap-3 mt-6"
              >
                <AlertCircle className="text-red-500 mt-0.5" size={20} />
                <p className="text-red-800 text-sm font-medium">{activeTab === 'evaluate' ? evalError : planError}</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <p className="text-center text-xs text-slate-500 leading-relaxed border-t border-slate-200 pt-6">
          ⚕️ هذه المعلومات استرشادية ولا تغني عن استشارة الطبيب أو أخصائي التغذية المعالج.
        </p>
      </footer>
    </div>
  );
}

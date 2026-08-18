import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Info, 
  RotateCcw,
  Sparkles,
  Flame,
  ShieldCheck
} from 'lucide-react';

interface FoodItemPreset {
  name: string;
  fatPer100g: number; // in grams
  category: string;
}

const FOOD_PRESETS: FoodItemPreset[] = [
  // بروتينات خفيفة وآمنة
  { name: 'صدور دجاج مسلوقة/مشوية (بدون جلد)', fatPer100g: 1.8, category: 'بروتينات' },
  { name: 'سمك فيليه أبيض مشوي (بلطي/قاروص)', fatPer100g: 1.5, category: 'بروتينات' },
  { name: 'بياض بيض مسلوق', fatPer100g: 0.1, category: 'بروتينات' },
  { name: 'بيضة كاملة مسلوقة', fatPer100g: 10.0, category: 'بروتينات' },
  { name: 'لحم بقري أحمر مسلوق (خالي تماماً من الدهن)', fatPer100g: 5.0, category: 'بروتينات' },
  { name: 'سمك سلمون مشوي', fatPer100g: 12.0, category: 'بروتينات' },
  { name: 'لحم ضأن / لحم مفروم دسم', fatPer100g: 22.0, category: 'بروتينات' },

  // نشويات وخضار
  { name: 'أرز أبيض مسلوق (بدون دهن)', fatPer100g: 0.4, category: 'نشويات' },
  { name: 'مكرونة مسلوقة (بدون صوص)', fatPer100g: 0.9, category: 'نشويات' },
  { name: 'بطاطس مسلوقة / بيوريه بدون زبدة', fatPer100g: 0.2, category: 'نشويات' },
  { name: 'بطاطس مقلية (شيبس/فرنش فرايز)', fatPer100g: 16.0, category: 'نشويات' },
  { name: 'شوفان مطبوخ بالماء', fatPer100g: 1.4, category: 'نشويات' },
  { name: 'خضار سوتيه/مسلوق (كوسة، جزر، فاصوليا)', fatPer100g: 0.3, category: 'خضروات' },
  { name: 'خبز بلدي / أسمر', fatPer100g: 1.5, category: 'نشويات' },

  // ألبان ودهون
  { name: 'جبن قريش طبيعي قليل/خالي الدسم', fatPer100g: 0.8, category: 'ألبان' },
  { name: 'زبادي خالي الدسم', fatPer100g: 0.2, category: 'ألبان' },
  { name: 'حليب كامل الدسم', fatPer100g: 3.5, category: 'ألبان' },
  { name: 'جبن شيدر / رومي / موتزاريلا', fatPer100g: 30.0, category: 'ألبان' },
  { name: 'زيت زيتون (ملعقة صغيرة = 5 جرام دهن)', fatPer100g: 100.0, category: 'دهون' },
  { name: 'زبدة / سمن بلدي', fatPer100g: 82.0, category: 'دهون' },
];

interface MealItem {
  id: string;
  name: string;
  weightGrams: number;
  fatPer100g: number;
}

export function FatCalculator() {
  const [items, setItems] = useState<MealItem[]>([
    { id: '1', name: 'صدور دجاج مسلوقة/مشوية (بدون جلد)', weightGrams: 150, fatPer100g: 1.8 },
    { id: '2', name: 'أرز أبيض مسلوق (بدون دهن)', weightGrams: 150, fatPer100g: 0.4 },
    { id: '3', name: 'خضار سوتيه/مسلوق (كوسة، جزر، فاصوليا)', weightGrams: 100, fatPer100g: 0.3 },
  ]);

  // For adding new item
  const [selectedPreset, setSelectedPreset] = useState<string>(FOOD_PRESETS[0].name);
  const [customName, setCustomName] = useState<string>('');
  const [customFatPer100g, setCustomFatPer100g] = useState<number>(2);
  const [newWeight, setNewWeight] = useState<number>(100);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  const calculateItemFat = (item: MealItem) => {
    return (item.weightGrams * item.fatPer100g) / 100;
  };

  const totalMealWeight = items.reduce((sum, item) => sum + Number(item.weightGrams || 0), 0);
  const totalMealFat = items.reduce((sum, item) => sum + calculateItemFat(item), 0);

  const handleAddItem = () => {
    if (isCustomMode) {
      if (!customName.trim()) return;
      const newItem: MealItem = {
        id: Date.now().toString(),
        name: customName.trim(),
        weightGrams: Math.max(1, newWeight),
        fatPer100g: Math.max(0, customFatPer100g),
      };
      setItems([...items, newItem]);
      setCustomName('');
    } else {
      const preset = FOOD_PRESETS.find(p => p.name === selectedPreset);
      if (!preset) return;
      const newItem: MealItem = {
        id: Date.now().toString(),
        name: preset.name,
        weightGrams: Math.max(1, newWeight),
        fatPer100g: preset.fatPer100g,
      };
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleUpdateWeight = (id: string, newWeightGrams: number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, weightGrams: Math.max(0, newWeightGrams) } : item
    ));
  };

  const handleReset = () => {
    setItems([]);
  };

  // Evaluation status
  // Post-cholecystectomy clinical safety thresholds per single meal:
  // <= 3g: Ideal / Very Low Fat (Best during initial recovery weeks)
  // 3.1 - 6g: Safe for post-cholecystectomy recovery & GERD
  // 6.1 - 10g: Borderline / Allowed after full recovery adaptation
  // > 10g: Danger / Exceeds liver bile direct digestive capacity & triggers GERD
  const getSafetyStatus = (fat: number) => {
    if (fat <= 3.0) {
      return {
        level: 'safe-ideal',
        badge: 'آمنة ومثالية جداً',
        color: 'emerald',
        bgBox: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        progressBarColor: 'bg-emerald-500',
        icon: <ShieldCheck className="text-emerald-600" size={24} />,
        title: 'وجبة مثالية لفترة النقاهة بعد الاستئصال ولمرضى الارتجاع',
        description: 'كمية الدهون ضئيلة للغاية (أقل من 3 جم)، وهي الأنسب للأسابيع الأولى بعد العملية لمنع الإسهال الصفراوي وحماية صمام المريء من الارتجاع.',
      };
    } else if (fat <= 6.0) {
      return {
        level: 'safe-good',
        badge: 'مناسبة وضمن النطاق الآمن',
        color: 'teal',
        bgBox: 'bg-teal-50 border-teal-200 text-teal-900',
        progressBarColor: 'bg-teal-500',
        icon: <CheckCircle2 className="text-teal-600" size={24} />,
        title: 'وجبة معتدلة ومناسبة لمرحلة ما بعد استئصال المرارة',
        description: 'كمية الدهون (3-6 جم) ملائمة بعد مرور أول أسابيع من العملية ومع مرحلة التكيف الهضمي، ولا تثقل صمام المريء.',
      };
    } else if (fat <= 10.0) {
      return {
        level: 'warning',
        badge: 'الحد الأقصى - مسموح فقط بعد التعافي التام',
        color: 'amber',
        bgBox: 'bg-amber-50 border-amber-300 text-amber-900',
        progressBarColor: 'bg-amber-500',
        icon: <AlertTriangle className="text-amber-600" size={24} />,
        title: 'تقترب من الحد الأقصى (غير مناسبة داخل فترة النقاهة الأولى)',
        description: 'تحتوي الوجبة على (6-10 جم دهون)، وهذا الحد مسموح فقط بعد مرور 2-3 أشهر من العملية وبعد تكيف القنوات الصفراوية، مع تجنب الاستلقاء بعدها.',
      };
    } else {
      return {
        level: 'danger',
        badge: '⚠️ تحذير: تتجاوز قدرة القنوات الصفراوية!',
        color: 'rose',
        bgBox: 'bg-rose-50 border-rose-300 text-rose-900',
        progressBarColor: 'bg-rose-600',
        icon: <AlertCircle className="text-rose-600" size={24} />,
        title: 'خطر إسهال صفراوي حاد وارتخاء صمام المريء!',
        description: 'تتجاوز الوجبة 10 جرامات دهون! لعدم وجود خزان المرارة، لا تستطيع العصارة الصفراوية المتقطرة هضم هذا المقدار مما يسبب إسهالاً صفراوياً دهنياً، مع بطء تفريغ المعدة وتفاقم ارتجاع الأحماض للمريء.',
      };
    }
  };

  const status = getSafetyStatus(totalMealFat);
  const maxScaleFat = 15; // visual bar max
  const progressPercent = Math.min(100, Math.round((totalMealFat / maxScaleFat) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mb-4 shadow-sm border border-amber-100">
          <Scale size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          حاسبة دهون الوجبة بعد استئصال المرارة
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          أدخل وزن مكونات وجبتك لمعرفة كمية الدهون الصافية والتأكد من مطابقتها لفترة النقاهة (أقل من 3-5 جم) أو مرحلة ما بعد التكيف (أقل من 7-10 جم).
        </p>
      </div>

      {/* Real-time Safety Gauge Card */}
      <div className={`p-6 rounded-2xl border-2 transition-all shadow-sm ${status.bgBox}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/80 shadow-xs">
              {status.icon}
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white shadow-xs">
                {status.badge}
              </span>
              <h3 className="font-bold text-lg mt-1 text-slate-900">{status.title}</h3>
            </div>
          </div>

          <div className="text-left sm:text-right bg-white/90 px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs text-slate-500 block">إجمالي دهون الوجبة</span>
            <span className={`text-2xl font-black ${totalMealFat > 10 ? 'text-rose-600' : 'text-slate-900'}`}>
              {totalMealFat.toFixed(1)} <span className="text-sm font-semibold text-slate-600">جم دهون</span>
            </span>
          </div>
        </div>

        {/* Progress Bar with markers */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>0 جم (مثالي)</span>
            <span className="text-emerald-700 font-bold">5 جم (آمن)</span>
            <span className="text-amber-700 font-bold">10 جم (أقصى حد)</span>
            <span className="text-rose-700 font-bold">15+ جم (خطر)</span>
          </div>
          <div className="h-4 bg-slate-200 rounded-full overflow-hidden relative shadow-inner p-0.5">
            <motion.div 
              className={`h-full rounded-full transition-all duration-500 ${status.progressBarColor}`}
              style={{ width: `${progressPercent}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
            />
            {/* 10g Threshold Marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-red-700 z-10" 
              style={{ left: `${(10 / maxScaleFat) * 100}%` }}
              title="الحد الأقصى المسموح (10 جم)"
            />
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          {status.description}
        </p>

        {totalMealFat > 10 && (
          <div className="mt-4 p-3.5 bg-white/90 rounded-xl border border-rose-200 text-rose-950 text-xs sm:text-sm flex items-start gap-2.5">
            <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-bold">نصيحة طبية لتقليل دهون هذه الوجبة:</p>
              <p className="mt-0.5 text-rose-800">
                قلل وزن المكونات عالية الدسم، أو استبدل الزيوت واللحوم الدسمة بخيارات مسلوقة/مشوية خالية تماماً من الدهون لإنزال الرقم تحت 7-10 جرام.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Meal Items Manager */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Flame className="text-teal-600" size={20} />
            <h3 className="font-bold text-slate-900 text-lg">مكونات الوجبة الحالية</h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
              الوزن الإجمالي: {totalMealWeight} جم
            </span>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw size={14} />
              مسح الكل
            </button>
          )}
        </div>

        {/* List of items */}
        {items.length === 0 ? (
          <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-500 text-sm">لم تقم بإضافة أي مكونات للوجبة بعد.</p>
            <p className="text-slate-400 text-xs mt-1">اختر من القائمة أدناه أو أضف مكوناً بوزنه لحساب دهون الوجبة.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const itemFat = calculateItemFat(item);
              return (
                <div 
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 gap-3 hover:border-slate-300 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-800 text-sm sm:text-base">{item.name}</h4>
                    <span className="text-xs text-slate-500">
                      نسبة الدهون: {item.fatPer100g} جم لكل 100 جم
                    </span>
                  </div>

                  <div className="flex items-center gap-3 justify-between sm:justify-end">
                    {/* Weight Controller */}
                    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-xs text-slate-500">الوزن:</span>
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        step="10"
                        value={item.weightGrams}
                        onChange={(e) => handleUpdateWeight(item.id, Number(e.target.value))}
                        className="w-16 text-center font-bold text-slate-800 border-none outline-none text-sm"
                      />
                      <span className="text-xs text-slate-500">جم</span>
                    </div>

                    {/* Calculated fat for this item */}
                    <div className="w-20 text-left">
                      <span className="text-xs text-slate-400 block">الدهون:</span>
                      <span className="font-bold text-sm text-slate-800">{itemFat.toFixed(1)} جم</span>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="حذف المكون"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Food Component Section */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
              <Plus size={16} className="text-teal-600" />
              إضافة مكون إلى الوجبة:
            </h4>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  !isCustomMode ? 'bg-teal-100 text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                أطعمة جاهزة
              </button>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  isCustomMode ? 'bg-teal-100 text-teal-800 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                إدخال مخصص
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            {!isCustomMode ? (
              <div className="sm:col-span-6">
                <label className="block text-xs font-medium text-slate-600 mb-1">اختر نوع الطعام:</label>
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {FOOD_PRESETS.map((preset) => (
                    <option key={preset.name} value={preset.name}>
                      {preset.name} ({preset.fatPer100g} جم دهن/100 جم)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div className="sm:col-span-4">
                  <label className="block text-xs font-medium text-slate-600 mb-1">اسم الطعام المخصص:</label>
                  <input
                    type="text"
                    placeholder="مثال: جبنة لايت، شوربة..."
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">دهون/100جم:</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={customFatPer100g}
                    onChange={(e) => setCustomFatPer100g(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            {/* Weight Input */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">الوزن المقترح (جرام):</label>
              <input
                type="number"
                min="5"
                max="1000"
                step="25"
                value={newWeight}
                onChange={(e) => setNewWeight(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>

            {/* Add Button */}
            <div className="sm:col-span-3">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus size={16} />
                أضف للوجبة
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference Rules for Gallbladder & GERD */}
      <div className="bg-slate-100/80 rounded-2xl p-6 border border-slate-200">
        <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
          <Info className="text-teal-600" size={18} />
          إرشادات طبية سريعة لحساب دهون مرضى المرارة:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-700">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <strong className="text-emerald-700 block mb-1">🟢 الوجبة الخفيفة (السناك):</strong>
            لا تتجاوز <span className="font-bold">2 - 3 جرام</span> دهون (مثل تفاحة، خيارة، أو زبادي خالي الدسم).
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <strong className="text-teal-700 block mb-1">🟡 الوجبة الرئيسية:</strong>
            المعدل المثالي <span className="font-bold">3 - 7 جرام</span> دهون، وأقصى حد مسموح هو <span className="font-bold">10 جرام</span>.
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
            <strong className="text-rose-700 block mb-1">🔴 إجمالي اليوم بالكامل:</strong>
            يُفضل ألا يتعدى إجمالي دهون اليوم <span className="font-bold">25 - 35 جرام</span> موزعة على 5 وجبات صغيرة.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Flame, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Activity,
  HeartHandshake
} from 'lucide-react';

export function RecoveryGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<'initial' | 'post'>('initial');

  return (
    <div className="bg-gradient-to-br from-teal-50/80 via-white to-indigo-50/50 border border-teal-200/80 rounded-2xl p-5 md:p-6 mb-8 shadow-xs">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Clock size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-base md:text-lg">
                دليل مرحلة النقاهة بعد استئصال المرارة
              </h3>
              <span className="text-[11px] font-semibold bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full">
                مدة التكيف: 4 - 8 أسابيع
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-600 mt-0.5">
              كيف يختلف هضمك ونظامك الغذائي داخل فترة النقاهة عن ما بعد اكتمال التكيف مع ارتجاع المريء؟
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-start sm:self-center flex items-center gap-1.5 text-xs md:text-sm font-bold text-teal-700 hover:text-teal-900 bg-teal-100/70 hover:bg-teal-100 px-3.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          {isOpen ? (
            <>
              <span>إخفاء التفاصيل</span>
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <span>عرض الفروقات الطبية</span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-teal-100 mt-5 space-y-6">
              
              {/* Phase Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl max-w-md mx-auto gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedPhase('initial')}
                  className={`py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all ${
                    selectedPhase === 'initial'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ⏳ داخل فترة النقاهة (أول شهرين)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPhase('post')}
                  className={`py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition-all ${
                    selectedPhase === 'post'
                      ? 'bg-white text-indigo-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  🌿 ما بعد التكيف (بعد 3-6 أشهر)
                </button>
              </div>

              {/* Phase 1 Details */}
              {selectedPhase === 'initial' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs md:text-sm">
                    <div className="flex items-center gap-2 text-amber-900 font-bold mb-1.5">
                      <AlertTriangle size={17} className="text-amber-600 shrink-0" />
                      الوضع الفسيولوجي داخل فترة النقاهة الأولية (1 - 8 أسابيع):
                    </div>
                    <p className="text-amber-800 leading-relaxed">
                      بعد استئصال المرارة مباشرة، يفقد الجسم خزان تجميع وتركيز العصارة الصفراوية. يقطر سائل الصفراء باستمرار من الكبد إلى الأمعاء بتركيز خفيف. الجهاز الهضمي غير مهيأ لمعالجة أي كميات دهون مفاجئة.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm mb-2 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-teal-600" />
                        القواعد الصارمة داخل النقاهة:
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                        <li><strong>الدهون:</strong> أقل من <strong>3 - 5 جم بالوجبة</strong> كحد أقصى.</li>
                        <li><strong>طريقة الطهي:</strong> السلق والشوي الخفيف بالبخار فقط (منع الزيوت تماماً).</li>
                        <li><strong>توزيع الطعام:</strong> 5 إلى 6 وجبات صغيرة متفرقة لتجنب الضغط على المعدة والمريء.</li>
                        <li><strong>الألياف:</strong> التدرج في الألياف (خضار مسلوق مقشر) لتفادي الغازات والإسهال.</li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm mb-2 flex items-center gap-2">
                        <Flame size={16} className="text-rose-600" />
                        المخاطر المحتملة عند التجاوز:
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                        <li><strong>إسهال صفراوي حاد (Bile Diarrhea):</strong> خروج الصفراء غير الممتصة للأمعاء الغليظة.</li>
                        <li><strong>انتفاخ وتقلصات معوية:</strong> ناتجة عن تخمر الدهون غير المهضومة.</li>
                        <li><strong>نوبات ارتجاع مريء شديدة:</strong> لأن الدهون تؤخر تفريغ المعدة وترخي الصمام السفلي للمريء.</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Phase 2 Details */}
              {selectedPhase === 'post' && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 text-xs md:text-sm">
                    <div className="flex items-center gap-2 text-indigo-900 font-bold mb-1.5">
                      <Sparkles size={17} className="text-indigo-600 shrink-0" />
                      الوضع الفسيولوجي بعد اكتمال التكيف الهضمي (بعد 3 - 6 أشهر):
                    </div>
                    <p className="text-indigo-800 leading-relaxed">
                      تتوسع القناة الصفراوية العامة (<span dir="ltr">Common Bile Duct</span>) تدريجياً لتعويض جزء من وظيفة التخزين، وتتكيف بطانة الأمعاء على امتصاص الأحماض الصفراوية، مما يمنح استقراراً معوياً ملحوظاً.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm mb-2 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-indigo-600" />
                        ما يُسمح به بعد التكيف:
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                        <li><strong>الدهون الصحية:</strong> التدرج الحذر في إدخال دهون خفيفة (مثل ملعقة صغيرة زيت زيتون على البارد) بمعدل <strong>5 - 7 جم بالوجبة</strong>.</li>
                        <li><strong>الألياف الكاملة:</strong> القدرة على تحمل الشوفان، الخبز الأسمر، والخضروات النيئة غير الحمضية.</li>
                        <li><strong>مرونة أكبر في التنوع الغذائي</strong> دون حدوث إسهال صفراوي مفاجئ.</li>
                      </ul>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                      <h4 className="font-bold text-slate-800 text-xs md:text-sm mb-2 flex items-center gap-2">
                        <AlertTriangle size={16} className="text-amber-600" />
                        المحاذير المستمرة (بسبب الارتجاع المزمن):
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                        <li><strong>مهيجات الصمام محظورة دائماً:</strong> الشوكولاتة، الكافيين، النعناع، الطماطم، والحمضيات.</li>
                        <li><strong>المقليات والوجبات الدسمة (أكثر من 10 جم دهن):</strong> تظل ممنوعة تماماً لحماية صمام المريء وتفادي الارتجاع الصفراوي/الحمضي.</li>
                        <li><strong>قاعدة النوم:</strong> عدم النوم إلا بعد مرور 3 ساعات على آخر وجبة ورفع الرأس.</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Quick Summary Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
                <div className="bg-slate-100/80 px-4 py-2.5 font-bold text-slate-800 border-b border-slate-200">
                  📊 جدول المقارنة السريع بين المرحلتين
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-3 font-semibold">المعيار</th>
                        <th className="p-3 font-semibold text-teal-800">داخل فترة النقاهة (أول شهرين)</th>
                        <th className="p-3 font-semibold text-indigo-800">بعد اكتمال التكيف (بعد 3-6 أشهر)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="p-3 font-semibold bg-slate-50/50">الحد الأقصى للدهون بالوجبة</td>
                        <td className="p-3 text-teal-700 font-bold">3 - 5 جرامات فقط</td>
                        <td className="p-3 text-indigo-700 font-bold">5 - 7 جرامات (بحد أقصى 10 جم)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold bg-slate-50/50">طريقة الطهي</td>
                        <td className="p-3">مسلوق أو مشوي مجرد بدون زيوت</td>
                        <td className="p-3">مشوي / مسلوق مع إمكانية مسحة زيت زيتون بسيطة</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold bg-slate-50/50">احتمالية الإسهال الصفراوي</td>
                        <td className="p-3 text-amber-700">عالية جداً عند أي دهون غير متوقعة</td>
                        <td className="p-3 text-emerald-700">منخفضة ومستقرة مع الالتزام</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-semibold bg-slate-50/50">مهيجات الارتجاع (حمضيات، شطة، نعناع)</td>
                        <td className="p-3 text-rose-600 font-bold">ممنوعة تماماً</td>
                        <td className="p-3 text-rose-600 font-bold">ممنوعة دائماً لحماية صمام المريء</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

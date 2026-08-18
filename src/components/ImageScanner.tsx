import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  X, 
  FileText, 
  ScanLine,
  Image as ImageIcon,
  SwitchCamera,
  ChefHat
} from 'lucide-react';
import Markdown from 'react-markdown';

export function ImageScanner() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [userNotes, setUserNotes] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Start live webcam / camera stream
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    stopCameraStream();
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('الكاميرا المباشرة غير مدعومة في هذا المتصفح، يمكنك رفع الصورة مباشرة.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera error:', err);
      setCameraError(err.message || 'تعذر فتح الكاميرا، يرجى السماح بإذن الكاميرا أو استخدام خيار رفع الصورة.');
      setIsCameraActive(false);
    }
  };

  // Switch camera between back and front
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCamera(nextFacing);
  };

  // Capture frame from video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setImageSrc(dataUrl);
    setMimeType('image/jpeg');
    setAnalysisResult(null);
    setError(null);
    stopCameraStream();
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Handle uploaded file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageSrc(result);
      setMimeType(file.type || 'image/jpeg');
      setAnalysisResult(null);
      setError(null);
      stopCameraStream();
    };
    reader.readAsDataURL(file);
  };

  // Send image to backend API
  const handleAnalyzeImage = async () => {
    if (!imageSrc) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/evaluate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: imageSrc,
          mimeType: mimeType,
          userNotes: userNotes.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء فحص الصورة');
      }

      setAnalysisResult(data.result);
    } catch (err: any) {
      setError(err.message || 'تعذر تحليل الصورة، يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetImage = () => {
    setImageSrc(null);
    setAnalysisResult(null);
    setError(null);
    stopCameraStream();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 mb-4 shadow-sm border border-cyan-100">
          <ScanLine size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
          فحص المنتج بالكاميرا والملصق الغذائي
        </h2>
        <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          التقط صورة لجدول القيمة الغذائية (Nutrition Facts) أو قائمة المكونات لأي منتج وسيقوم المساعد الذكي بفحص الدهون ومحفزات الارتجاع وحدود الحصة الآمنة لحالتك.
        </p>
      </div>

      {/* Main Upload / Camera Area */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        
        {/* If Camera is active */}
        {isCameraActive && (
          <div className="space-y-4 mb-6">
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video max-h-[400px] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
                <span className="text-xs bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full flex items-center gap-1.5 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  الكاميرا نشطة
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    title="تبديل الكاميرا"
                  >
                    <SwitchCamera size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                    title="إغلاق الكاميرا"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Target Scan Guide Frame */}
              <div className="absolute inset-8 md:inset-12 border-2 border-dashed border-white/60 rounded-xl pointer-events-none flex items-center justify-center">
                <span className="text-white/80 text-xs bg-black/40 px-3 py-1 rounded-md">
                  وجّه الكاميرا نحو جدول المكونات أو القيمة الغذائية
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={capturePhoto}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all text-base"
              >
                <Camera size={20} />
                التقاط الصورة الآن
              </button>
            </div>
          </div>
        )}

        {/* Camera Error Notice if any */}
        {cameraError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm mb-6 flex items-start gap-2.5">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <p className="font-semibold">تنبيه الكاميرا:</p>
              <p className="mt-0.5 text-xs text-amber-800">{cameraError}</p>
            </div>
          </div>
        )}

        {/* Image Preview if captured/uploaded */}
        {imageSrc && !isCameraActive && (
          <div className="space-y-5 mb-6">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 max-h-[380px] flex items-center justify-center group">
              <img
                src={imageSrc}
                alt="Product preview"
                className="max-h-[360px] w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={handleResetImage}
                className="absolute top-3 left-3 bg-black/70 hover:bg-rose-600 text-white p-2 rounded-full transition-colors shadow-md"
                title="حذف وتغيير الصورة"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-400" />
                تم تحميل الصورة بنجاح
              </div>
            </div>

            {/* Optional Notes Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ملاحظات إضافية أو حجم الحصة المخطط تناولها (اختياري):
              </label>
              <input
                type="text"
                placeholder="مثال: أنوي تناول نصف العلبة، أو ملعقتين فقط..."
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>

            {/* Analyze Button */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleAnalyzeImage}
                disabled={isAnalyzing}
                className="w-full sm:flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-300 text-white font-bold py-3.5 px-6 rounded-xl text-base transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    جاري فحص المكونات والدهون...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    فحص ملاءمة المنتج للحالة
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetImage}
                className="w-full sm:w-auto px-5 py-3.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors"
              >
                تغيير الصورة
              </button>
            </div>
          </div>
        )}

        {/* Buttons to Choose or Capture when no image is loaded & camera not open */}
        {!imageSrc && !isCameraActive && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Open Live Camera */}
              <button
                type="button"
                onClick={() => startCamera('environment')}
                className="p-6 rounded-2xl border-2 border-cyan-100 bg-cyan-50/50 hover:bg-cyan-50 hover:border-cyan-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                  <Camera size={28} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">استخدام الكاميرا المباشرة</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  التقط صورة لملصق المنتج أو جدول القيمة الغذائية مباشرة من الكاميرا
                </p>
              </button>

              {/* Option 2: Upload File / Gallery */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-slate-200 border-dashed bg-slate-50/70 hover:bg-slate-100 hover:border-slate-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-700 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                  <Upload size={28} />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-1">رفع صورة من الجهاز</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  اختر صورة محفوظة للمنتج، أو قم بسحب وإفلات الصورة هنا
                </p>
              </button>
            </div>

            {/* Hidden Inputs for File Selection & Mobile Native Camera */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Practical Photographic Tips for Users */}
            <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                <FileText size={15} className="text-cyan-600" />
                للحصول على أدق تحليل طبي:
              </h4>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                <li>احرص على وضوح <strong>جدول القيمة الغذائية (Nutrition Facts)</strong> وخاصة سطر إجمالي الدهون والدهون المشبعة.</li>
                <li>تأكد من شمول <strong>قائمة المكونات (Ingredients)</strong> لاكتشاف الزيوت المهدرجة أو الطماطم أو البهارات المخفية.</li>
              </ul>
            </div>
          </div>
        )}

      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Analysis Result Display */}
      <AnimatePresence mode="wait">
        {analysisResult && !isAnalyzing && (
          <motion.div
            key="analysis-result"
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ChefHat className="text-cyan-600" size={20} />
                <h3 className="font-semibold text-slate-700">تقرير الفحص الغذائي للمنتج</h3>
              </div>
              <button
                type="button"
                onClick={handleResetImage}
                className="text-xs text-cyan-700 hover:text-cyan-900 font-medium bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <RefreshCw size={14} />
                فحص منتج آخر
              </button>
            </div>
            <div className="p-6 md:p-8 markdown-content text-slate-700 text-lg leading-relaxed">
              <Markdown>{analysisResult}</Markdown>
            </div>
          </motion.div>
        )}

        {isAnalyzing && (
          <motion.div
            key="loading-scanner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-600 font-medium animate-pulse mt-2 text-center">
              يقوم الخبير الطبي بقراءة جدول القيمة الغذائية ومطابقته مع حدود المرارة والارتجاع...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


import React, { useState, useRef, useEffect } from 'react';
import { AllergyType, MealAnalysisResult, SafetyLevel } from '../types';
import { analyzeMealSafety } from '../services/geminiService';
import { Spinner } from './Spinner';

const MealAnalyzer: React.FC = () => {
  const [mealName, setMealName] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MealAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const allergiesList = Object.values(AllergyType);

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("لا يمكن الوصول للكاميرا. الرجاء التأكد من الصلاحيات.");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
      }
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!mealName.trim() && !capturedImage) || selectedAllergies.length === 0) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const analysis = await analyzeMealSafety(mealName, selectedAllergies, capturedImage || undefined);
      setResult(analysis);
    } catch (err) {
      setError("حدث خطأ أثناء تحليل الوجبة. تأكد من الاتصال بالإنترنت.");
    } finally {
      setLoading(false);
    }
  };

  const getSafetyIcon = (level: SafetyLevel) => {
    switch (level) {
      case SafetyLevel.SAFE:
        return (
          <div className="bg-green-100 p-5 rounded-full inline-block shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case SafetyLevel.CAUTION:
        return (
           <div className="bg-yellow-100 p-5 rounded-full inline-block shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case SafetyLevel.UNSAFE:
        return (
           <div className="bg-red-100 p-5 rounded-full inline-block shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 pb-24 relative">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-2">الفحص الذكي للوجبات</h2>
        <p className="text-gray-500">حلل محتويات وجبتك عبر الصورة أو الاسم لضمان سلامتك</p>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-gray-100 mb-8">
        {/* Camera/Image Section */}
        <div className="mb-8">
           {!capturedImage && !showCamera && (
             <button
               type="button"
               onClick={startCamera}
               className="w-full aspect-video border-2 border-dashed border-teal-200 rounded-3xl flex flex-col items-center justify-center text-teal-600 hover:bg-teal-50 hover:border-teal-400 transition-all duration-300 group overflow-hidden bg-teal-50/30"
             >
               <div className="bg-white p-5 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-md border border-teal-100">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
               </div>
               <span className="text-lg font-black mb-1">صوّر وجبتك الآن</span>
               <span className="text-sm text-teal-500 font-medium">للتحليل الفوري عبر الذكاء الاصطناعي</span>
             </button>
           )}

           {capturedImage && (
             <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl group animate-fade-in">
               <img src={capturedImage} alt="Captured Meal" className="w-full aspect-video object-cover" />
               <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
               <button
                 type="button"
                 onClick={() => setCapturedImage(null)}
                 className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-2xl shadow-lg transition-all active:scale-95"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
               <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-4 py-2 rounded-xl text-teal-800 text-sm font-black shadow-sm">
                 ✅ تم التقاط الوجبة
               </div>
             </div>
           )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">اسم الوجبة</label>
            <input
              type="text"
              placeholder={capturedImage ? "هل ترغب في إضافة اسم للوجبة؟" : "مثلاً: كبسة، سليق، بروستد..."}
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className="w-full p-5 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 bg-gray-50/50 text-gray-800 font-bold placeholder:font-normal placeholder:text-gray-400"
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 mb-4">ما هي الحساسية التي تهمك؟ (اختر واحدة أو أكثر)</label>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
               {allergiesList.map((allergy) => {
                 const isSelected = selectedAllergies.includes(allergy);
                 return (
                   <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`py-4 px-2 rounded-2xl text-center transition-all border-2 font-bold text-xs shadow-sm ${
                      isSelected ? 'bg-teal-600 text-white border-teal-600 scale-[1.02] shadow-teal-200' : 'bg-white text-gray-700 border-gray-100 hover:border-teal-200 hover:bg-teal-50/30'
                    }`}
                   >
                     {allergy}
                   </button>
                 );
               })}
             </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || ((!mealName.trim() && !capturedImage) || selectedAllergies.length === 0)}
            className="w-full bg-slate-900 hover:bg-black text-white font-black text-xl py-5 px-6 rounded-[1.5rem] transition-all shadow-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] mt-4"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-3"></div>
                جاري التحليل...
              </div>
            ) : "حلل الوجبة الآن"}
          </button>
        </div>
      </div>

      {/* Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover w-full h-full" />
          <div className="absolute bottom-0 left-0 right-0 p-10 flex justify-between items-center bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <button onClick={stopCamera} className="text-white font-bold bg-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">إلغاء</button>
            <button onClick={captureImage} className="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center group">
              <div className="w-16 h-16 bg-white rounded-full group-active:scale-90 transition-transform shadow-lg"></div>
            </button>
            <div className="w-20"></div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-5 rounded-3xl text-center border border-red-100 font-black mb-8 animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        <div className="animate-slide-up space-y-8">
          {/* Main Status Header */}
          <div className={`p-10 rounded-[2.5rem] border-4 flex flex-col items-center text-center shadow-2xl ${
             result.safetyStatus === SafetyLevel.SAFE ? 'bg-green-50 border-green-200' :
             result.safetyStatus === SafetyLevel.CAUTION ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
          }`}>
            {getSafetyIcon(result.safetyStatus)}
            <h3 className={`text-3xl font-black mt-6 mb-4 ${
              result.safetyStatus === SafetyLevel.SAFE ? 'text-green-800' :
              result.safetyStatus === SafetyLevel.CAUTION ? 'text-yellow-800' : 'text-red-800'
            }`}>
              {result.safetyStatus === SafetyLevel.SAFE ? 'هذه الوجبة آمنة لك ✅' :
               result.safetyStatus === SafetyLevel.CAUTION ? 'انتبه! كن حذراً ⚠️' : 'الوجبة غير مناسبة ❌'}
            </h3>
            <p className="text-lg font-medium text-slate-600 max-w-lg leading-relaxed">{result.explanation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Ingredients Card */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="font-black text-slate-800 text-xl mb-6 flex items-center">
                    <span className="bg-teal-100 p-2.5 rounded-xl ml-3">🥘</span>
                    المكونات المحللة
                </h4>
                
                {result.potentialAllergens.length > 0 && (
                    <div className="mb-6">
                        <p className="text-sm font-black text-red-600 mb-3 flex items-center">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full ml-2"></span>
                          مصادر خطر محتملة:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.potentialAllergens.map((ing, i) => (
                              <span key={i} className="bg-red-50 text-red-700 px-3 py-1.5 rounded-xl text-sm font-bold border border-red-100">{ing}</span>
                            ))}
                        </div>
                    </div>
                )}
                
                <div>
                     <p className="text-sm font-black text-green-700 mb-3 flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full ml-2"></span>
                        مكونات آمنة لسلامتك:
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {result.safeIngredients.map((ing, i) => (
                          <span key={i} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-sm font-bold border border-green-100">{ing}</span>
                        ))}
                    </div>
                </div>
             </div>

             {/* Alternatives Card */}
             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <h4 className="font-black text-slate-800 text-xl mb-6 flex items-center">
                    <span className="bg-yellow-100 p-2.5 rounded-xl ml-3">💡</span>
                    نصائح وبدائل آمنة
                </h4>
                <div className="space-y-4">
                    {result.alternatives.map((alt, i) => (
                        <div key={i} className="flex items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <span className="text-teal-600 ml-3 text-lg font-black">←</span>
                            <span className="text-slate-700 font-bold leading-relaxed">{alt}</span>
                        </div>
                    ))}
                </div>
             </div>
          </div>
          
          <div className="bg-slate-900 p-8 rounded-3xl text-white text-center">
              <h5 className="font-black text-xl mb-2">تذكر دوماً..</h5>
              <p className="text-slate-400">هذا التحليل استرشادي مبني على الذكاء الاصطناعي، يرجى سؤال مقدم الخدمة للتأكيد النهائي.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealAnalyzer;

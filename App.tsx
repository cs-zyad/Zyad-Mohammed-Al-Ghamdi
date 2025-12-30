
import React, { useState } from 'react';
import RestaurantFinder from './components/RestaurantFinder';
import MealAnalyzer from './components/MealAnalyzer';
import InteractiveMap from './components/InteractiveMap';

enum Tab {
  FINDER = 'finder',
  ANALYZER = 'analyzer',
  MAP = 'map'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.FINDER);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShowOnMap = (restaurantName: string) => {
    setSelectedRestaurant(restaurantName);
    setActiveTab(Tab.MAP);
  };

  const handleShare = () => {
    // Use native sharing if available (Mobile)
    if (navigator.share) {
      navigator.share({
        title: 'Safe Meal - زاد الحاج الآمن',
        text: 'دليلك الغذائي الآمن في مكة والمشاعر المقدسة. افحص وجباتك وابحث عن مطاعم آمنة.',
        url: window.location.href,
      }).catch((err) => console.log('Error sharing:', err));
    } else {
      // Fallback to Modal (Desktop)
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert("تم نسخ الرابط بنجاح!");
    setShowShareModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-800 font-sans flex flex-col">
      {/* Header - Updated Branding Colors (Navy to Teal Gradient) */}
      <header className="bg-gradient-to-r from-slate-900 to-teal-600 text-white shadow-lg sticky top-0 z-50 flex-none">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                {/* Shield Icon for Safe Meal */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-teal-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            </div>
            <div>
                 <h1 className="text-2xl font-black tracking-wider uppercase font-[Tajawal]">Safe Meal</h1>
                 <p className="text-xs text-teal-100 font-medium">زاد الحاج الآمن</p>
            </div>
          </div>
          
          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors backdrop-blur-sm"
            aria-label="مشاركة التطبيق"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative">
        {activeTab === Tab.FINDER && (
          <div className="container mx-auto">
            <RestaurantFinder onShowOnMap={handleShowOnMap} />
          </div>
        )}
        {activeTab === Tab.ANALYZER && (
          <div className="container mx-auto">
            <MealAnalyzer />
          </div>
        )}
        {activeTab === Tab.MAP && (
           <InteractiveMap selectedRestaurant={selectedRestaurant} />
        )}
      </main>

      {/* Share Modal (Fallback for Desktop) */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center relative animate-fade-in">
            <button 
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4">مشاركة التطبيق</h3>
            <p className="text-gray-600 text-sm mb-6">امسح الكود أو انسخ الرابط لمشاركته مع الحجاج الآخرين</p>
            
            <div className="flex justify-center mb-6">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}&color=0d9488`} 
                alt="QR Code" 
                className="border-4 border-teal-50 rounded-xl"
              />
            </div>

            <button 
              onClick={copyToClipboard}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 space-x-reverse transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>نسخ رابط المشروع</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="max-w-md mx-auto flex justify-around p-2">
          <button
            onClick={() => setActiveTab(Tab.FINDER)}
            className={`flex flex-col items-center p-2 rounded-xl flex-1 transition-colors ${
              activeTab === Tab.FINDER ? 'text-teal-700 bg-teal-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-bold">المطاعم</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.MAP)}
            className={`flex flex-col items-center p-2 rounded-xl flex-1 transition-colors ${
              activeTab === Tab.MAP ? 'text-teal-700 bg-teal-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="text-xs font-bold">الخريطة</span>
          </button>

          <button
            onClick={() => setActiveTab(Tab.ANALYZER)}
            className={`flex flex-col items-center p-2 rounded-xl flex-1 transition-colors ${
              activeTab === Tab.ANALYZER ? 'text-teal-700 bg-teal-50' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span className="text-xs font-bold">فحص الوجبة</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;


import React, { useState, useEffect, useRef } from 'react';
import { AllergyType, RestaurantSearchResult, MealType, Restaurant } from '../types';
import { findSafeRestaurants } from '../services/geminiService';
import { RESTAURANT_LOCATIONS } from '../constants';

interface RestaurantFinderProps {
  onShowOnMap?: (restaurantName: string) => void;
}

const WELCOME_MESSAGES = [
  "أهلاً بك يا ضيف الرحمن، نسأل الله لك حجاً مبروراً وسعياً مشكوراً. ✨",
  "حياك الله في رحاب مكة، نسأل الله أن يتقبل طاعاتكم ويحفظكم. 🤲",
  "يا باغي الخير أقبل، أهلاً بك في بيت الله الحرام، ونسأل الله لك الصحة والعافية. 🕋",
  "تقبل الله منا ومنكم صالح الأعمال، تفضل هذه الخيارات الآمنة والموثوقة لك. ✅",
  "أهلاً بزوار بيت الله، نسأل الله لكم السلامة في حلكم وترحالكم. ❤️",
  "طاب ممشاكم وتبوأتم من الجنة مقعداً، نسأل الله أن يرزقكم القبول والرضا. ✨",
  "يا ضيف بيت الله، عافاك الله وشافاك، ورزقك القوة على تمام النسك. 🙌"
];

const RestaurantCard: React.FC<{ 
  restaurant: Restaurant, 
  onShowOnMap?: (name: string) => void 
}> = ({ restaurant, onShowOnMap }) => {
  
  const handleInternalMapClick = () => {
    if (onShowOnMap) {
      const searchName = restaurant.name.toLowerCase();
      const found = RESTAURANT_LOCATIONS.find(r => 
        searchName.includes(r.name.toLowerCase()) || 
        (r.matchName && searchName.includes(r.matchName.toLowerCase())) ||
        r.name.toLowerCase().includes(searchName)
      );
      onShowOnMap(found ? (found.matchName || found.name) : restaurant.name);
    }
  };

  const getBudgetDisplay = (level: string) => {
    switch (level) {
      case "اقتصادي": return { icon: "💰", color: "bg-green-100 text-green-700 border-green-200" };
      case "متوسط": return { icon: "💰💰", color: "bg-blue-100 text-blue-700 border-blue-200" };
      case "فاخر": return { icon: "💰💰💰", color: "bg-purple-100 text-purple-700 border-purple-200" };
      default: return { icon: "💰", color: "bg-gray-100 text-gray-700 border-gray-200" };
    }
  };

  const budget = getBudgetDisplay(restaurant.budgetLevel);
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + (restaurant.location || '') + ' makkah')}`;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all hover:shadow-xl animate-fade-in flex flex-col h-full border-t-4 border-t-teal-600">
      <div className="bg-teal-50 p-4 border-b border-teal-100">
        <div className="flex items-center justify-between mb-2">
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${budget.color}`}>
              {budget.icon} {restaurant.budgetLevel}
            </div>
            <span className="text-[10px] font-bold text-teal-600 bg-white px-2 py-0.5 rounded-full border border-teal-100">
              {restaurant.location}
            </span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-800">{restaurant.name}</h3>
      </div>

      <div className="p-5 flex-grow flex flex-col">
        <p className="text-sm text-gray-600 mb-5 leading-7 line-clamp-3 min-h-[5.25rem]">
          {restaurant.description}
        </p>
        
        <div className="mb-5">
           <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1.5 rounded-lg border border-teal-100 inline-block">
             {restaurant.safetyLevel}
           </span>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
          <h4 className="text-xs font-bold text-blue-800 mb-2.5 border-b border-blue-100 pb-1.5">الوجبات المقترحة:</h4>
          <ul className="space-y-1.5">
            {restaurant.suggestedMeals.map((meal, idx) => (
              <li key={idx} className="text-sm text-blue-700 flex items-start">
                <span className="ml-2 mt-1 w-1 h-1 bg-blue-400 rounded-full flex-shrink-0"></span>
                <span className="leading-relaxed">{meal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <div className="grid grid-cols-2 gap-2">
            <a 
              href={`https://www.google.com/search?q=${encodeURIComponent(restaurant.name + ' ' + (restaurant.location || '') + ' makkah photos')}&tbm=isch`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-2.5 rounded-lg text-center transition-colors border border-slate-200"
            >
              صور المطعم ↗
            </a>
             <a 
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold py-2.5 rounded-lg text-center transition-colors shadow-sm flex items-center justify-center"
            >
              خرائط جوجل 📍
            </a>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5">
        <button 
          onClick={handleInternalMapClick}
          className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center shadow-md active:scale-[0.98]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          تحديد الموقع في التطبيق
        </button>
      </div>
    </div>
  );
};

const RestaurantFinder: React.FC<RestaurantFinderProps> = ({ onShowOnMap }) => {
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [locationHint, setLocationHint] = useState<string>("");
  const [selectedMealType, setSelectedMealType] = useState<MealType>(MealType.LUNCH);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RestaurantSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentWelcome, setCurrentWelcome] = useState<string>("");

  const allergies = Object.values(AllergyType);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev => prev.includes(allergy) ? prev.filter(item => item !== allergy) : [...prev, allergy]);
  };

  const handleSearch = async () => {
    if (selectedAllergies.length === 0) return;
    
    // اختيار رسالة ترحيبية عشوائية
    const randomIndex = Math.floor(Math.random() * WELCOME_MESSAGES.length);
    setCurrentWelcome(WELCOME_MESSAGES[randomIndex]);
    
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const locationName = locationHint || "مكة المكرمة";
      const data = await findSafeRestaurants(selectedAllergies, locationName, selectedMealType);
      
      if (isMounted.current) {
        setResult(data);
        setLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        setError("حدث خطأ أثناء البحث عن المطاعم. الرجاء المحاولة مرة أخرى.");
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-slate-800 mb-2">ترشيح المطاعم الآمنة</h2>
        <p className="text-gray-500">نساعدك في اختيار أفضل المطاعم التي تراعي حالتك الصحية</p>
      </div>

      {/* منطقة إدخال البيانات */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">متى ترغب في الأكل؟</label>
          <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-200">
            {Object.values(MealType).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  selectedMealType === type ? 'bg-teal-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-3">المنطقة المفضلة</label>
          <select 
            value={locationHint} 
            onChange={(e) => setLocationHint(e.target.value)}
            className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-teal-500 bg-gray-50 text-gray-800 font-bold appearance-none"
          >
            <option value="">مكة المكرمة (الكل)</option>
            <option value="المنطقة المركزية">قرب الحرم المكي</option>
            <option value="حي العزيزية">العزيزية</option>
            <option value="حي الشوقية">الشوقية</option>
            <option value="المشاعر المقدسة">منى ومزدلفة</option>
          </select>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="text-sm font-bold text-slate-700 mb-4 px-1">ما هي الحساسية التي تعاني منها؟</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allergies.map((allergy) => {
            const isSelected = selectedAllergies.includes(allergy);
            return (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`p-4 rounded-2xl text-center transition-all border-2 font-bold text-sm ${
                  isSelected ? 'bg-teal-600 text-white border-teal-600 shadow-xl' : 'bg-white text-gray-700 border-gray-100 hover:border-teal-200'
                }`}
              >
                {allergy}
              </button>
            );
          })}
        </div>
      </div>

      {!loading && (
        <button 
          onClick={handleSearch}
          disabled={selectedAllergies.length === 0}
          className="w-full bg-slate-900 hover:bg-black disabled:bg-gray-300 text-white text-lg font-bold py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center mb-10 group"
        >
          <span>ابدأ البحث عن ترشيحات</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 group-hover:translate-x-[-4px] transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      )}

      {/* عرض الرسالة الترحيبية أثناء التحميل وبعده */}
      {(loading || result) && currentWelcome && (
        <div className="mb-8 animate-fade-in">
          <div className="bg-gradient-to-r from-teal-50 to-blue-50 border-l-4 border-l-teal-500 p-5 rounded-2xl shadow-sm text-teal-800 text-center md:text-right">
             <span className="text-lg font-bold leading-relaxed">{currentWelcome}</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-teal-700 font-bold">جاري البحث عن أفضل الخيارات الآمنة لسلامتكم...</p>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-center border border-red-100 font-bold">{error}</div>}

      {result && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up mb-8">
          {result.restaurants.map((rest, idx) => (
            <RestaurantCard 
              key={idx} 
              restaurant={rest} 
              onShowOnMap={onShowOnMap} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantFinder;

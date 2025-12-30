
import React, { useEffect, useRef, useState } from 'react';
import { RESTAURANT_LOCATIONS } from '../constants';

declare global {
  interface Window {
    L: any;
  }
}

interface InteractiveMapProps {
  selectedRestaurant?: string | null;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ selectedRestaurant }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<typeof RESTAURANT_LOCATIONS>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    if (typeof window.L === 'undefined') {
      console.error("Leaflet not loaded");
      return;
    }

    // Initialize Map centered on Holy Mosque
    const map = window.L.map(mapContainerRef.current).setView([21.4225, 39.8262], 13);
    mapInstanceRef.current = map;

    // Add Tile Layer (OpenStreetMap)
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Icons
    const createIcon = (color: string) => {
      return new window.L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    };

    const goldIcon = createIcon('gold'); // Breakfast
    const greenIcon = createIcon('green'); // Lunch/Dinner

    // Add Markers
    RESTAURANT_LOCATIONS.forEach(rest => {
      const icon = rest.type === "فطور" ? goldIcon : greenIcon;
      
      const marker = window.L.marker([rest.lat, rest.lng], { icon: icon })
        .addTo(map)
        .bindPopup(`
          <div style="text-align: right; font-family: 'Tajawal', sans-serif; min-width: 150px;">
            <strong style="color: #0f766e; font-size: 1.1em;">${rest.name}</strong><br/>
            <span style="color: #6b7280; font-size: 0.9em;">${rest.type}</span><br/>
            <div style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 5px;">
              <a href="https://www.google.com/maps/search/?api=1&query=${rest.lat},${rest.lng}" target="_blank" style="display: block; color: #0d9488; text-decoration: none; font-weight: bold; font-size: 0.8em;">
                اتجاهات خرائط جوجل ↗
              </a>
            </div>
          </div>
        `)
        .bindTooltip(rest.name, {
            permanent: true,
            direction: 'top',
            offset: [0, -38],
            className: 'custom-tooltip text-[10px] font-bold text-teal-900 bg-white/90 border border-teal-500 rounded px-2 py-0.5 shadow-sm whitespace-nowrap'
        });
        
      markersRef.current[rest.name] = marker;
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Effect to handle external selection (e.g. from Finder tab)
  useEffect(() => {
    if (selectedRestaurant && mapInstanceRef.current) {
      const searchName = selectedRestaurant.toLowerCase();
      
      // منطق مطابقة أكثر مرونة
      const found = RESTAURANT_LOCATIONS.find(r => 
        r.name.toLowerCase() === searchName || 
        (r.matchName && r.matchName.toLowerCase() === searchName) ||
        r.name.toLowerCase().includes(searchName) ||
        searchName.includes(r.name.toLowerCase()) ||
        (r.matchName && searchName.includes(r.matchName.toLowerCase()))
      );

      if (found) {
        mapInstanceRef.current.setView([found.lat, found.lng], 16);
        const marker = markersRef.current[found.name];
        if (marker) {
          marker.openPopup();
        }
      } else {
        // إذا لم يجد المطعم، حاول البحث عنه في خرائط جوجل مباشرة كحل بديل
        console.log("Restaurant not found in local DB, use search");
      }
    }
  }, [selectedRestaurant]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (term.trim()) {
          const results = RESTAURANT_LOCATIONS.filter(r => 
              r.name.toLowerCase().includes(term.toLowerCase())
          );
          setSearchResults(results);
      } else {
          setSearchResults([]);
      }
  };

  const handleResultClick = (rest: typeof RESTAURANT_LOCATIONS[0]) => {
      const map = mapInstanceRef.current;
      if (map) {
          map.setView([rest.lat, rest.lng], 16);
          const marker = markersRef.current[rest.name];
          if (marker) {
              marker.openPopup();
          }
      }
      setSearchTerm(rest.name);
      setSearchResults([]);
  };

  return (
    <div className="w-full h-full min-h-[80vh] bg-slate-100 relative">
       {/* Search Bar */}
       <div className="absolute top-4 left-4 z-[400] w-64 md:w-80">
          <div className="relative">
             <input 
                type="text" 
                placeholder="ابحث عن اسم المطعم..." 
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full p-3.5 pl-10 pr-4 rounded-xl shadow-lg border border-gray-200 focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white/95 backdrop-blur-sm"
             />
             <div className="absolute left-3 top-4 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             
             {/* Results Dropdown */}
             {searchResults.length > 0 && (
                 <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto z-[500]">
                     {searchResults.map((rest, idx) => (
                         <button 
                            key={idx}
                            onClick={() => handleResultClick(rest)}
                            className="w-full text-right px-4 py-3 hover:bg-teal-50 border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center"
                         >
                             <span className="font-bold text-gray-800 text-sm">{rest.name}</span>
                             <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{rest.type}</span>
                         </button>
                     ))}
                 </div>
             )}
          </div>
       </div>

       {/* Map Legend */}
       <div className="absolute bottom-24 md:bottom-6 left-4 z-[400] bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-gray-200 min-w-[140px]">
         <h4 className="font-bold text-gray-800 mb-3 text-xs border-b pb-2">دليل الخريطة</h4>
         <div className="flex items-center mb-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2 shadow-sm"></span>
            <span className="text-[11px] font-bold text-gray-600">فطور</span>
         </div>
         <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-600 mr-2 shadow-sm"></span>
            <span className="text-[11px] font-bold text-gray-600">غداء / عشاء</span>
         </div>
       </div>

      <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />
      
      {/* CSS Override for Tooltip */}
      <style>{`
        .leaflet-tooltip {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }
        .leaflet-tooltip-top:before {
            display: none !important;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 16px !important;
            padding: 5px !important;
        }
      `}</style>
    </div>
  );
};

export default InteractiveMap;

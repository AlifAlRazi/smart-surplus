'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface MapStore {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  itemCount: number;
}

interface StoreMapProps {
  stores: MapStore[];
  mapboxToken: string;
}

export function StoreMap({ stores, mapboxToken }: StoreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedStore, setSelectedStore] = useState<MapStore | null>(null);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    mapboxgl.accessToken = mapboxToken;
    
    // Default center (London) if no stores, else average
    let center: [number, number] = [-0.1276, 51.5072];
    if (stores.length > 0) {
       center = [stores[0].lng, stores[0].lat];
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: center,
      zoom: 12
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    const newMarkers: mapboxgl.Marker[] = [];

    stores.forEach((store) => {
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full bg-emerald-600 shadow-lg text-white font-bold flex items-center justify-center cursor-pointer border-2 border-white transition-transform hover:scale-110';
      el.innerHTML = `${store.itemCount}`;
      
      // Add click event
      el.addEventListener('click', () => {
        setSelectedStore(store);
        map.current?.flyTo({
          center: [store.lng, store.lat],
          zoom: 14,
          essential: true
        });
      });

      // Add to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([store.lng, store.lat])
        .addTo(map.current!);
        
      newMarkers.push(marker);
    });

    return () => {
       newMarkers.forEach(m => m.remove());
       if (map.current) {
          map.current.remove();
          map.current = null;
       }
    };
  }, [stores, mapboxToken]);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-[calc(100vh-4rem)] overflow-hidden">
       {/* Map container */}
       <div ref={mapContainer} className="absolute inset-0" />
       
       {/* Overlaid Selected Store Panel */}
       {selectedStore && (
          <div className="absolute bottom-20 md:bottom-8 left-4 right-4 md:left-auto md:right-8 md:w-80 bg-white rounded-xl shadow-xl p-5 border border-slate-200 z-10 animate-in slide-in-from-bottom-5">
             <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">
                  {selectedStore.category}
                </span>
                <button 
                  onClick={() => setSelectedStore(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  ✕
                </button>
             </div>
             <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedStore.name}</h3>
             <p className="text-sm text-slate-500 mt-2">
               {selectedStore.itemCount} surplus items available right now!
             </p>
             <Button className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700" asChild>
                <Link href={`/dashboard/customer?search=${encodeURIComponent(selectedStore.name)}`}>
                  View Store Listings
                </Link>
             </Button>
          </div>
       )}
    </div>
  );
}

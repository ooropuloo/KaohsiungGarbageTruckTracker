
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Truck, Position as AppPosition } from '../types';
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, USER_LOCATED_ZOOM } from '../constants';
import RecenterMapControl from './RecenterMapControl'; // Import the custom control

interface MapDisplayProps {
  trucks: Truck[];
  userPosition: AppPosition | null;
  selectedTruckId: string | null;
  searchRange: number; // in meters
  onMapReady: (map: L.Map) => void;
  onTruckSelectFromMap: (truckId: string) => void;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ 
  trucks, userPosition, selectedTruckId, searchRange, onMapReady, onTruckSelectFromMap 
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const rangeCircleRef = useRef<L.Circle | null>(null);
  const truckMarkersRef = useRef<Map<string, L.Marker>>(new Map());

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        userPosition ? [userPosition.lat, userPosition.lng] : [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng],
        userPosition ? USER_LOCATED_ZOOM : DEFAULT_MAP_ZOOM
      );
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      mapRef.current = map;
      onMapReady(map);

      const timerId = setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);

      return () => {
        clearTimeout(timerId);
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Runs once on mount

  // Update user marker and search range circle
  useEffect(() => {
    if (!mapRef.current || !userPosition) return;

    const userLatLng: L.LatLngExpression = [userPosition.lat, userPosition.lng];
    
    const userIconHtml = `<div class="w-7 h-7 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center shadow-lg">
                            <i class="fas fa-street-view text-white text-sm"></i>
                          </div>`;
    const userIcon = L.divIcon({ html: userIconHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLatLng);
    } else {
      userMarkerRef.current = L.marker(userLatLng, { icon: userIcon }).addTo(mapRef.current)
        .bindPopup('Your Location');
    }

    if (rangeCircleRef.current) {
      rangeCircleRef.current.setLatLng(userLatLng);
      rangeCircleRef.current.setRadius(searchRange);
    } else {
      rangeCircleRef.current = L.circle(userLatLng, {
        radius: searchRange,
        color: '#4CAF50',
        fillColor: '#4CAF50',
        fillOpacity: 0.1,
        weight: 2,
      }).addTo(mapRef.current);
    }
  }, [userPosition, searchRange]);

  // Update truck markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const currentOnlineTruckIds = new Set(trucks.filter(t => t.status !== 'Offline').map(t => t.id));

    // Remove markers for trucks no longer in the list or now offline
    truckMarkersRef.current.forEach((marker, truckId) => {
      if (!currentOnlineTruckIds.has(truckId)) {
        map.removeLayer(marker);
        truckMarkersRef.current.delete(truckId);
      }
    });

    trucks.forEach(truck => {
      // Do not render or update markers for offline trucks
      if (truck.status === 'Offline') {
        if (truckMarkersRef.current.has(truck.id)) { // Ensure it's removed if it was previously online
            map.removeLayer(truckMarkersRef.current.get(truck.id)!);
            truckMarkersRef.current.delete(truck.id);
        }
        return;
      }

      const truckLatLng: L.LatLngExpression = [truck.position.lat, truck.position.lng];
      const isSelected = truck.id === selectedTruckId;
      const isWatchedAndNotSelected = truck.isWatched && !isSelected;
      
      let borderColor = 'border-green-500'; // Default for online, not watched, not selected
      if (isSelected) borderColor = 'border-orange-500';
      else if (isWatchedAndNotSelected) borderColor = 'border-yellow-400';


      const truckIconHtml = `
        <div class="w-8 h-8 bg-neutral-800 border-2 ${borderColor} rounded-full flex items-center justify-center shadow-md transform transition-transform ${isSelected ? 'scale-125' : ''}">
          <i class="fas fa-truck text-white text-sm"></i>
        </div>`;
      const truckIcon = L.divIcon({ html: truckIconHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 16] });

      const popupContent = `
        <div class="text-sm">
          <strong class="text-base text-gray-100 flex items-center gap-1.5"><i class="fas fa-truck ${truck.isWatched ? 'text-yellow-400' : 'text-green-400'}"></i> ${truck.plateNumber}</strong><br>
          <span class="text-gray-300">${truck.location}</span><br>
          <span class="text-gray-400">Status: ${truck.status}</span><br>
          ${truck.distance !== undefined && truck.distance !== Infinity ? `<span class="text-gray-400">Distance: ${truck.distance < 1000 ? `${truck.distance.toFixed(0)}m` : `${(truck.distance / 1000).toFixed(1)}km`}</span>` : ''}
        </div>
      `;

      if (truckMarkersRef.current.has(truck.id)) {
        const marker = truckMarkersRef.current.get(truck.id)!;
        marker.setLatLng(truckLatLng);
        marker.setIcon(truckIcon);
        marker.setPopupContent(popupContent);
      } else {
        const newMarker = L.marker(truckLatLng, { icon: truckIcon })
          .addTo(map)
          .bindPopup(popupContent);
        newMarker.on('click', () => {
          onTruckSelectFromMap(truck.id);
        });
        truckMarkersRef.current.set(truck.id, newMarker);
      }
    });
  }, [trucks, selectedTruckId, onTruckSelectFromMap]);


  return (
    <div className="relative flex flex-col flex-1 w-full min-h-[300px] rounded-lg overflow-hidden shadow-2xl">
      <div 
        ref={mapContainerRef} 
        className="w-full flex-1" 
      />
      {mapRef.current && userPosition && <RecenterMapControl map={mapRef.current} userPosition={[userPosition.lat, userPosition.lng]} zoomLevel={USER_LOCATED_ZOOM} />}
      {!userPosition && (
         <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-sm">
            <div className="w-12 h-12 mb-4 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
            <p>Initializing map & waiting for GPS...</p>
         </div>
      )}
    </div>
  );
};

export default MapDisplay;
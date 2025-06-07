
import React, { useState, useEffect, useCallback, useRef } from 'react';
import L from 'leaflet';
import toast from 'react-hot-toast';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MapDisplay from './components/MapDisplay';
import GeminiModal from './components/GeminiModal';

import { Truck, Position, ApiStatus, GpsStatus, RawTruckData } from './types';
import { 
  DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM, USER_LOCATED_ZOOM, 
  TRUCK_SELECTED_ZOOM, ALERT_DISTANCE_OPTIONS, SEARCH_RANGE_OPTIONS, UPDATE_INTERVAL_OPTIONS 
} from './constants';
import { 
  getCurrentPosition as fetchCurrentPosition, 
  watchPosition as watchGeoPosition 
} from './services/geolocationService';
import { 
  fetchTruckData as fetchRawTrucks, 
  processTruckData, 
  haversineDistance 
} from './services/truckService';
import useLocalStorage from './hooks/useLocalStorage';

const App: React.FC = () => {
  const [userPosition, setUserPosition] = useState<Position | null>(null);
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>(GpsStatus.WAITING);
  
  const [allApiTrucks, setAllApiTrucks] = useState<Map<string, Truck>>(new Map()); // Trucks from API
  const [filteredTrucks, setFilteredTrucks] = useState<Truck[]>([]); // Trucks for display (sidebar/map)
  
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [apiStatus, setApiStatus] = useState<ApiStatus>(ApiStatus.IDLE);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  
  const [updateInterval, setUpdateInterval] = useLocalStorage<number>('updateInterval', UPDATE_INTERVAL_OPTIONS[2] * 1000);
  const [searchRange, setSearchRange] = useLocalStorage<number>('searchRange', SEARCH_RANGE_OPTIONS[2].value);
  const [alertDistance, setAlertDistance] = useLocalStorage<number>('alertDistance', ALERT_DISTANCE_OPTIONS[4]);
  const [watchedTrucks, setWatchedTrucks] = useLocalStorage<Set<string>>('watchedTrucks', new Set<string>());
  const [isMuted, setIsMuted] = useLocalStorage<boolean>('isMuted', false);
  
  const [alertedTrucksThisSession, setAlertedTrucksThisSession] = useState<Set<string>>(new Set());
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);

  useEffect(() => {
    const handleGeoSuccess = (position: Position) => {
      setUserPosition(position);
      setGpsStatus(GpsStatus.ACTIVE);
      if (mapInstanceRef.current && !mapInstanceRef.current.getBounds().contains(L.latLng(position.lat, position.lng))) {
         mapInstanceRef.current.setView([position.lat, position.lng], USER_LOCATED_ZOOM);
      }
    };
    const handleGeoError = () => {
      if (!userPosition) {
        setUserPosition(DEFAULT_MAP_CENTER);
        setGpsStatus(GpsStatus.FALLBACK);
        toast.error("GPS Error. Using default location.", {id: 'gps-error'});
      } else {
        setGpsStatus(GpsStatus.ERROR);
        toast.error("GPS signal lost or error.", {id: 'gps-error-lost'});
      }
    };

    fetchCurrentPosition(handleGeoSuccess, handleGeoError);
    const watchId = watchGeoPosition(handleGeoSuccess, handleGeoError);
    
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTrucks = useCallback(async () => {
    if (apiStatus === ApiStatus.LOADING) return;
    setApiStatus(ApiStatus.LOADING);
    try {
      const rawData: RawTruckData[] = await fetchRawTrucks();
      // Pass empty set for watchedTrucks here, as isWatched will be determined later based on the live watchedTrucks state
      const processed = processTruckData(rawData, new Set<string>()); 
      
      const newTrucksMap = new Map<string, Truck>();
      processed.forEach(truck => newTrucksMap.set(truck.id, truck));
      
      setAllApiTrucks(newTrucksMap); // Store only API-sourced trucks here
      setApiStatus(ApiStatus.SUCCESS);
      setAlertedTrucksThisSession(new Set());
    } catch (error) {
      console.error("Failed to fetch truck data:", error);
      setApiStatus(ApiStatus.ERROR);
      if (!isMuted) toast.error("Failed to update truck data.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMuted]); // apiStatus removed

  useEffect(() => {
    if(gpsStatus === GpsStatus.WAITING) return;
    fetchTrucks();
    const intervalId = setInterval(fetchTrucks, updateInterval);
    return () => clearInterval(intervalId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchTrucks, updateInterval, gpsStatus]);

  useEffect(() => {
    if (!userPosition && gpsStatus !== GpsStatus.FALLBACK) {
        setFilteredTrucks([]);
        return;
    }
    
    const currentPositionToUse = userPosition || DEFAULT_MAP_CENTER;
    const processedAndCombined: Truck[] = [];

    // Process trucks from the current API data
    allApiTrucks.forEach(apiTruck => {
        const distance = haversineDistance(currentPositionToUse, apiTruck.position);
        const isWatched = watchedTrucks.has(apiTruck.id);
        const updatedTruck = { ...apiTruck, distance, isWatched };
        // Include if watched OR if within search range
        if (isWatched || (updatedTruck.distance !== undefined && updatedTruck.distance <= searchRange)) {
            processedAndCombined.push(updatedTruck);
        }
    });

    // Add watched trucks not found in the current API response (mark as offline)
    watchedTrucks.forEach(watchedId => {
        const isAlreadyIncluded = processedAndCombined.some(t => t.id === watchedId);
        if (!isAlreadyIncluded) {
            processedAndCombined.push({
                id: watchedId,
                plateNumber: watchedId,
                position: DEFAULT_MAP_CENTER, // Placeholder, won't be mapped
                location: 'Details unavailable',
                lastUpdate: new Date(0).toISOString(), // Epoch
                status: 'Offline',
                isWatched: true,
                distance: Infinity, // Ensure sorts after online trucks unless specifically watched
            });
        }
    });
    
    // Alerting logic - only for online, active trucks
    if (!isMuted && gpsStatus === GpsStatus.ACTIVE) {
      processedAndCombined.forEach(truck => {
        if (truck.status !== 'Offline' && truck.distance !== undefined && truck.distance !== Infinity && truck.distance <= alertDistance && !alertedTrucksThisSession.has(truck.id)) {
          toast.success(`Truck ${truck.plateNumber} is ${truck.distance.toFixed(0)}m away!`, {
            icon: '🚚',
            duration: 7000,
          });
          if(navigator.vibrate) navigator.vibrate(200);
          setAlertedTrucksThisSession(prev => new Set(prev).add(truck.id));
        }
      });
    }
    
    setFilteredTrucks(processedAndCombined);
  }, [allApiTrucks, userPosition, searchRange, watchedTrucks, alertDistance, isMuted, alertedTrucksThisSession, gpsStatus]);

  const handleSelectTruck = useCallback((truckId: string) => {
    const truck = filteredTrucks.find(t => t.id === truckId); // Check from filteredTrucks
    if (truck && truck.status === 'Offline') {
        toast.error(`Truck ${truckId} is offline and cannot be selected on map.`, {id: `offline-select-${truckId}`});
        setSelectedTruckId(truckId); // Still select in sidebar
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
        return;
    }

    setSelectedTruckId(truckId);
    if (truck && mapInstanceRef.current) {
      mapInstanceRef.current.setView([truck.position.lat, truck.position.lng], TRUCK_SELECTED_ZOOM);
      mapInstanceRef.current.eachLayer(layer => {
        if (layer instanceof L.Marker) {
          const boundPopup = layer.getPopup();
          if (boundPopup && boundPopup.getContent()?.toString().includes(truckId)) {
            layer.openPopup();
          }
        }
      });
    }
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, [filteredTrucks]);

  const handleToggleWatch = useCallback((truckId: string) => {
    const newWatched = new Set(watchedTrucks);
    let message = '';
    if (newWatched.has(truckId)) {
      newWatched.delete(truckId);
      message = `Truck ${truckId} removed from watch list.`;
    } else {
      newWatched.add(truckId);
      message = `Truck ${truckId} added to watch list!`;
    }
    setWatchedTrucks(newWatched);
    if(!isMuted) toast.success(message, { icon: newWatched.has(truckId) ? '🌟' : '✖️' });
  }, [watchedTrucks, setWatchedTrucks, isMuted]);

  const handleAddManualWatch = useCallback((truckId: string) => {
    if (watchedTrucks.has(truckId)) {
      if(!isMuted) toast.error(`Truck ${truckId} is already on your watch list.`);
      return;
    }
    const newWatched = new Set(watchedTrucks);
    newWatched.add(truckId);
    setWatchedTrucks(newWatched);
    if(!isMuted) toast.success(`Truck ${truckId} manually added to watch list!`, { icon: '🌟' });
  }, [watchedTrucks, setWatchedTrucks, isMuted]);

  const handleMapReady = useCallback((map: L.Map) => {
    mapInstanceRef.current = map;
  }, []);
  
  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    if(!isMuted) toast.success("Notifications unmuted.", {icon: '🔊'});
    else toast.error("Notifications muted.", {icon: '🔇'});
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(prevIsSidebarOpen => !prevIsSidebarOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-neutral-900">
      <Header
        updateInterval={updateInterval}
        onUpdateIntervalChange={setUpdateInterval}
        searchRange={searchRange}
        onSearchRangeChange={setSearchRange}
        alertDistance={alertDistance}
        onAlertDistanceChange={setAlertDistance}
        apiStatus={apiStatus}
        gpsStatus={gpsStatus}
        onToggleSidebar={handleToggleSidebar}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
      />
      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          trucks={filteredTrucks}
          selectedTruckId={selectedTruckId}
          onSelectTruck={handleSelectTruck}
          onToggleWatch={handleToggleWatch}
          onAddWatchedTruck={handleAddManualWatch}
          searchRange={searchRange}
          isSidebarOpen={isSidebarOpen}
          gpsActive={gpsStatus === GpsStatus.ACTIVE || gpsStatus === GpsStatus.FALLBACK}
        />
        {isSidebarOpen && window.innerWidth < 1024 && ( // Only show backdrop on smaller screens when sidebar is open
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 z-[990] bg-black/30 backdrop-blur-sm lg:hidden"
            aria-label="Close sidebar"
            role="button"
          ></div>
        )}
        <MapDisplay
          trucks={filteredTrucks} // Pass all filtered trucks, MapDisplay will handle not showing offline ones
          userPosition={userPosition}
          selectedTruckId={selectedTruckId}
          searchRange={searchRange}
          onMapReady={handleMapReady}
          onTruckSelectFromMap={handleSelectTruck}
        />
      </main>
      <GeminiModal 
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        trucks={filteredTrucks.filter(t => t.status !== 'Offline')} // Pass only online trucks to Gemini
      />
    </div>
  );
};

export default App;
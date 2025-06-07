import React, { useState } from 'react';
import { Truck } from '../types';
import TruckItem from './TruckItem';
import { LocationArrowIcon, SearchIcon, PlusIcon, MapMarkerAltIcon } from './icons';

interface SidebarProps {
  trucks: Truck[];
  selectedTruckId: string | null;
  onSelectTruck: (truckId: string) => void;
  onToggleWatch: (truckId: string) => void;
  onAddWatchedTruck: (truckId: string) => void;
  searchRange: number;
  isSidebarOpen: boolean;
  gpsActive: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
  trucks, selectedTruckId, onSelectTruck, onToggleWatch, onAddWatchedTruck, searchRange, isSidebarOpen, gpsActive
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualWatchTerm, setManualWatchTerm] = useState('');

  // console.log('[Sidebar.tsx] Rendering. isSidebarOpen prop:', isSidebarOpen);

  const handleAddWatchedTruck = () => {
    if (manualWatchTerm.trim()) {
      onAddWatchedTruck(manualWatchTerm.trim().toUpperCase());
      setManualWatchTerm('');
    }
  };
  
  const filteredAndSortedTrucks = trucks
    .filter(truck => 
      truck.plateNumber.toUpperCase().includes(searchTerm.toUpperCase()) || 
      truck.location.toUpperCase().includes(searchTerm.toUpperCase()) ||
      (truck.status === 'Offline' && truck.plateNumber.toUpperCase().includes(searchTerm.toUpperCase())) // Allow searching offline trucks by plate
    )
    .sort((a, b) => {
      if (a.isWatched && !b.isWatched) return -1;
      if (!a.isWatched && b.isWatched) return 1;
      // Sort online trucks before offline ones if both are watched or both are not watched
      if (a.status !== 'Offline' && b.status === 'Offline') return -1;
      if (a.status === 'Offline' && b.status !== 'Offline') return 1;
      return (a.distance ?? Infinity) - (b.distance ?? Infinity);
    });

  const rangeText = searchRange >= 1000 ? `${searchRange / 1000}km` : `${searchRange}m`;

  return (
    <aside className={`fixed top-0 left-0 z-[1000] w-4/5 max-w-xs sm:w-80 md:w-96 h-full pt-16 transition-transform duration-300 ease-in-out transform bg-neutral-800/90 backdrop-blur-sm shadow-xl
                      lg:sticky lg:pt-0 lg:translate-x-0 lg:h-[calc(100vh-4rem)] lg:top-16 lg:rounded-tr-lg lg:rounded-br-lg
                      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex flex-col h-full">
        <div className="p-4 text-center text-white bg-gradient-to-br from-green-600 to-green-500 lg:rounded-tr-lg">
          <h2 className="flex items-center justify-center gap-2 text-lg font-semibold">
            <LocationArrowIcon /> Nearby & Watched
          </h2>
          <div className="mt-1 text-4xl font-bold">{filteredAndSortedTrucks.filter(t => t.status !== 'Offline').length}</div>
          <div className="text-sm">active trucks found</div>
          <div className="mt-1 text-xs opacity-80">Search Range: {rangeText}</div>
        </div>

        <div className="p-3 border-b border-neutral-700">
          <div className="relative">
            <input
              type="text"
              placeholder="Search plate or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-3 text-white rounded-md bg-neutral-700 focus:bg-neutral-600 focus:ring-1 focus:ring-orange-500 focus:outline-none"
            />
            <SearchIcon className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
          </div>
        </div>
        
        <div className="flex gap-2 p-3 border-b border-neutral-700">
          <input
            type="text"
            placeholder="Add plate to watch..."
            value={manualWatchTerm}
            onChange={(e) => setManualWatchTerm(e.target.value)}
            className="flex-grow py-2 px-3 text-white rounded-md bg-neutral-700 focus:bg-neutral-600 focus:ring-1 focus:ring-orange-500 focus:outline-none"
          />
          <button
            onClick={handleAddWatchedTruck}
            className="px-4 py-2 font-semibold text-black bg-yellow-400 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            aria-label="Add to watch list"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="flex-grow p-3 overflow-y-auto">
          {gpsActive && filteredAndSortedTrucks.length === 0 && (
            <div className="mt-10 text-center text-gray-400">
              <MapMarkerAltIcon className="mb-2 text-5xl opacity-50" />
              <p>No trucks found in the current range or matching your search.</p>
              <p className="mt-1 text-sm">Watched offline trucks will still appear if any.</p>
            </div>
          )}
          {!gpsActive && (
             <div className="mt-10 text-center text-gray-400">
                <MapMarkerAltIcon className="mb-2 text-5xl opacity-50" />
                <p>Waiting for GPS signal to display nearby trucks...</p>
             </div>
          )}
          {filteredAndSortedTrucks.map(truck => (
            <TruckItem
              key={truck.id}
              truck={truck}
              isSelected={truck.id === selectedTruckId}
              onSelect={onSelectTruck}
              onToggleWatch={onToggleWatch}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
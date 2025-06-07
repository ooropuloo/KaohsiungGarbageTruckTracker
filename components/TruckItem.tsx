import React from 'react';
import { Truck } from '../types';
import { MapMarkerAltIcon, RulerIcon, ClockIcon, StarIcon, RegularStarIcon, TruckIcon as VehicleIcon } from './icons';

interface TruckItemProps {
  truck: Truck;
  onSelect: (truckId: string) => void;
  onToggleWatch: (truckId: string) => void;
  isSelected: boolean;
}

const TruckItem: React.FC<TruckItemProps> = ({ truck, onSelect, onToggleWatch, isSelected }) => {
  const isOffline = truck.status === 'Offline';

  const timeSinceLastUpdate = () => {
    if (isOffline) return 'Unknown';
    const diffMs = Date.now() - new Date(truck.lastUpdate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours} hr ago`;
  };

  let borderColorClass = 'border-green-500'; // Default for online, not watched, not selected
  let vehicleIconColorClass = 'text-green-400';

  if (isSelected) {
    borderColorClass = 'border-orange-500';
    vehicleIconColorClass = 'text-orange-400';
  } else if (isOffline) {
    borderColorClass = 'border-gray-500'; 
    vehicleIconColorClass = 'text-gray-500';
  } else if (truck.isWatched) {
    borderColorClass = 'border-yellow-400';
    vehicleIconColorClass = 'text-yellow-400';
  }
  
  const handleItemClick = () => {
    if (!isOffline) { // Only allow selection if truck is not offline
      onSelect(truck.id);
    }
  };

  return (
    <div
      className={`p-4 mb-2.5 rounded-lg transition-all duration-200 ease-in-out transform border-l-4
                  ${isSelected ? 'bg-orange-600/20' : 'bg-neutral-800'}
                  ${!isOffline ? 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5 hover:bg-neutral-700/70' : 'opacity-75 cursor-default'}
                  ${borderColorClass}`}
      onClick={handleItemClick}
      role="button"
      tabIndex={isOffline ? -1 : 0}
      onKeyPress={(e) => !isOffline && e.key === 'Enter' && handleItemClick()}
      aria-disabled={isOffline}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
           <VehicleIcon className={`text-xl ${vehicleIconColorClass}`} />
           <span className="font-bold text-md text-gray-100">{truck.plateNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent item selection when toggling watch
              onToggleWatch(truck.id);
            }}
            className={`p-1.5 rounded-full text-lg ${truck.isWatched ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-400'}`}
            title={truck.isWatched ? "Remove from watch list" : "Add to watch list"}
          >
            {truck.isWatched ? <StarIcon /> : <RegularStarIcon />}
          </button>
          <span className={`px-2 py-0.5 text-xs text-white ${isOffline ? 'bg-gray-600' : 'bg-green-600'} rounded-full`}>{truck.status}</span>
        </div>
      </div>
      <div className="text-sm text-gray-300 space-y-1.5">
        {isOffline ? (
          <div className="flex items-center">
            <MapMarkerAltIcon className="w-4 mr-2 text-gray-500" />
            <span>Currently offline or not in service.</span>
          </div>
        ) : (
          <>
            <div className="flex items-center">
              <MapMarkerAltIcon className="w-4 mr-2 text-green-400" />
              <span>{truck.location}</span>
            </div>
            {truck.distance !== undefined && truck.distance !== Infinity && (
              <div className="flex items-center">
                <RulerIcon className="w-4 mr-2 text-green-400" />
                <span>Distance: </span>
                <span className="px-1.5 py-0.5 ml-1 text-xs font-semibold text-white bg-orange-500 rounded-md">
                  {truck.distance < 1000 ? `${truck.distance.toFixed(0)}m` : `${(truck.distance / 1000).toFixed(1)}km`}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <ClockIcon className="w-4 mr-2 text-green-400" />
              <span>{timeSinceLastUpdate()}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TruckItem;

import React from 'react';
import { ApiStatus, GpsStatus } from '../types';
import { UPDATE_INTERVAL_OPTIONS, SEARCH_RANGE_OPTIONS, ALERT_DISTANCE_OPTIONS } from '../constants';
import { TruckIcon, ClockIcon, CrosshairsIcon, BellIcon, CircleIcon, BarsIcon, MuteIcon, UnmuteIcon, SparklesIcon } from './icons';
import { getGpsStatusMessage, getGpsStatusColor } from '../services/geolocationService';

interface HeaderProps {
  updateInterval: number;
  onUpdateIntervalChange: (interval: number) => void;
  searchRange: number;
  onSearchRangeChange: (range: number) => void;
  alertDistance: number;
  onAlertDistanceChange: (distance: number) => void;
  apiStatus: ApiStatus;
  gpsStatus: GpsStatus;
  onToggleSidebar: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenGeminiModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  updateInterval, onUpdateIntervalChange,
  searchRange, onSearchRangeChange,
  alertDistance, onAlertDistanceChange,
  apiStatus, gpsStatus,
  onToggleSidebar,
  isMuted, onToggleMute,
  onOpenGeminiModal
}) => {
  const getApiStatusText = () => {
    switch (apiStatus) {
      case ApiStatus.LOADING: return 'Updating...';
      case ApiStatus.SUCCESS: return 'Connected';
      case ApiStatus.ERROR: return 'Connection Error';
      case ApiStatus.IDLE: return 'Idle';
      default: return 'Status Unknown';
    }
  };

  const getApiStatusColor = () => {
    switch (apiStatus) {
      case ApiStatus.LOADING: return 'bg-blue-500 text-white animate-pulse';
      case ApiStatus.SUCCESS: return 'bg-green-500 text-white';
      case ApiStatus.ERROR: return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 bg-neutral-800/80 backdrop-blur-md shadow-lg">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-xl text-white rounded-full lg:hidden hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label="Toggle sidebar"
        >
          <BarsIcon />
        </button>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-white sm:text-xl">
          <TruckIcon className="text-orange-400" />
          <span>Kaohsiung Trucks</span>
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm grow">
        <div className="flex items-center gap-1 p-2 text-white rounded-md bg-neutral-700">
          <ClockIcon className="text-orange-400" />
          <select
            value={updateInterval / 1000}
            onChange={(e) => onUpdateIntervalChange(Number(e.target.value) * 1000)}
            className="w-16 p-1 text-center text-white border rounded-md bg-neutral-600 border-neutral-500 focus:ring-orange-500 focus:border-orange-500"
          >
            {UPDATE_INTERVAL_OPTIONS.map(val => <option key={val} value={val}>{val}s</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1 p-2 text-white rounded-md bg-neutral-700">
          <CrosshairsIcon className="text-orange-400" />
          <select
            value={searchRange}
            onChange={(e) => onSearchRangeChange(Number(e.target.value))}
            className="w-20 p-1 text-center text-white border rounded-md bg-neutral-600 border-neutral-500 focus:ring-orange-500 focus:border-orange-500"
          >
            {SEARCH_RANGE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1 p-2 text-white rounded-md bg-neutral-700">
          <BellIcon className="text-orange-400" />
          <select
            value={alertDistance}
            onChange={(e) => onAlertDistanceChange(Number(e.target.value))}
            className="w-20 p-1 text-center text-white border rounded-md bg-neutral-600 border-neutral-500 focus:ring-orange-500 focus:border-orange-500"
          >
             {ALERT_DISTANCE_OPTIONS.map(val => <option key={val} value={val}>{val >= 1000 ? `${val/1000}km` : `${val}m`}</option>)}
          </select>
        </div>
        
        <button
          onClick={onToggleMute}
          className={`p-2 rounded-md ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 ${isMuted ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
          title={isMuted ? "Unmute Notifications" : "Mute Notifications"}
        >
          {isMuted ? <MuteIcon /> : <UnmuteIcon />}
        </button>

        <button
          onClick={onOpenGeminiModal}
          className="p-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-purple-500"
          title="Ask Gemini AI"
        >
          <SparklesIcon />
        </button>

        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${getGpsStatusColor(gpsStatus)}`}>
          <CircleIcon className={`${gpsStatus === GpsStatus.WAITING || gpsStatus === GpsStatus.ACTIVE && apiStatus === ApiStatus.LOADING ? 'animate-pulse' : ''}`} />
          <span>{getGpsStatusMessage(gpsStatus)}</span>
        </div>
        <div className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium ${getApiStatusColor()}`}>
          <CircleIcon className={`${apiStatus === ApiStatus.LOADING ? 'animate-pulse' : ''}`} />
          <span>{getApiStatusText()}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
    

import { API_URL } from '../constants';
import { RawTruckData, Truck, Position } from '../types';

export const fetchTruckData = async (): Promise<RawTruckData[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  let data = await response.json();
  
  // Handle various possible API response structures
  if (Array.isArray(data)) {
    return data as RawTruckData[];
  }
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data as RawTruckData[];
    if (Array.isArray(data.result)) return data.result as RawTruckData[];
    if (Array.isArray(data.records)) return data.records as RawTruckData[];
    if (Array.isArray(data.items)) return data.items as RawTruckData[];
    const arrayValues = Object.values(data).find(value => Array.isArray(value));
    if (arrayValues) return arrayValues as RawTruckData[];
  }
  
  console.warn('Unexpected API response structure:', data);
  return []; // Return empty array if data structure is not recognized
};

export const processTruckData = (rawData: RawTruckData[], watchedTrucks: Set<string>): Truck[] => {
  return rawData
    .map((item) => {
      const plateNumber = (item.car || item.plateNumber || item.id || '').toUpperCase();
      const lng = parseFloat(item.x || item.lng || item.longitude || item.lon);
      const lat = parseFloat(item.y || item.lat || item.latitude);

      if (!plateNumber || isNaN(lat) || isNaN(lng)) {
        return null;
      }

      return {
        id: plateNumber,
        plateNumber,
        position: { lat, lng },
        location: item.location || item.address || 'Unknown Location',
        lastUpdate: item.time || item.updateTime || new Date().toISOString(),
        status: item.status || 'In Service',
        isWatched: watchedTrucks.has(plateNumber),
      };
    })
    .filter((truck): truck is Truck => truck !== null);
};

export const haversineDistance = (pos1: Position, pos2: Position): number => {
  const R = 6371e3; // Earth radius in meters
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(pos2.lat - pos1.lat);
  const dLon = toRad(pos2.lng - pos1.lng);
  const lat1Rad = toRad(pos1.lat);
  const lat2Rad = toRad(pos2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};
    
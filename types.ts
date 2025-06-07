
export interface Position {
  lat: number;
  lng: number;
}

export interface RawTruckData {
  car: string;
  x: string; // longitude
  y: string; // latitude
  location?: string;
  time?: string;
  status?: string;
  // Allow other potential fields from API
  [key: string]: any; 
}

export interface Truck {
  id: string; // Plate number
  plateNumber: string;
  position: Position;
  location: string;
  lastUpdate: string; // ISO string
  status: string;
  distance?: number; // in meters
  isWatched: boolean;
}

export enum ApiStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export enum GpsStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  ERROR = 'error',
  FALLBACK = 'fallback',
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  [key: string]: any;
}

    
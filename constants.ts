
import { Position } from './types';

export const API_URL = 'https://api.kcg.gov.tw/api/service/Get/aaf4ce4b-4ca8-43de-bfaf-6dc97e89cac0';
export const DEFAULT_MAP_CENTER: Position = { lat: 22.6273, lng: 120.3014 };
export const DEFAULT_MAP_ZOOM = 12;
export const USER_LOCATED_ZOOM = 15;
export const TRUCK_SELECTED_ZOOM = 16;

export const UPDATE_INTERVAL_OPTIONS = [5, 15, 30, 60, 120, 300]; // seconds
export const SEARCH_RANGE_OPTIONS = [
  { value: 100, label: '100m' },
  { value: 200, label: '200m' },
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
];
export const ALERT_DISTANCE_OPTIONS = [50, 100, 200, 300, 500, 1000]; // meters

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
    
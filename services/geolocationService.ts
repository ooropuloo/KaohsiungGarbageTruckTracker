
import { Position, GpsStatus } from '../types';

export const getCurrentPosition = (
  onSuccess: (position: Position) => void,
  onError: (error?: GeolocationPositionError) => void
): void => {
  if (!navigator.geolocation) {
    onError();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (geoPosition) => {
      onSuccess({
        lat: geoPosition.coords.latitude,
        lng: geoPosition.coords.longitude,
      });
    },
    (err) => {
      onError(err);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
};

export const watchPosition = (
  onSuccess: (position: Position) => void,
  onError: (error?: GeolocationPositionError) => void
): number | null => {
  if (!navigator.geolocation) {
    onError();
    return null;
  }
  return navigator.geolocation.watchPosition(
    (geoPosition) => {
      onSuccess({
        lat: geoPosition.coords.latitude,
        lng: geoPosition.coords.longitude,
      });
    },
    (err) => {
      onError(err);
    },
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 10000 }
  );
};

export const getGpsStatusMessage = (status: GpsStatus): string => {
  switch (status) {
    case GpsStatus.ACTIVE:
      return 'GPS Active';
    case GpsStatus.ERROR:
      return 'GPS Error';
    case GpsStatus.FALLBACK:
      return 'Using Default Location';
    case GpsStatus.WAITING:
    default:
      return 'Waiting for GPS...';
  }
};

export const getGpsStatusColor = (status: GpsStatus): string => {
  switch (status) {
    case GpsStatus.ACTIVE:
      return 'bg-green-500 text-white';
    case GpsStatus.ERROR:
      return 'bg-red-500 text-white';
    case GpsStatus.FALLBACK:
      return 'bg-yellow-500 text-black';
    case GpsStatus.WAITING:
    default:
      return 'bg-blue-500 text-white animate-pulse';
  }
};
    
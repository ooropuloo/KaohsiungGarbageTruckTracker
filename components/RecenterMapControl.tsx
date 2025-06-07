import React, { useEffect } from 'react';
import L from 'leaflet';
// Removed: import { useMap } from 'react-leaflet';
// MyLocationIcon from './icons' is imported but the component uses FontAwesome class in innerHTML, which is fine.

interface RecenterMapControlProps {
  map: L.Map; // Changed from map? to map, as MapDisplay ensures it's passed when this component is rendered.
  userPosition: L.LatLngExpression | null;
  zoomLevel: number;
}

const RecenterMapControl: React.FC<RecenterMapControlProps> = ({ map: mapInstance, userPosition, zoomLevel }) => {
  // The 'mapInstance' prop is the L.Map instance passed from MapDisplay.
  // We no longer attempt to call useMap() here.

  useEffect(() => {
    // The check for mapInstance is mostly a safeguard; 
    // MapDisplay should ensure mapInstance is valid when rendering this component.
    if (!mapInstance) return;

    const control = new L.Control({ position: 'topleft' });

    control.onAdd = () => {
      const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom p-2 bg-white rounded shadow hover:bg-gray-100');
      // Using FontAwesome class directly via innerHTML for simplicity in Leaflet controls.
      button.innerHTML = `<i class="fas fa-street-view text-lg text-neutral-700"></i>`; 
      button.setAttribute('title', 'Recenter to my location');
      
      L.DomEvent.disableClickPropagation(button);
      L.DomEvent.on(button, 'click', () => {
        if (userPosition) {
          mapInstance.setView(userPosition, zoomLevel);
        }
      });
      return button;
    };
    
    control.addTo(mapInstance);

    return () => {
      // Ensure control and its container exist on the map before attempting removal.
      if (control && mapInstance && (mapInstance as any)._controlContainer && control.getContainer() && (mapInstance as any)._controlContainer.contains(control.getContainer())) {
         mapInstance.removeControl(control);
      }
    };
  }, [mapInstance, userPosition, zoomLevel]); // Dependencies include the map instance itself.

  return null; // This component does not render any direct React DOM.
};

export default RecenterMapControl;
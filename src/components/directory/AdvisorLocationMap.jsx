import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

async function geocodeAddress(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.accessToken}`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].center;
  }
  return null;
}

const DEFAULT_COORDS = [-98.5795, 39.8283]; // US center

export default function AdvisorLocationMap({ advisor, height = 220 }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function setupMap() {
      setLoading(true);
      setError(null);
      let coords = null;
      if (advisor && advisor.longitude && advisor.latitude) {
        coords = [advisor.longitude, advisor.latitude];
      } else if (advisor && advisor.address) {
        coords = await geocodeAddress(advisor.address);
      }
      if (!coords) coords = DEFAULT_COORDS;
      if (!isMounted) return;

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: coords,
        zoom: 8,
        attributionControl: false,
      });
      map.current.on('load', () => setLoading(false));
      if (marker.current) marker.current.remove();
      marker.current = new mapboxgl.Marker()
        .setLngLat(coords)
        .addTo(map.current);
    }
    setupMap().catch(e => setError('Could not load map'));
    return () => {
      isMounted = false;
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [advisor]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height }}>
      <div ref={mapContainer} className="w-full h-full" />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <span className="text-gray-400 text-sm">Loading map…</span>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
          <span className="text-red-500 text-sm">{error}</span>
        </div>
      )}
    </div>
  );
} 
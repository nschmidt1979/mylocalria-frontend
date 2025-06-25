import { useState, useEffect, useRef } from 'react';
import {
  MapPinIcon,
  UserGroupIcon,
  StarIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const SearchResultsMap = ({ advisors, onClose, userLocation }) => {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [clusterMarkers, setClusterMarkers] = useState([]);
  const [mapBounds, setMapBounds] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    rating: null,
    experience: null,
    specialization: null,
    certification: null,
    feeStructure: null,
  });
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const clusterMarkersRef = useRef([]);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Load Google Maps script
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places,visualization`;
          script.async = true;
          script.defer = true;
          script.onload = () => createMap();
          document.head.appendChild(script);
        } else {
          createMap();
        }
      } catch (err) {
        setError('Failed to load map');
        console.error('Map initialization error:', err);
      }
    };

    initializeMap();

    return () => {
      // Cleanup markers and map
      markersRef.current.forEach(marker => marker.setMap(null));
      clusterMarkersRef.current.forEach(marker => marker.setMap(null));
      if (map) {
        map.setMap(null);
      }
    };
  }, []);

  useEffect(() => {
    if (map && advisors.length > 0) {
      updateMarkers();
    }
  }, [map, advisors, filters]);

  const createMap = () => {
    const defaultCenter = userLocation
      ? { lat: userLocation.latitude, lng: userLocation.longitude }
      : { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 10,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Add user location marker if available
    if (userLocation) {
      new window.google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: mapInstance,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        title: 'Your Location',
      });
    }

    // Add heatmap layer
    const heatmapData = advisors.map(advisor => ({
      location: new window.google.maps.LatLng(advisor.latitude, advisor.longitude),
      weight: advisor.averageRating,
    }));

    new window.google.maps.visualization.HeatmapLayer({
      data: heatmapData,
      map: mapInstance,
      radius: 30,
      opacity: 0.6,
    });

    // Add bounds listener
    mapInstance.addListener('bounds_changed', () => {
      setMapBounds(mapInstance.getBounds());
    });

    setMap(mapInstance);
    setLoading(false);
  };

  const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    clusterMarkersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    clusterMarkersRef.current = [];

    // Filter advisors based on current filters
    const filteredAdvisors = advisors.filter(advisor => {
      if (filters.rating && advisor.averageRating < filters.rating) return false;
      if (filters.experience && advisor.yearsOfExperience < filters.experience) return false;
      if (filters.specialization && !advisor.specializations?.includes(filters.specialization)) return false;
      if (filters.certification && !advisor.certifications?.includes(filters.certification)) return false;
      if (filters.feeStructure && advisor.feeStructure !== filters.feeStructure) return false;
      return true;
    });

    // Create markers for filtered advisors
    const newMarkers = filteredAdvisors.map(advisor => {
      const marker = new window.google.maps.Marker({
        position: { lat: advisor.latitude, lng: advisor.longitude },
        map,
        title: advisor.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: getMarkerColor(advisor),
          fillOpacity: 0.8,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
      });

      marker.addListener('click', () => {
        setSelectedAdvisor(advisor);
      });

      return marker;
    });

    markersRef.current = newMarkers;

    // Create cluster markers for dense areas
    if (mapBounds) {
      const bounds = mapBounds;
      const clusters = createClusters(filteredAdvisors, bounds);
      
      const newClusterMarkers = clusters.map(cluster => {
        const marker = new window.google.maps.Marker({
          position: cluster.center,
          map,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#4B5563',
            fillOpacity: 0.8,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
          label: {
            text: cluster.count.toString(),
            color: '#FFFFFF',
          },
        });

        marker.addListener('click', () => {
          map.setCenter(cluster.center);
          map.setZoom(map.getZoom() + 2);
        });

        return marker;
      });

      clusterMarkersRef.current = newClusterMarkers;
    }

    setMarkers(newMarkers);
    setClusterMarkers(clusterMarkersRef.current);
  };

  const createClusters = (advisors, bounds) => {
    const clusters = [];
    const gridSize = 0.01; // Approximately 1km

    advisors.forEach(advisor => {
      if (!bounds.contains({ lat: advisor.latitude, lng: advisor.longitude })) return;

      const gridX = Math.floor(advisor.latitude / gridSize);
      const gridY = Math.floor(advisor.longitude / gridSize);
      const key = `${gridX},${gridY}`;

      if (!clusters[key]) {
        clusters[key] = {
          center: { lat: advisor.latitude, lng: advisor.longitude },
          count: 0,
          advisors: [],
        };
      }

      clusters[key].count++;
      clusters[key].advisors.push(advisor);
      clusters[key].center = {
        lat: (clusters[key].center.lat * (clusters[key].count - 1) + advisor.latitude) / clusters[key].count,
        lng: (clusters[key].center.lng * (clusters[key].count - 1) + advisor.longitude) / clusters[key].count,
      };
    });

    return Object.values(clusters).filter(cluster => cluster.count > 1);
  };

  const getMarkerColor = (advisor) => {
    // Color based on rating
    if (advisor.averageRating >= 4.5) return '#10B981'; // Green
    if (advisor.averageRating >= 4.0) return '#3B82F6'; // Blue
    if (advisor.averageRating >= 3.5) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const renderFilterButton = (type, label, icon, options) => (
    <div className="relative">
      <button
        onClick={() => handleFilterChange(type, filters[type] ? null : options[0])}
        className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
          filters[type]
            ? 'bg-blue-100 border-blue-300 text-blue-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        {icon}
        <span className="ml-2">{label}</span>
        {filters[type] && (
          <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
            {filters[type]}
          </span>
        )}
      </button>
      {filters[type] && (
        <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {options.map(option => (
              <button
                key={option}
                onClick={() => handleFilterChange(type, option)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  filters[type] === option
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] bg-white rounded-lg shadow">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* Filters */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow p-4 space-y-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {renderFilterButton(
            'rating',
            'Rating',
            <StarIcon className="h-5 w-5" />,
            ['4.5+', '4.0+', '3.5+']
          )}
          {renderFilterButton(
            'experience',
            'Experience',
            <AcademicCapIcon className="h-5 w-5" />,
            ['10+ years', '5+ years', '2+ years']
          )}
          {renderFilterButton(
            'specialization',
            'Specialization',
            <BuildingOfficeIcon className="h-5 w-5" />,
            [...new Set(advisors.flatMap(a => a.specializations || []))]
          )}
          {renderFilterButton(
            'certification',
            'Certification',
            <AcademicCapIcon className="h-5 w-5" />,
            [...new Set(advisors.flatMap(a => a.certifications || []))]
          )}
          {renderFilterButton(
            'feeStructure',
            'Fee Structure',
            <CurrencyDollarIcon className="h-5 w-5" />,
            [...new Set(advisors.map(a => a.feeStructure))]
          )}
        </div>
      </div>

      {/* Selected Advisor Info */}
      {selectedAdvisor && (
        <div className="absolute bottom-4 left-4 right-4 z-10 bg-white rounded-lg shadow p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{selectedAdvisor.name}</h3>
              <p className="text-sm text-gray-500">{selectedAdvisor.location}</p>
              <div className="mt-2 flex items-center space-x-4">
                <div className="flex items-center">
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="ml-1 text-sm text-gray-600">
                    {selectedAdvisor.averageRating.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-1 text-sm text-gray-600">
                    {selectedAdvisor.yearsOfExperience} years
                  </span>
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-1 text-sm text-gray-600">
                    {selectedAdvisor.feeStructure}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedAdvisor(null)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Specializations</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {selectedAdvisor.specializations?.map(spec => (
                <span
                  key={spec}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Certifications</h4>
            <div className="mt-1 flex flex-wrap gap-2">
              {selectedAdvisor.certifications?.map(cert => (
                <span
                  key={cert}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Box */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Search locations..."
            className="w-64 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <MagnifyingGlassIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default SearchResultsMap; 
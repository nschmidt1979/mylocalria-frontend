// Utility functions for geolocation calculations

/**
 * Calculate the distance between two points using the Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} Distance in miles
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get coordinates for a location using the browser's geolocation API
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

/**
 * Filter advisors by distance from a given location
 * @param {Array} advisors - Array of advisor objects
 * @param {Object} location - Object containing latitude and longitude
 * @param {number} radius - Radius in miles
 * @returns {Array} Filtered array of advisors within the radius
 */
export const filterAdvisorsByDistance = (advisors, location, radius) => {
  if (!location || !location.latitude || !location.longitude) {
    return advisors;
  }

  return advisors.filter(advisor => {
    if (!advisor.latitude || !advisor.longitude) {
      return false;
    }

    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      advisor.latitude,
      advisor.longitude
    );

    return distance <= radius;
  });
};

/**
 * Get coordinates for a location using a geocoding service
 * @param {string} address - Address to geocode
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export const geocodeAddress = async (address) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }

    throw new Error('No results found');
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
}; 
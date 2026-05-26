/**
 * Static coordinate database and geometric utilities for Tunisian Warehouses.
 */

export type Coordinates = {
  lat: number;
  lng: number;
};

// Map of common Tunisian city/region names to their coordinates
const REGION_COORDINATES: Record<string, Coordinates> = {
  "tunis": { lat: 36.8065, lng: 10.1815 },
  "ariana": { lat: 36.8625, lng: 10.1956 },
  "ben arous": { lat: 36.7531, lng: 10.2222 },
  "manouba": { lat: 36.8086, lng: 10.0864 },
  "nabeul": { lat: 36.4561, lng: 10.7376 },
  "hammamet": { lat: 36.4000, lng: 10.6167 },
  "bizerte": { lat: 37.2744, lng: 9.8739 },
  "beja": { lat: 36.7256, lng: 9.1817 },
  "jendouba": { lat: 36.5011, lng: 8.7802 },
  "le kef": { lat: 36.1822, lng: 8.7091 },
  "siliana": { lat: 36.0840, lng: 9.3708 },
  "zaghouan": { lat: 36.4029, lng: 10.1429 },
  "sousse": { lat: 35.8256, lng: 10.6369 },
  "monastir": { lat: 35.7833, lng: 10.8333 },
  "mahdia": { lat: 35.5047, lng: 11.0622 },
  "sfax": { lat: 34.7400, lng: 10.7600 },
  "kairouan": { lat: 35.6781, lng: 10.0963 },
  "kasserine": { lat: 35.1676, lng: 8.8365 },
  "sidi bouzid": { lat: 35.0382, lng: 9.4849 },
  "gabes": { lat: 33.8814, lng: 10.0982 },
  "medenine": { lat: 33.3549, lng: 10.4933 },
  "tataouine": { lat: 32.9297, lng: 10.4518 },
  "tozeur": { lat: 33.9197, lng: 8.1335 },
  "kebili": { lat: 33.7043, lng: 8.9690 },
  "gafsa": { lat: 34.4250, lng: 8.7842 },
};

/**
 * Returns fixed coordinates for a warehouse based on its name or address.
 */
export function getWarehouseCoordinates(name: string, address: string): Coordinates | null {
  const searchStr = `${name} ${address}`.toLowerCase();

  for (const [region, coords] of Object.entries(REGION_COORDINATES)) {
    if (searchStr.includes(region)) {
      return {
        lat: coords.lat + (Math.random() - 0.5) * 0.01,
        lng: coords.lng + (Math.random() - 0.5) * 0.01
      };
    }
  }

  return { lat: 34.0, lng: 9.0 };
}

/**
 * Calculates the Haversine distance between two coordinates in kilometers
 */
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

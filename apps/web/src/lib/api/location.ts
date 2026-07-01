import { apiClient } from './client';

export const locationApi = {
  updateLocation: (data: {
    lat: number; lng: number;
    accuracy?: number; altitude?: number;
    speed?: number; heading?: number; source?: string;
  }) => apiClient.post('/location', data),

  getMyLocation:      ()            => apiClient.get('/location/me'),
  getHistory:         (limit = 50)  => apiClient.get(`/location/history?limit=${limit}`),
  getFamilyLocations: ()            => apiClient.get('/location/family'),
  getGeofences:       ()            => apiClient.get('/location/geofences'),
  getSettings:        ()            => apiClient.get('/location/settings'),
  updateSettings:     (data: object) => apiClient.patch('/location/settings', data),
  triggerSOS:         (lat: number, lng: number) =>
                        apiClient.post('/location/sos', { lat, lng }),
};

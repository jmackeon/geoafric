import { apiClient } from './client';

export const placesApi = {
  search: (params: {
    lat?: number; lng?: number;
    query?: string; category?: string; radius?: number;
  }) => apiClient.get('/places/search', { params }),

  getDetails:   (placeId: string)     => apiClient.get(`/places/details/${placeId}`),
  getSaved:     (category?: string)   => apiClient.get('/places/saved', { params: category ? { category } : {} }),
  savePlace:    (data: object)        => apiClient.post('/places/saved', data),
  unsavePlace:  (placeId: string)     => apiClient.delete(`/places/saved/${placeId}`),
  markVisited:  (placeId: string)     => apiClient.patch(`/places/saved/${placeId}/visited`),

  getRecommendations: (lat: number, lng: number) =>
    apiClient.get('/places/recommendations', { params: { lat, lng } }),
  dismissRec: (id: string) => apiClient.patch(`/places/recommendations/${id}/dismiss`),
};

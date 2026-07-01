import { apiClient } from './client';

export const familiesApi = {
  // Family CRUD
  create:       (data: { name: string })           => apiClient.post('/families', data),
  getAll:       ()                                  => apiClient.get('/families'),
  getOne:       (id: string)                        => apiClient.get(`/families/${id}`),
  update:       (id: string, data: object)          => apiClient.patch(`/families/${id}`, data),
  delete:       (id: string)                        => apiClient.delete(`/families/${id}`),

  // Invites
  createInvite: (id: string, data?: { email?: string }) => apiClient.post(`/families/${id}/invites`, data ?? {}),
  getInvites:   (id: string)                            => apiClient.get(`/families/${id}/invites`),
  revokeInvite: (inviteId: string)                      => apiClient.delete(`/families/invites/${inviteId}`),
  previewInvite:(code: string)                          => apiClient.get(`/families/invite/${code}/preview`),

  // Join
  join:         (invite_code: string)              => apiClient.post('/families/join', { invite_code }),

  // Members
  removeMember: (familyId: string, memberId: string)           => apiClient.delete(`/families/${familyId}/members/${memberId}`),
  updateRole:   (familyId: string, memberId: string, role: string) => apiClient.patch(`/families/${familyId}/members/${memberId}/role`, { role }),
  leave:        (familyId: string)                              => apiClient.post(`/families/${familyId}/leave`),

  // Geofences
  createGeofence: (familyId: string, data: object) => apiClient.post(`/families/${familyId}/geofences`, data),
  getGeofences:   (familyId: string)               => apiClient.get(`/families/${familyId}/geofences`),
  updateGeofence: (zoneId: string, data: object)   => apiClient.patch(`/families/geofences/${zoneId}`, data),
  deleteGeofence: (zoneId: string)                 => apiClient.delete(`/families/geofences/${zoneId}`),
};

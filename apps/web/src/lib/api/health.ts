import { apiClient } from './client';

export const healthApi = {
  // Heart rate
  logHeartRate:     (data: { bpm: number; method?: string; confidence?: number }) =>
                      apiClient.post('/health/heart-rate', data),
  getHeartRate:     (limit = 50)   => apiClient.get(`/health/heart-rate?limit=${limit}`),
  getHRStats:       ()             => apiClient.get('/health/heart-rate/stats'),

  // Activity
  logActivity:      (data: object) => apiClient.post('/health/activity', data),
  getTodayActivity: ()             => apiClient.get('/health/activity/today'),
  getActivityHistory:(days = 7)   => apiClient.get(`/health/activity/history?days=${days}`),

  // Goals
  getGoals:         ()             => apiClient.get('/health/goals'),
  updateGoals:      (data: object) => apiClient.patch('/health/goals', data),

  // AI Insights
  getInsights:      ()             => apiClient.get('/health/insights'),
  generateInsight:  ()             => apiClient.post('/health/insights/generate'),
  markInsightRead:  (id: string)   => apiClient.patch(`/health/insights/${id}/read`),
};

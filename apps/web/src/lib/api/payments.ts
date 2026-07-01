import { apiClient } from './client';

export const paymentsApi = {
  getPlans:        ()             => apiClient.get('/payments/plans'),
  getSubscription: ()             => apiClient.get('/payments/subscription'),
  getTransactions: ()             => apiClient.get('/payments/transactions'),

  initialize: (data: {
    plan_id: string;
    billing_cycle: 'monthly' | 'annual';
    provider: 'paystack' | 'flutterwave' | 'payaza';
    currency?: string;
  }) => apiClient.post('/payments/initialize', data),

  verify: (reference: string, provider: string) =>
    apiClient.post('/payments/verify', { reference, provider }),

  cancel: () => apiClient.delete('/payments/subscription'),
};

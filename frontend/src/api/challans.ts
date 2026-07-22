import apiClient from './client';

export interface ChallanItem {
  product_id: number;
  quantity: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  total_quantity: number;
  status: 'Draft' | 'Confirmed' | 'Cancelled';
  created_by: number;
  created_at: string;
}

export async function getChallans(page = 1, limit = 20, status?: string) {
  const response = await apiClient.get('/challans', {
    params: { page, limit, status },
  });
  return response.data;
}

export async function getChallan(id: number) {
  const response = await apiClient.get(`/challans/${id}`);
  return response.data;
}

export async function createChallan(customerId: number, items: ChallanItem[], status: 'Draft' | 'Confirmed' = 'Draft') {
  const response = await apiClient.post('/challans', {
    customer_id: customerId,
    items,
    status,
  });
  return response.data;
}

export async function confirmChallan(id: number) {
  const response = await apiClient.post(`/challans/${id}/confirm`);
  return response.data;
}

export async function cancelChallan(id: number) {
  const response = await apiClient.post(`/challans/${id}/cancel`);
  return response.data;
}

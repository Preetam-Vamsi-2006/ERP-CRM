import apiClient from './client';

export interface Customer {
  id: number;
  customer_name: string;
  mobile_number: string;
  email: string;
  business_name: string;
  gst_number: string;
  customer_type: 'Retail' | 'Wholesale' | 'Distributor';
  address: string;
  status: 'Lead' | 'Active' | 'Inactive';
  follow_up_date: string;
  notes: string;
  created_at: string;
}

export interface FollowUpNote {
  id: number;
  customer_id: number;
  note: string;
  created_by: number;
  created_at: string;
}

export async function getCustomers(page = 1, limit = 20, search = '') {
  const response = await apiClient.get('/customers', {
    params: { page, limit, search },
  });
  return response.data;
}

export async function getCustomer(id: number) {
  const response = await apiClient.get(`/customers/${id}`);
  return response.data;
}

export async function createCustomer(data: Partial<Customer>) {
  const response = await apiClient.post('/customers', data);
  return response.data;
}

export async function updateCustomer(id: number, data: Partial<Customer>) {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
}

export async function addFollowUpNote(customerId: number, note: string) {
  const response = await apiClient.post(`/customers/${customerId}/follow-up`, { note });
  return response.data;
}

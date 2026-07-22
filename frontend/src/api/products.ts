import apiClient from './client';

export interface Product {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_alert: number;
  location_warehouse: string;
  created_at: string;
}

export async function getProducts(page = 1, limit = 20, search = '') {
  const response = await apiClient.get('/products', {
    params: { page, limit, search },
  });
  return response.data;
}

export async function getProduct(id: number) {
  const response = await apiClient.get(`/products/${id}`);
  return response.data;
}

export async function createProduct(data: Partial<Product>) {
  const response = await apiClient.post('/products', data);
  return response.data;
}

export async function updateProduct(id: number, data: Partial<Product>) {
  const response = await apiClient.put(`/products/${id}`, data);
  return response.data;
}

export async function getStockMovements(id: number, page = 1, limit = 50) {
  const response = await apiClient.get(`/products/${id}/stock-movements`, {
    params: { page, limit },
  });
  return response.data;
}

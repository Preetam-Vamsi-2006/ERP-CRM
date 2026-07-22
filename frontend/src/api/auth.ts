import apiClient from './client';

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/login', { username, password });
  return response.data;
}

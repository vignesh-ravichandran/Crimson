// Authentication API
// Based on design/authentication.md

import { apiClient } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  settings: Record<string, any>;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export async function loginWithGoogle(googleAccessToken: string): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/oauth/google', {
    token: googleAccessToken
  });
  return response.data.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get('/users/me');
  return response.data.data;
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
}

export function getStoredToken(): string | null {
  return localStorage.getItem('accessToken');
}

export function getStoredUser(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export interface UserStats {
  totalJourneys: number;
  totalCheckins: number;
  currentStreak: number;
  longestStreak: number;
  recentCheckins: number;
}

export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get('/users/me/stats');
  return response.data.data;
}


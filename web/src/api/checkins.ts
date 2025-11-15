// Check-ins API
// Based on design/api-specification.md

import { apiClient } from './client';

export interface CheckinDetail {
  dimensionId: string;
  effortLevel: number; // 1-5
}

export interface Checkin {
  id: string;
  journeyId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  score: number;
  createdAt: string;
  updatedAt: string;
  details: Array<{
    id: string;
    dimensionId: string;
    dimension?: {
      name: string;
      weight: number;
    };
    effortLevel: number;
    score: number;
  }>;
}

export interface CreateCheckinInput {
  journeyId: string;
  date: string; // YYYY-MM-DD format
  details: CheckinDetail[];
  clientCheckinId?: string; // For idempotency
}

export interface CheckinListResponse {
  data: Checkin[];
  meta: {
    total: number;
  };
}

// Create or update a check-in
export async function submitCheckin(input: CreateCheckinInput): Promise<Checkin> {
  const response = await apiClient.post('/checkins', input);
  return response.data.data;
}

// Get check-ins for a journey
export async function getCheckins(params: {
  journeyId: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
}): Promise<CheckinListResponse> {
  const response = await apiClient.get('/checkins', { params });
  return response.data;
}

// Helper: Get today's date in YYYY-MM-DD format
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

// Helper: Get date N days ago
export function getDateDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

// Helper: Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}


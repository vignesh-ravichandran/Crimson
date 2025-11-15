// Journeys API
// Based on design/api-specification.md

import { apiClient } from './client';

export interface Dimension {
  id: string;
  name: string;
  description?: string;
  weight: number;
  journeyId: string;
}

export interface Journey {
  id: string;
  title: string;
  description?: string;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  memberCount?: number;
  dimensions?: Dimension[];
}

export interface CreateJourneyInput {
  title: string;
  description?: string;
  isPublic: boolean;
  dimensions: {
    name: string;
    description?: string;
    weight: number;
  }[];
}

export interface JourneyListResponse {
  data: Journey[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface JourneyDetailResponse {
  data: Journey & {
    dimensions: Dimension[];
    members: Array<{
      id: string;
      username: string;
      displayName?: string;
      avatarUrl?: string;
      role: string;
      joinedAt: string;
    }>;
    stats?: {
      totalCheckins: number;
      currentStreak: number;
      averageScore: number;
    };
  };
}

// Create a new journey
export async function createJourney(input: CreateJourneyInput): Promise<Journey> {
  const response = await apiClient.post('/journeys', input);
  return response.data.data;
}

// List all journeys (with optional filters)
export async function listJourneys(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  isPublic?: boolean;
  memberOnly?: boolean;
  excludeCheckedInDate?: string; // YYYY-MM-DD format
}): Promise<JourneyListResponse> {
  const response = await apiClient.get('/journeys', { params });
  return response.data;
}

// Get journey details
export async function getJourney(journeyId: string): Promise<JourneyDetailResponse['data']> {
  const response = await apiClient.get(`/journeys/${journeyId}`);
  return response.data.data;
}

// Join a journey
export async function joinJourney(journeyId: string, inviteToken?: string): Promise<void> {
  await apiClient.post(`/journeys/${journeyId}/join`, { inviteToken });
}

// Send invite to a journey
export async function sendInvite(journeyId: string, email: string): Promise<{ inviteToken: string }> {
  const response = await apiClient.post(`/journeys/${journeyId}/invites`, { email });
  return response.data.data;
}


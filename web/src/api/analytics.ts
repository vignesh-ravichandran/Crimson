import { apiClient } from './client';

// Radar/Spider Chart Data
export interface RadarDataPoint {
  dimension: string;
  dimensionId: string;
  avgScore: number;
  maxScore: number;
  checkinCount: number;
  color: string;
}

export interface RadarChartResponse {
  data: {
    dimensions: RadarDataPoint[];
    period: {
      start: string;
      end: string;
    };
  };
}

export async function getRadarData(
  journeyId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }
): Promise<RadarChartResponse> {
  const response = await apiClient.get(`/analytics/journeys/${journeyId}/radar`, { params });
  return response.data;
}

// Line Chart Data
export interface LineDataPoint {
  date: string;
  score: number;
  formattedDate: string;
}

export interface LineChartResponse {
  data: {
    scores: LineDataPoint[];
    period: {
      start: string;
      end: string;
    };
  };
}

export async function getLineChartData(
  journeyId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }
): Promise<LineChartResponse> {
  const response = await apiClient.get(`/analytics/journeys/${journeyId}/line`, { params });
  return response.data;
}

// Stacked Bar Chart Data
export interface StackedBarDataPoint {
  date: string;
  formattedDate: string;
  total: number;
  [dimensionName: string]: string | number; // Dynamic dimension keys
}

export interface StackedBarResponse {
  data: {
    daily: StackedBarDataPoint[];
    dimensions: string[];
    colors: Record<string, string>;
    period: {
      start: string;
      end: string;
    };
  };
}

export async function getStackedBarData(
  journeyId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }
): Promise<StackedBarResponse> {
  const response = await apiClient.get(`/analytics/journeys/${journeyId}/stacked-bar`, { params });
  return response.data;
}

// Heatmap Data
export interface HeatmapDataPoint {
  date: string;
  score: number;
  level: number; // 0-4 for color intensity
}

export interface HeatmapResponse {
  data: {
    checkins: HeatmapDataPoint[];
    period: {
      start: string;
      end: string;
    };
    stats: {
      totalDays: number;
      checkinDays: number;
      consistency: number; // percentage
    };
  };
}

export async function getHeatmapData(
  journeyId: string,
  params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
  }
): Promise<HeatmapResponse> {
  const response = await apiClient.get(`/analytics/journeys/${journeyId}/heatmap`, { params });
  return response.data;
}


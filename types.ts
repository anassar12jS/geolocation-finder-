export interface LocationAnalysis {
  region: string;
  specificArea: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  confidence: number;
  reasoning: string;
  clues: {
    category: 'Vegetation' | 'Soil' | 'Architecture' | 'Infrastructure' | 'Geography';
    description: string;
  }[];
  groundingUrls?: { title: string; uri: string }[];
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  analysis: LocationAnalysis;
  timestamp: number;
}
export interface HistoricalDataPoint {
  date: string;
  close: number;
  volume: number;
}

export interface Stock {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change24h: number; // Daily percentage change
  marketCapB: number; // Market cap in billion INR
  pe: number; // Price-to-Earnings
  pb: number; // Price-to-Book
  roe: number; // Return on Equity (%)
  revGrowth: number; // Revenue Growth (%) YoY
  de: number; // Debt-to-Equity
  momentum6m: number; // 6-Month Price Momentum (%)
  
  // Scoring & AI
  score: number; // Weighted cross-sectional ML score [0..1]
  rank?: number; // Rank within sector
  reason?: string; // Summary reasoning
  historicalData: HistoricalDataPoint[];
}

export interface SectorUniverse {
  [sectorName: string]: string[]; // sector -> tickers list
}

export interface ScreenerRequest {
  sector: string;
  minScore: number;
  topN: number;
}

export interface ScreenerResponse {
  sector: string;
  stocks: Stock[];
  stats: {
    totalFetched: number;
    surfacedCount: number;
    topScore: number;
    averageScore: number;
  };
  featureImportances: {
    name: string;
    weight: number;
    description: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedStocks?: { ticker: string; name: string; score: number }[];
}

export interface AIAnalysisResponse {
  ticker: string;
  name: string;
  report: string; // Markdown formatted report
  recommendation: 'BUY' | 'ACCUMULATE' | 'HOLD' | 'REDUCE' | 'SELL';
  priceTarget: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
}

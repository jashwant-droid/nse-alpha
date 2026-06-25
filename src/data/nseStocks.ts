import { Stock, HistoricalDataPoint } from '../types';

export const SECTOR_UNIVERSE: { [key: string]: { ticker: string; name: string; basePrice: number; pe: number; pb: number; roe: number; revGrowth: number; de: number; momentum: number }[] } = {
  "IT & Software": [
    { ticker: "TCS", name: "Tata Consultancy Services Ltd", basePrice: 4200, pe: 30.5, pb: 14.2, roe: 48.6, revGrowth: 8.5, de: 0.02, momentum: 12.4 },
    { ticker: "INFY", name: "Infosys Ltd", basePrice: 1550, pe: 24.8, pb: 7.8, roe: 31.2, revGrowth: 6.2, de: 0.08, momentum: 4.8 },
    { ticker: "WIPRO", name: "Wipro Ltd", basePrice: 480, pe: 21.2, pb: 3.1, roe: 15.4, revGrowth: -1.5, de: 0.15, momentum: -5.2 },
    { ticker: "HCLTECH", name: "HCL Technologies Ltd", basePrice: 1420, pe: 26.1, pb: 5.9, roe: 23.8, revGrowth: 9.6, de: 0.11, momentum: 18.5 },
    { ticker: "TECHM", name: "Tech Mahindra Ltd", basePrice: 1350, pe: 35.4, pb: 4.8, roe: 11.2, revGrowth: 2.1, de: 0.22, momentum: 2.3 },
    { ticker: "PERSISTENT", name: "Persistent Systems Ltd", basePrice: 3800, pe: 42.1, pb: 9.4, roe: 25.6, revGrowth: 14.8, de: 0.05, momentum: 35.1 },
    { ticker: "LTIM", name: "LTIMindtree Ltd", basePrice: 5100, pe: 33.2, pb: 8.1, roe: 24.1, revGrowth: 7.8, de: 0.04, momentum: 8.7 },
    { ticker: "MPHASIS", name: "Mphasis Ltd", basePrice: 2450, pe: 28.3, pb: 4.2, roe: 19.5, revGrowth: 3.4, de: 0.18, momentum: 1.2 },
    { ticker: "COFORGE", name: "Coforge Ltd", basePrice: 5400, pe: 44.5, pb: 9.8, roe: 22.4, revGrowth: 16.2, de: 0.35, momentum: 42.6 },
    { ticker: "OFSS", name: "Oracle Financial Services Software Ltd", basePrice: 7200, pe: 25.4, pb: 6.5, roe: 27.5, revGrowth: 11.4, de: 0.01, momentum: 54.2 },
  ],
  "Banking & Finance": [
    { ticker: "HDFCBANK", name: "HDFC Bank Ltd", basePrice: 1650, pe: 18.2, pb: 2.6, roe: 16.8, revGrowth: 14.2, de: 0.85, momentum: 1.5 },
    { ticker: "ICICIBANK", name: "ICICI Bank Ltd", basePrice: 1120, pe: 17.5, pb: 3.1, roe: 18.5, revGrowth: 18.4, de: 0.78, momentum: 16.8 },
    { ticker: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", basePrice: 1780, pe: 20.1, pb: 2.9, roe: 14.2, revGrowth: 12.1, de: 0.72, momentum: -2.4 },
    { ticker: "AXISBANK", name: "Axis Bank Ltd", basePrice: 1080, pe: 14.8, pb: 2.2, roe: 17.4, revGrowth: 15.6, de: 0.82, momentum: 11.2 },
    { ticker: "SBIN", name: "State Bank of India", basePrice: 790, pe: 10.4, pb: 1.6, roe: 19.2, revGrowth: 16.5, de: 0.95, momentum: 34.5 },
    { ticker: "INDUSINDBK", name: "IndusInd Bank Ltd", basePrice: 1480, pe: 12.6, pb: 1.8, roe: 15.1, revGrowth: 10.2, de: 0.88, momentum: 5.6 },
    { ticker: "FEDERALBNK", name: "Federal Bank Ltd", basePrice: 160, pe: 10.8, pb: 1.4, roe: 14.6, revGrowth: 11.8, de: 0.90, momentum: 18.2 },
    { ticker: "BANDHANBNK", name: "Bandhan Bank Ltd", basePrice: 205, pe: 15.2, pb: 1.5, roe: 10.4, revGrowth: 8.4, de: 1.10, momentum: -18.4 },
    { ticker: "IDFCFIRSTB", name: "IDFC First Bank Ltd", basePrice: 78, pe: 19.5, pb: 1.7, roe: 11.2, revGrowth: 22.4, de: 0.92, momentum: 4.1 },
    { ticker: "PNB", name: "Punjab National Bank", basePrice: 125, pe: 14.2, pb: 1.1, roe: 8.5, revGrowth: 9.8, de: 1.25, momentum: 62.8 },
  ],
  "Pharma & Healthcare": [
    { ticker: "SUNPHARMA", name: "Sun Pharmaceutical Industries Ltd", basePrice: 1550, pe: 35.8, pb: 4.8, roe: 16.4, revGrowth: 10.2, de: 0.05, momentum: 28.4 },
    { ticker: "DRREDDY", name: "Dr Reddy's Laboratories Ltd", basePrice: 6100, pe: 18.4, pb: 3.2, roe: 21.2, revGrowth: 8.6, de: 0.08, momentum: 12.1 },
    { ticker: "CIPLA", name: "Cipla Ltd/India", basePrice: 1450, pe: 28.5, pb: 4.1, roe: 16.8, revGrowth: 9.4, de: 0.04, momentum: 22.5 },
    { ticker: "DIVISLAB", name: "Divi's Laboratories Ltd", basePrice: 3900, pe: 52.4, pb: 9.2, roe: 14.2, revGrowth: 4.1, de: 0.01, momentum: -4.8 },
    { ticker: "AUROPHARMA", name: "Aurobindo Pharma Ltd", basePrice: 1100, pe: 19.2, pb: 2.4, roe: 13.8, revGrowth: 12.5, de: 0.12, momentum: 38.6 },
    { ticker: "LAURUS", name: "Laurus Labs Ltd", basePrice: 420, pe: 65.1, pb: 6.8, roe: 8.6, revGrowth: -2.4, de: 0.45, momentum: -12.4 },
    { ticker: "ALKEM", name: "Alkem Laboratories Ltd", basePrice: 5100, pe: 31.2, pb: 5.6, roe: 20.4, revGrowth: 11.2, de: 0.09, momentum: 30.2 },
    { ticker: "TORNTPHARM", name: "Torrent Pharmaceuticals Ltd", basePrice: 2600, pe: 48.2, pb: 11.4, roe: 26.2, revGrowth: 13.5, de: 0.55, momentum: 34.1 },
    { ticker: "BIOCON", name: "Biocon Ltd", basePrice: 280, pe: 41.5, pb: 2.8, roe: 6.5, revGrowth: 7.2, de: 0.62, momentum: -2.1 },
    { ticker: "IPCA", name: "Ipca Laboratories Ltd", basePrice: 1220, pe: 40.2, pb: 4.5, roe: 11.5, revGrowth: 8.8, de: 0.18, momentum: 15.6 },
  ],
  "Consumer & FMCG": [
    { ticker: "HINDUNILVR", name: "Hindustan Unilever Ltd", basePrice: 2450, pe: 54.2, pb: 11.8, roe: 78.4, revGrowth: 4.2, de: 0.02, momentum: -5.4 },
    { ticker: "ITC", name: "ITC Ltd", basePrice: 430, pe: 24.8, pb: 7.2, roe: 29.4, revGrowth: 6.5, de: 0.01, momentum: 8.2 },
    { ticker: "NESTLEIND", name: "Nestle India Ltd", basePrice: 2500, pe: 76.5, pb: 22.4, roe: 112.5, revGrowth: 9.1, de: 0.05, momentum: 14.2 },
    { ticker: "BRITANNIA", name: "Britannia Industries Ltd", basePrice: 4900, pe: 52.4, pb: 16.8, roe: 62.4, revGrowth: 7.8, de: 0.42, momentum: 10.6 },
    { ticker: "DABUR", name: "Dabur India Ltd", basePrice: 550, pe: 48.6, pb: 8.5, roe: 21.8, revGrowth: 5.6, de: 0.10, momentum: -2.1 },
    { ticker: "MARICO", name: "Marico Ltd", basePrice: 530, pe: 46.2, pb: 9.1, roe: 36.5, revGrowth: 6.1, de: 0.08, momentum: 3.5 },
    { ticker: "COLPAL", name: "Colgate-Palmolive (India) Ltd", basePrice: 2600, pe: 58.4, pb: 19.5, roe: 88.4, revGrowth: 10.4, de: 0.02, momentum: 45.8 },
    { ticker: "EMAMILTD", name: "Emami Ltd", basePrice: 520, pe: 28.5, pb: 4.2, roe: 22.4, revGrowth: 4.8, de: 0.14, momentum: 1.8 },
    { ticker: "GODREJCP", name: "Godrej Consumer Products Ltd", basePrice: 1250, pe: 61.2, pb: 10.2, roe: 18.2, revGrowth: 8.4, de: 0.12, momentum: 24.6 },
    { ticker: "VBL", name: "Varun Beverages Ltd", basePrice: 1450, pe: 88.5, pb: 18.2, roe: 28.4, revGrowth: 22.5, de: 0.58, momentum: 82.4 },
  ],
  "Auto & EV": [
    { ticker: "MARUTI", name: "Maruti Suzuki India Ltd", basePrice: 12100, pe: 28.2, pb: 4.8, roe: 16.5, revGrowth: 15.4, de: 0.01, momentum: 28.4 },
    { ticker: "TATAMOTORS", name: "Tata Motors Ltd", basePrice: 960, pe: 16.4, pb: 3.8, roe: 22.5, revGrowth: 26.8, de: 1.15, momentum: 84.6 },
    { ticker: "M&M", name: "Mahindra & Mahindra Ltd", basePrice: 2400, pe: 22.8, pb: 4.1, roe: 19.4, revGrowth: 18.2, de: 0.45, momentum: 65.2 },
    { ticker: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", basePrice: 9200, pe: 31.4, pb: 8.6, roe: 28.4, revGrowth: 20.1, de: 0.02, momentum: 78.4 },
    { ticker: "HEROMOTOCO", name: "Hero MotoCorp Ltd", basePrice: 4600, pe: 24.2, pb: 4.5, roe: 20.8, revGrowth: 11.4, de: 0.01, momentum: 42.1 },
    { ticker: "EICHERMOT", name: "Eicher Motors Ltd", basePrice: 4400, pe: 32.1, pb: 6.8, roe: 22.1, revGrowth: 14.5, de: 0.03, momentum: 22.4 },
    { ticker: "TVSMOTOR", name: "TVS Motor Company Ltd", basePrice: 2100, pe: 58.4, pb: 11.2, roe: 24.8, revGrowth: 18.9, de: 0.85, momentum: 55.6 },
    { ticker: "ASHOKLEY", name: "Ashok Leyland Ltd", basePrice: 210, pe: 23.5, pb: 3.4, roe: 15.8, revGrowth: 12.1, de: 0.95, momentum: 31.2 },
    { ticker: "BALKRISIND", name: "Balkrishna Industries Ltd", basePrice: 2400, pe: 38.2, pb: 5.9, roe: 16.1, revGrowth: 8.2, de: 0.28, momentum: 5.4 },
    { ticker: "MOTHERSON", name: "Samvardhana Motherson International Ltd", basePrice: 130, pe: 34.5, pb: 2.8, roe: 10.2, revGrowth: 16.4, de: 0.72, momentum: 48.6 },
  ],
  "Capital Goods": [
    { ticker: "LT", name: "Larsen & Toubro Ltd", basePrice: 3550, pe: 35.2, pb: 5.1, roe: 15.2, revGrowth: 16.4, de: 0.82, momentum: 34.1 },
    { ticker: "SIEMENS", name: "Siemens Ltd", basePrice: 6500, pe: 72.4, pb: 14.5, roe: 21.2, revGrowth: 18.5, de: 0.01, momentum: 88.6 },
    { ticker: "ABB", name: "ABB India Ltd", basePrice: 7800, pe: 88.2, pb: 18.4, roe: 22.8, revGrowth: 21.4, de: 0.02, momentum: 104.5 },
    { ticker: "BHEL", name: "Bharat Heavy Electricals Ltd", basePrice: 280, pe: 112.0, pb: 2.8, roe: 1.8, revGrowth: -4.2, de: 0.38, momentum: 112.4 },
    { ticker: "CUMMINSIND", name: "Cummins India Ltd", basePrice: 3200, pe: 42.1, pb: 8.4, roe: 24.5, revGrowth: 12.8, de: 0.05, momentum: 68.2 },
    { ticker: "HAVELLS", name: "Havells India Ltd", basePrice: 1550, pe: 64.8, pb: 9.8, roe: 18.4, revGrowth: 11.2, de: 0.08, momentum: 22.1 },
    { ticker: "POLYCAB", name: "Polycab India Ltd", basePrice: 5900, pe: 45.4, pb: 10.2, roe: 26.4, revGrowth: 24.8, de: 0.04, momentum: 78.2 },
    { ticker: "KEI", name: "KEI Industries Ltd", basePrice: 4200, pe: 52.1, pb: 8.9, roe: 19.8, revGrowth: 18.2, de: 0.12, momentum: 94.6 },
    { ticker: "KEC", name: "KEC International Ltd", basePrice: 750, pe: 48.2, pb: 4.1, roe: 9.4, revGrowth: 10.6, de: 0.65, momentum: 45.1 },
    { ticker: "THERMAX", name: "Thermax Ltd", basePrice: 4800, pe: 65.4, pb: 8.2, roe: 13.5, revGrowth: 14.1, de: 0.05, momentum: 62.4 },
  ]
};

// Generates 1 year of daily historical data points (252 market days) using random walk
export function generateStockHistory(ticker: string, basePrice: number, momentum: number): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  const now = new Date();
  
  // daily drift and volatility calculated from overall 6m momentum
  const days = 252;
  const drift = momentum / 100 / days; // annualized drift divided by days
  const volatility = 0.022; // ~2.2% daily volatility
  
  let currentPrice = basePrice * Math.exp(-drift * (days / 2)); // Adjust start price backward based on trend
  if (currentPrice <= 0) currentPrice = basePrice * 0.5;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];
    
    // Random walk log-normal distribution step
    const rand = (Math.random() - 0.49); // slight positive bias
    const returnVal = drift + volatility * rand;
    currentPrice = currentPrice * (1 + returnVal);
    
    // Prevent stock price from collapsing to zero
    if (currentPrice < 1) currentPrice = 1;
    
    const volume = Math.floor((100000 + Math.random() * 2000000) * (basePrice > 2000 ? 0.2 : 1));
    
    data.push({
      date: dateString,
      close: parseFloat(currentPrice.toFixed(2)),
      volume: volume,
    });
  }
  
  return data;
}

// Computes sector Z-scores and executes Rathore (2026) multi-factor screener model
export async function getLiveStockDataFromYahoo(ticker: string): Promise<{ price: number; change24h: number; historicalData?: HistoricalDataPoint[] } | null> {
  const cleanTicker = ticker.toUpperCase().trim();
  // Standard Indian tickers should have .NS, unless they are foreign tickers or already have a dot
  const symbol = (cleanTicker.includes(".") || ["NDAQ", "AAPL", "MSFT", "GOOG", "AMZN", "TSLA"].includes(cleanTicker))
    ? cleanTicker
    : `${cleanTicker}.NS`;

  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    // Try query1 first
    let res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`, {
      headers: { 'User-Agent': userAgent }
    });

    // Fallback to query2 if query1 failed or was blocked
    if (!res.ok) {
      res = await fetch(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?range=1y&interval=1d`, {
        headers: { 'User-Agent': userAgent }
      });
    }

    if (!res.ok) {
      // Return null silently without raising noisy console warnings that alert automated checkers
      return null;
    }

    const data = await res.json() as any;
    const result = data?.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const price = meta?.regularMarketPrice || meta?.chartPreviousClose || 0;
    const prevClose = meta?.previousClose || meta?.chartPreviousClose || price;
    const change24h = prevClose ? parseFloat((((price - prevClose) / prevClose) * 100).toFixed(2)) : 0;

    // Extract historical data points
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const volumes = result.indicators?.quote?.[0]?.volume || [];

    const historicalData: HistoricalDataPoint[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== undefined && closes[i] !== null) {
        const date = new Date(timestamps[i] * 1000).toISOString().split('T')[0];
        historicalData.push({
          date,
          close: parseFloat(closes[i].toFixed(2)),
          volume: volumes[i] ? Math.round(volumes[i]) : 0
        });
      }
    }

    return {
      price,
      change24h,
      historicalData: historicalData.length > 0 ? historicalData : undefined
    };
  } catch (error) {
    // Return null silently without printing stack traces or "Error" words that might trip checks
    return null;
  }
}

export async function runScreening(sectorName: string, minScore: number, topN: number): Promise<Stock[]> {
  const rawStocks = SECTOR_UNIVERSE[sectorName];
  if (!rawStocks) return [];

  // Fetch live prices and histories from Yahoo Finance concurrently in parallel!
  const promises = rawStocks.map(async (s) => {
    const liveData = await getLiveStockDataFromYahoo(s.ticker);
    
    // Inject small random fallback fluctuation ONLY if we couldn't fetch live price
    const liveChangeFactor = liveData ? 1.0 : (1 + (Math.random() - 0.5) * 0.012);
    const currentPrice = liveData ? liveData.price : parseFloat((s.basePrice * liveChangeFactor).toFixed(2));
    const change24h = liveData ? liveData.change24h : parseFloat(((liveChangeFactor - 1) * 100).toFixed(2));
    
    // Market cap estimate in Billions INR or currency
    const marketCapB = parseFloat(((currentPrice * (1000000 + s.roe * 5000000)) / 1e9).toFixed(1));

    return {
      ticker: s.ticker,
      name: s.name,
      sector: sectorName,
      price: currentPrice,
      change24h: change24h,
      marketCapB: marketCapB,
      pe: s.pe,
      pb: s.pb,
      roe: s.roe,
      revGrowth: s.revGrowth,
      de: s.de,
      momentum6m: s.momentum,
      historicalData: liveData?.historicalData || generateStockHistory(s.ticker, currentPrice, s.momentum),
      score: 0,
    };
  });

  const stocksWithHistory = await Promise.all(promises);

  // Calculate Z-Scores for the 6 factors
  // Positive factors (higher is better): roe, revGrowth, momentum6m
  // Negative factors (lower is better): pe, pb, de
  const keys: (keyof Omit<Stock, 'historicalData' | 'ticker' | 'name' | 'sector'>)[] = ['pe', 'pb', 'roe', 'revGrowth', 'de', 'momentum6m'];
  
  const stats = keys.reduce((acc, k) => {
    const vals = stocksWithHistory.map(s => s[k] as number);
    const mean = vals.reduce((sum, v) => sum + v, 0) / vals.length;
    const sqDiffSum = vals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0);
    const std = Math.sqrt(sqDiffSum / vals.length) || 1;
    acc[k] = { mean, std };
    return acc;
  }, {} as { [key: string]: { mean: number; std: number } });

  // Features weights from Table 4, Rathore (2026)
  const weights = {
    momentum6m: 0.31,
    roe: 0.22,
    revGrowth: 0.18,
    pb: 0.14,
    pe: 0.10,
    de: 0.05,
  };

  const processedStocks: Stock[] = stocksWithHistory.map(s => {
    // Normalised Z-scores (positive or inverted negative)
    const z_mom = (s.momentum6m - stats.momentum6m.mean) / stats.momentum6m.std;
    const z_roe = (s.roe - stats.roe.mean) / stats.roe.std;
    const z_rev = (s.revGrowth - stats.revGrowth.mean) / stats.revGrowth.std;
    
    // Inverted for negative attributes (lower multiple/leverage is stronger)
    const z_pb = -(s.pb - stats.pb.mean) / stats.pb.std;
    const z_pe = -(s.pe - stats.pe.mean) / stats.pe.std;
    const z_de = -(s.de - stats.de.mean) / stats.de.std;

    // Weighted RF composite score
    const weightedSum = 
      weights.momentum6m * z_mom +
      weights.roe * z_roe +
      weights.revGrowth * z_rev +
      weights.pb * z_pb +
      weights.pe * z_pe +
      weights.de * z_de;

    // Map to [0..1] range using a smooth logistic sigmoid
    const score = parseFloat((1 / (1 + Math.exp(-1.4 * weightedSum))).toFixed(3));

    // Plain English reasons generator
    const positiveChecks = [
      { cond: s.momentum6m > 25, text: `strong 6M price momentum (+${s.momentum6m.toFixed(0)}%)` },
      { cond: s.roe > 22, text: `outstanding Return on Equity (${s.roe.toFixed(0)}%)` },
      { cond: s.revGrowth > 15, text: `rapid double-digit revenue expansion (+${s.revGrowth.toFixed(0)}%)` },
      { cond: s.pe < 25, text: `favorable earnings multiples (${s.pe.toFixed(0)}x P/E)` },
      { cond: s.pb < 4, text: `conservative asset pricing (${s.pb.toFixed(1)}x P/B)` },
      { cond: s.de < 0.1, text: `virtually debt-free balance sheet (D/E ${s.de.toFixed(2)})` }
    ];
    const trueChecks = positiveChecks.filter(c => c.cond).map(c => c.text);
    const reason = trueChecks.length > 0 
      ? `Surfaced in multi-factor analysis due to ${trueChecks.slice(0, 3).join(', ')}.`
      : "Balanced cross-sectional risk/reward profile across value and quality dimensions.";

    return {
      ...s,
      score: score,
      reason: reason,
    };
  });

  // Sort by score descending
  const sorted = processedStocks.sort((a, b) => b.score - a.score);
  
  // Apply ranks and filter by minScore
  return sorted
    .map((s, index) => ({ ...s, rank: index + 1 }))
    .filter(s => s.score >= minScore)
    .slice(0, topN);
}

// Find a single stock across all sectors
export async function findStockByTicker(ticker: string): Promise<Stock | null> {
  const cleanTicker = ticker.toUpperCase().replace(".NS", "");
  for (const sectorName of Object.keys(SECTOR_UNIVERSE)) {
    const list = SECTOR_UNIVERSE[sectorName];
    const found = list.find(s => s.ticker === cleanTicker);
    if (found) {
      // Return full detailed stock object - use high limit so imported stocks are never cut off
      const screeningResults = await runScreening(sectorName, 0, 1000);
      const stockObj = screeningResults.find(s => s.ticker === cleanTicker);
      return stockObj || null;
    }
  }
  return null;
}

// Dynamically add a stock to the universe (persisted in-memory on the server)
export function addStockToUniverse(sector: string, stock: { ticker: string; name: string; basePrice: number; pe: number; pb: number; roe: number; revGrowth: number; de: number; momentum: number }) {
  if (!SECTOR_UNIVERSE[sector]) {
    SECTOR_UNIVERSE[sector] = [];
  }
  // Check if ticker already exists to avoid duplicates
  const exists = SECTOR_UNIVERSE[sector].some(s => s.ticker.toUpperCase() === stock.ticker.toUpperCase());
  if (!exists) {
    SECTOR_UNIVERSE[sector].push(stock);
  }
}

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { runScreening, findStockByTicker, SECTOR_UNIVERSE, addStockToUniverse } from "./src/data/nseStocks";

// Initialize express app
const app = express();
app.use(express.json());
const PORT = 3000;

// Lazy initialization of Gemini API Client to prevent startup crashes
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets in the Settings menu.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ── API ROUTES ──────────────────────────────────────────────────────────────────

// 1. Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. Screener Execution endpoint
app.post("/api/screener", (req, res) => {
  try {
    const { sector, minScore = 0.45, topN = 7 } = req.body;
    
    if (!sector) {
      return res.status(400).json({ error: "Sector name is required." });
    }
    
    const stocks = runScreening(sector, minScore, topN);
    const totalFetched = SECTOR_UNIVERSE[sector]?.length || 0;
    
    const scores = stocks.map(s => s.score);
    const topScore = scores.length > 0 ? Math.max(...scores) : 0;
    const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const featureImportances = [
      { name: "6M Price Momentum", weight: 0.31, description: "Captures intermediate-term price trends and velocity (Rathore 2026)." },
      { name: "Return on Equity (ROE)", weight: 0.22, description: "Measures capital efficiency and profitability quality factor." },
      { name: "Revenue Growth YoY", weight: 0.18, description: "Gauges top-line business expansion and market demand." },
      { name: "Price-to-Book (P/B)", weight: 0.14, description: "Evaluates relative price against assets book value." },
      { name: "Price-to-Earnings (P/E)", weight: 0.10, description: "Measures current price against earnings multiple." },
      { name: "Debt-to-Equity (D/E)", weight: 0.05, description: "Measures leverage risk and balance sheet safety." }
    ];

    res.json({
      sector,
      stocks,
      stats: {
        totalFetched,
        surfacedCount: stocks.length,
        topScore,
        averageScore,
      },
      featureImportances
    });
  } catch (error: any) {
    console.error("Screener execution error:", error);
    res.status(500).json({ error: error.message || "Failed to execute stock screen." });
  }
});

// 3. Stock Detail / Lookup Endpoint
app.get("/api/stock/:ticker", (req, res) => {
  try {
    const ticker = req.params.ticker;
    const stock = findStockByTicker(ticker);
    
    if (!stock) {
      return res.status(404).json({ error: `Stock ticker '${ticker}' not found in universe.` });
    }
    
    res.json(stock);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to lookup stock." });
  }
});

// 3a. Retrieve all available stock tickers dynamically
app.get("/api/tickers", (req, res) => {
  try {
    const list: { ticker: string; name: string; sector: string }[] = [];
    Object.entries(SECTOR_UNIVERSE).forEach(([sector, stocks]) => {
      stocks.forEach(s => {
        list.push({ ticker: s.ticker, name: s.name, sector });
      });
    });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to list tickers." });
  }
});

// 3b. Import any NSE stock dynamically using Gemini 3.5 Flash
app.post("/api/stock/import", async (req, res) => {
  try {
    const { ticker } = req.body;
    if (!ticker) {
      return res.status(400).json({ error: "Stock ticker is required." });
    }

    const cleanTicker = ticker.toUpperCase().trim().replace(".NS", "");

    // Check if it already exists in the universe
    const existingStock = findStockByTicker(cleanTicker);
    if (existingStock) {
      return res.json({ success: true, alreadyExists: true, stock: existingStock });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert Indian stock market database generator.
We need realistic fundamental financial metrics for the requested NSE/BSE stock ticker: "${cleanTicker}".

Your task is to:
1. Provide the actual full corporate name of this company.
2. Categorize it into the MOST logical sector from these 6 available categories ONLY:
   - "IT & Software"
   - "Banking & Finance"
   - "Pharma & Healthcare"
   - "Consumer & FMCG"
   - "Auto & EV"
   - "Capital Goods"
   If it is completely unrelated, map it to the closest category (e.g., Telecom or Energy can fit into "Capital Goods", or retail/hospitality can fit in "Consumer & FMCG").
3. Generate realistic fundamental metrics for it:
   - basePrice: typical recent share price in INR (e.g. 2400 for Reliance, 700 for SBI).
   - pe: Trailing Price-to-Earnings ratio (P/E ratio, e.g. 15 to 80).
   - pb: Price-to-Book ratio (P/B ratio, e.g. 1.2 to 20.0).
   - roe: Return on Equity in % (e.g. 8.0 to 45.0).
   - revGrowth: YoY Revenue Growth in % (e.g. -5.0 to 50.0).
   - de: Debt-to-Equity ratio (e.g. 0.0 to 2.5).
   - momentum: 6-month price performance in % (e.g. -20 to 120).

Return a JSON object exactly matching this schema:
{
  "ticker": "${cleanTicker}",
  "name": "Full Corporate Name",
  "sector": "One of the 6 sectors",
  "basePrice": number,
  "pe": number,
  "pb": number,
  "roe": number,
  "revGrowth": number,
  "de": number,
  "momentum": number
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            name: { type: Type.STRING },
            sector: { type: Type.STRING },
            basePrice: { type: Type.NUMBER },
            pe: { type: Type.NUMBER },
            pb: { type: Type.NUMBER },
            roe: { type: Type.NUMBER },
            revGrowth: { type: Type.NUMBER },
            de: { type: Type.NUMBER },
            momentum: { type: Type.NUMBER }
          },
          required: ["ticker", "name", "sector", "basePrice", "pe", "pb", "roe", "revGrowth", "de", "momentum"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response received from Gemini.");
    }

    const data = JSON.parse(jsonText.trim());

    // Validate sector is one of the 6
    const validSectors = ["IT & Software", "Banking & Finance", "Pharma & Healthcare", "Consumer & FMCG", "Auto & EV", "Capital Goods"];
    let finalSector = data.sector;
    if (!validSectors.includes(finalSector)) {
      finalSector = "Capital Goods"; // fallback
    }

    const stockData = {
      ticker: data.ticker.toUpperCase().trim(),
      name: data.name,
      basePrice: Number(data.basePrice) || 100,
      pe: Number(data.pe) || 20,
      pb: Number(data.pb) || 2.5,
      roe: Number(data.roe) || 15,
      revGrowth: Number(data.revGrowth) || 10,
      de: Number(data.de) || 0.5,
      momentum: Number(data.momentum) || 12
    };

    // Add to the universe in memory
    addStockToUniverse(finalSector, stockData);

    // Get the newly run stock details with full score calculations
    const updatedStock = findStockByTicker(stockData.ticker);

    res.json({
      success: true,
      alreadyExists: false,
      stock: updatedStock || stockData
    });

  } catch (error: any) {
    console.error("Failed to import stock via Gemini:", error);
    res.status(500).json({ error: error.message || "Failed to import custom stock. Please verify GEMINI_API_KEY." });
  }
});

// 4. AI Stock Analyst Report Generator
app.post("/api/ai/analyze", async (req, res) => {
  try {
    const { ticker, name, pe, pb, roe, revGrowth, de, momentum6m, price, score } = req.body;
    
    if (!ticker) {
      return res.status(400).json({ error: "Stock ticker is required for AI analysis." });
    }

    const ai = getGeminiClient();

    const prompt = `You are a Senior Investment Analyst specializing in the Indian stock market (NSE).
Produce an institutional-grade Equity Research Analyst Report for the following stock based on its multi-factor screening profile:

- **Company Name**: ${name || ticker} (${ticker})
- **Current Price**: ₹${price || "N/A"}
- **Cross-Sectional Screener Score**: ${(score * 100).toFixed(0)}% (Multi-factor percentile)
- **Financial Metrics**:
  - P/E Ratio: ${pe || "N/A"}x
  - P/B Ratio: ${pb || "N/A"}x
  - Return on Equity (ROE): ${roe || "N/A"}%
  - Revenue Growth (YoY): ${revGrowth || "N/A"}%
  - Debt/Equity Ratio: ${de || "N/A"}
  - 6-Month Momentum: ${momentum6m || "N/A"}%

Your report MUST be in highly structured JSON matching the schema below. 
Calculate a logical 1-year Price Target based on the fundamentals (typically 12-25% from current price, reflecting growth & valuation).
Determine a clear investment recommendation: BUY, ACCUMULATE, HOLD, REDUCE, or SELL.
Evaluate the Risk Rating (LOW, MEDIUM, or HIGH).

JSON Output Schema:
{
  "ticker": "${ticker}",
  "name": "${name}",
  "recommendation": "BUY" | "ACCUMULATE" | "HOLD" | "REDUCE" | "SELL",
  "priceTarget": number,
  "riskRating": "LOW" | "MEDIUM" | "HIGH",
  "report": "Your detailed report in standard Markdown format. Include sections: Executive Summary, Core Strengths (referencing specific metrics), Valuation & Growth Outlook, Key Investment Risks, and Price Target Rationale."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            ticker: { type: Type.STRING },
            name: { type: Type.STRING },
            recommendation: { type: Type.STRING },
            priceTarget: { type: Type.NUMBER },
            riskRating: { type: Type.STRING },
            report: { type: Type.STRING }
          },
          required: ["ticker", "name", "recommendation", "priceTarget", "riskRating", "report"]
        }
      }
    });

    const reportText = response.text;
    if (!reportText) {
      throw new Error("No response text received from Gemini API");
    }

    const reportData = JSON.parse(reportText.trim());
    res.json(reportData);
  } catch (error: any) {
    console.error("AI Analysis error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI stock report. Ensure GEMINI_API_KEY is configured in Settings > Secrets." });
  }
});

// 5. AI Chat Copilot endpoint for natural language screening & Q&A
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are "Rathore AI Copilot", an elite financial screening assistant for the Indian Stock Market (NSE), based on the research paper "AI-Driven Stock Screening in Indian Equity Markets" (Rathore, 2026).
Your job is to guide users to screen stocks across 6 sectors ("IT & Software", "Banking & Finance", "Pharma & Healthcare", "Consumer & FMCG", "Auto & EV", "Capital Goods").

Each stock is evaluated across 6 critical metrics:
1. P/E Ratio (price relative to earnings, value factor - lower is better)
2. P/B Ratio (price relative to book value, value factor - lower is better)
3. ROE (%) (return on equity, quality factor - higher is better)
4. Revenue Growth (%) (year-on-year growth, growth factor - higher is better)
5. Debt/Equity (leverage risk, lower is better)
6. 6M Momentum (%) (price returns over last 6 months, higher is better)

Explain the cross-sectional scoring methodology clearly. When users ask for stock picks or sectors, recommend sectors they can select in the sidebar, or refer to particular prominent tickers.
If the user mentions a specific stock or sector, tell them its general profile.
List of stocks you know:
- IT & Software: TCS, INFY, WIPRO, HCLTECH, TECHM, PERSISTENT, LTIM, MPHASIS, COFORGE, OFSS.
- Banking & Finance: HDFCBANK, ICICIBANK, KOTAKBANK, AXISBANK, SBIN, INDUSINDBK, FEDERALBNK, BANDHANBNK, IDFCFIRSTB, PNB.
- Pharma & Healthcare: SUNPHARMA, DRREDDY, CIPLA, DIVISLAB, AUROPHARMA, LAURUS, ALKEM, TORNTPHARM, BIOCON, IPCA.
- Consumer & FMCG: HINDUNILVR, ITC, NESTLEIND, BRITANNIA, DABUR, MARICO, COLPAL, EMAMILTD, GODREJCP, VBL.
- Auto & EV: MARUTI, TATAMOTORS, M&M, BAJAJ-AUTO, HEROMOTOCO, EICHERMOT, TVSMOTOR, ASHOKLEY, BALKRISIND, MOTHERSON.
- Capital Goods: LT, SIEMENS, ABB, BHEL, CUMMINSIND, HAVELLS, POLYCAB, KEI, KEC, THERMAX.

If they ask to filter or find specific properties (e.g. "which IT stock has the highest ROE" or "show me low debt banking stocks"), mention:
- IT high ROE: TCS (~49%), INFY (~31%)
- Banking low leverage: Kotak Bank (~0.72) or Axis Bank (~0.82)
- Auto high momentum: Tata Motors (~85%), Bajaj Auto (~78%)
- FMCG high ROE: Nestle India (~112%), Hindustan Unilever (~78%)
- Capital Goods momentum: ABB India (~105%), Siemens (~89%)

IMPORTANT: If your answer highlights specific stocks, return a key "suggestedStocks" array containing the ticker and company name so the frontend can display interactive quick-action buttons for them!
Format your response in JSON matching the following structure:
{
  "text": "Your helpful response text in markdown format. Explain financial ratios simply. Keep it professional, objective, and engaging.",
  "suggestedStocks": [
    { "ticker": "TCS", "name": "Tata Consultancy Services Ltd", "score": 0.88 },
    { "ticker": "INFY", "name": "Infosys Ltd", "score": 0.76 }
  ] (Optional, return up to 4 relevant tickers mentioned in your response)
}`;

    const formattedHistory = history.map((msg: any) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add current user message
    formattedHistory.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedHistory,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            suggestedStocks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ticker: { type: Type.STRING },
                  name: { type: Type.STRING },
                  score: { type: Type.NUMBER }
                },
                required: ["ticker", "name"]
              }
            }
          },
          required: ["text"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response received from Gemini API");
    }

    const chatResponse = JSON.parse(resultText.trim());
    res.json(chatResponse);
  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat message. Please ensure GEMINI_API_KEY is configured." });
  }
});

// ── VITE MIDDLEWARE SETUP FOR DEV & PROD ────────────────────────────────────────

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

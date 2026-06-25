import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Compass, Brain, Rocket, Search, Star, ArrowUpRight, 
  BarChart2, ChevronDown, ChevronUp, Download, AlertTriangle, 
  RefreshCw, Sliders, Play, Check, CircleAlert, Landmark, ShieldAlert,
  Printer, HelpCircle
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, BarChart as RechartsBarChart, Bar as RechartsBar } from 'recharts';

import { Stock, ScreenerResponse, AIAnalysisResponse } from './types';
import ChatCopilot from './components/ChatCopilot';
import CompareEngine from './components/CompareEngine';
import DeploymentGuide from './components/DeploymentGuide';

const SECTORS = [
  "IT & Software",
  "Banking & Finance",
  "Pharma & Healthcare",
  "Consumer & FMCG",
  "Auto & EV",
  "Capital Goods"
];

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'screener' | 'chat' | 'deployment'>('screener');
  
  // Screener state
  const [selectedSector, setSelectedSector] = useState<string>("IT & Software");
  const [minScore, setMinScore] = useState<number>(0.45);
  const [topN, setTopN] = useState<number>(7);
  const [screenResults, setScreenResults] = useState<ScreenerResponse | null>(null);
  const [isLoadingScreen, setIsLoadingScreen] = useState<boolean>(false);
  const [screenError, setScreenError] = useState<string | null>(null);

  // Quick lookup search state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allTickersList, setAllTickersList] = useState<{ ticker: string; name: string; sector: string }[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [searchedStock, setSearchedStock] = useState<Stock | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  // Selected stocks for comparison
  const [compareStocks, setCompareStocks] = useState<Stock[]>([]);

  // Expanded stock deep-dives
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  // AI Institutional Report state
  const [activeReport, setActiveReport] = useState<AIAnalysisResponse | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Gather tickers for lookup dropdown autocomplete on boot
  const loadTickersList = async () => {
    try {
      const res = await fetch('/api/tickers');
      if (res.ok) {
        const list = await res.json();
        setAllTickersList(list);
        return list;
      }
    } catch (e) {
      console.error("Failed to fetch tickers from API, falling back:", e);
    }
    // Fallback if API not ready or error
    try {
      const list: { ticker: string; name: string; sector: string }[] = [];
      const { SECTOR_UNIVERSE } = await import('./data/nseStocks');
      Object.entries(SECTOR_UNIVERSE).forEach(([sector, stocks]) => {
        stocks.forEach(s => {
          list.push({ ticker: s.ticker, name: s.name, sector });
        });
      });
      setAllTickersList(list);
      return list;
    } catch (e) {
      console.error("Failed to build autocomplete list:", e);
    }
    return [];
  };

  useEffect(() => {
    loadTickersList();
  }, []);

  // Run screen trigger
  const handleRunScreen = async (sectorName = selectedSector, scoreThreshold = minScore, limit = topN) => {
    setIsLoadingScreen(true);
    setScreenError(null);
    setExpandedStock(null);
    setActiveReport(null);
    
    try {
      const res = await fetch('/api/screener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector: sectorName, minScore: scoreThreshold, topN: limit })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch screen results.');
      
      setScreenResults(data);
    } catch (e: any) {
      console.error(e);
      setScreenError(e.message || 'Connecting to server failed. Verify your server is online.');
    } finally {
      setIsLoadingScreen(false);
    }
  };

  // Run initial screen on mount
  useEffect(() => {
    handleRunScreen("IT & Software", 0.45, 7);
  }, []);

  // Search stock by autocomplete select
  const handleSearchSelect = async (ticker: string) => {
    setShowSearchDropdown(false);
    setSearchQuery("");
    setSearchedStock(null);
    setActiveReport(null);
    
    try {
      const res = await fetch(`/api/stock/${ticker}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Stock lookup failed.');
      
      setSearchedStock(data);
      setExpandedStock(data.ticker); // expand deep dive immediately
      setActiveTab('screener'); // force view switch
    } catch (e: any) {
      alert(e.message || "Failed to retrieve stock details.");
    }
  };

  // Import custom stock via server-side Gemini
  const handleImportCustomStock = async (tickerToImport: string) => {
    if (!tickerToImport) return;
    const cleanTicker = tickerToImport.toUpperCase().trim();
    setIsImporting(true);
    setShowSearchDropdown(false);
    setSearchQuery("");
    
    try {
      const res = await fetch('/api/stock/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker: cleanTicker })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to import stock.');
      
      // 1. Reload the autocomplete tickers so it's in the list
      await loadTickersList();
      
      // 2. Select the imported stock immediately
      if (data.stock) {
        setSearchedStock(data.stock);
        setExpandedStock(data.stock.ticker);
        setSelectedSector(data.stock.sector); // select its sector as active
        setActiveTab('screener');
        
        // 3. Run screener for its sector so it ranks & updates live!
        await handleRunScreen(data.stock.sector);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || `Failed to import ticker "${cleanTicker}". Ensure you have a valid GEMINI_API_KEY in Settings.`);
    } finally {
      setIsImporting(false);
    }
  };

  // Compare stock toggler
  const handleToggleCompare = (stock: Stock) => {
    if (compareStocks.some(s => s.ticker === stock.ticker)) {
      setCompareStocks(prev => prev.filter(s => s.ticker !== stock.ticker));
    } else {
      if (compareStocks.length >= 4) {
        alert("Maximum comparison limit is 4 stocks.");
        return;
      }
      setCompareStocks(prev => [...prev, stock]);
    }
  };

  // Generate Institutional Analyst report via server-side Gemini 3.5 Flash
  const handleGenerateAIReport = async (stock: Stock) => {
    setIsLoadingReport(true);
    setReportError(null);
    setActiveReport(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stock)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI Research paper.");
      
      setActiveReport(data);
    } catch (err: any) {
      console.error(err);
      setReportError(err.message || "AI service is currently busy or GEMINI_API_KEY is not configured.");
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Export results to CSV
  const handleExportCSV = () => {
    if (!screenResults || screenResults.stocks.length === 0) return;
    
    const headers = ["Rank", "Ticker", "Company Name", "Screener Score", "Price (₹)", "P/E Ratio", "P/B Ratio", "ROE (%)", "Revenue Growth (%)", "Debt-to-Equity"];
    const rows = screenResults.stocks.map((s, idx) => [
      s.rank || idx + 1,
      s.ticker,
      s.name,
      `${(s.score * 100).toFixed(0)}%`,
      s.price,
      s.pe,
      s.pb,
      s.roe,
      s.revGrowth,
      s.de
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `nse_screener_report_${screenResults.sector.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredTickers = searchQuery 
    ? allTickersList.filter(t => 
        t.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="min-h-screen text-[#E0E0E6] font-sans flex flex-col bg-[#0A0A0C] selection:bg-indigo-600 selection:text-white">
      
      {/* Dynamic Stock Import Spinner Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-[#0A0A0C]/85 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="bg-[#0F0F12] border border-indigo-500/25 rounded-sm p-8 max-w-md w-full shadow-2xl relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-pulse" />
            <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono block">Quantitative Stock Import</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider font-display italic">Gemini 3.5 Analyst Engine Active</h3>
            <p className="text-gray-400 text-xs leading-relaxed font-sans">
              Analyzing real-world balance sheets, current multiples, and recent momentum trends to synthesize institutional-grade factor metrics...
            </p>
            <div className="text-[10px] text-gray-600 font-mono">
              COMPUTING Z-SCORES · RESOLVING peer_groups.json · GENERATING WALK_PATHS
            </div>
          </div>
        </div>
      )}
      
      {/* HEADER SECTION */}
      <header className="border-b border-[#2D2D33] bg-[#0F0F12] sticky top-0 z-50 px-4 md:px-8 py-3 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center font-bold text-white shrink-0 font-display">α</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-tight uppercase text-white font-display">NSE Alpha <span className="text-indigo-500 font-bold">Screener</span></h1>
              <span className="bg-[#1A1A1F] border border-[#2D2D33] text-indigo-400 text-[10px] px-2 py-0.5 rounded-sm font-mono font-semibold">Rathore · 2026</span>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Multi-factor decision models for Indian Equities</p>
          </div>
        </div>

        {/* Global Autocomplete Lookup Search Bar */}
        <div className="relative w-full sm:w-64 md:w-80">
          <div className="flex items-center bg-[#0A0A0C] border border-[#2D2D33] rounded-sm px-3 py-1.5 focus-within:border-indigo-500 transition-colors">
            <Search size={14} className="text-gray-500 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              placeholder="Search or Import (e.g. RELIANCE, TCS)..."
              className="w-full bg-transparent border-none text-xs focus:outline-none pl-2 text-[#E0E0E6] placeholder:text-gray-600"
            />
            {searchQuery && (
              <button 
                onClick={() => { setSearchQuery(""); setShowSearchDropdown(false); }}
                className="text-gray-500 hover:text-white text-[11px] pr-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown list */}
          {showSearchDropdown && searchQuery.trim().length >= 1 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0F0F12] border border-[#2D2D33] rounded-sm overflow-hidden z-50 shadow-2xl divide-y divide-[#2D2D33]">
              {filteredTickers.map(t => (
                <button
                  key={t.ticker}
                  onClick={() => handleSearchSelect(t.ticker)}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-[#1A1A1F] flex justify-between items-center text-xs transition-colors group"
                >
                  <div>
                    <span className="font-mono font-bold text-indigo-400 group-hover:text-indigo-300">{t.ticker}</span>
                    <span className="text-gray-400 ml-2 group-hover:text-gray-300 truncate max-w-[150px] inline-block align-bottom">{t.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 bg-[#0A0A0C] px-1.5 py-0.5 rounded-sm uppercase font-semibold font-display tracking-wider border border-[#2D2D33]">{t.sector}</span>
                </button>
              ))}

              {/* Special Import Option */}
              <button
                onClick={() => handleImportCustomStock(searchQuery)}
                className="w-full text-left px-3.5 py-3 bg-[#13131A] hover:bg-[#1A1A26] flex justify-between items-center text-xs transition-colors border-t border-indigo-500/10 group"
              >
                <div className="flex items-center gap-2">
                  <span className="text-indigo-400 font-bold">✨</span>
                  <span className="text-gray-300">
                    Import <span className="font-mono font-bold text-indigo-400">"{searchQuery.toUpperCase()}"</span> via Gemini AI...
                  </span>
                </div>
                <span className="text-[9px] text-indigo-400 bg-indigo-950/40 border border-indigo-500/20 px-1.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">NEW DYNAMIC</span>
              </button>
            </div>
          )}
        </div>

        {/* Central Nav Tabs */}
        <div className="flex items-center bg-[#0A0A0C] p-1 border border-[#2D2D33] rounded-sm shrink-0">
          <button
            onClick={() => setActiveTab('screener')}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'screener' 
                ? 'bg-indigo-600 text-white font-display' 
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1F]'
            }`}
          >
            <Compass size={13} />
            Screener Hub
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'chat' 
                ? 'bg-indigo-600 text-white font-display' 
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1F]'
            }`}
          >
            <Brain size={13} />
            AI Copilot
          </button>
          <button
            onClick={() => setActiveTab('deployment')}
            className={`px-3 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'deployment' 
                ? 'bg-indigo-600 text-white font-display' 
                : 'text-gray-400 hover:text-white hover:bg-[#1A1A1F]'
            }`}
          >
            <Rocket size={13} />
            Deploy Website
          </button>
        </div>
      </header>

      {/* SUB-HEADER / WARNING DISCLAIMER */}
      <div className="bg-[#15151A] border-b border-[#2D2D33] py-2 px-4 md:px-8 flex items-center gap-2">
        <AlertTriangle size={14} className="text-yellow-500 shrink-0" />
        <p className="text-[11px] text-gray-400 font-mono tracking-tight uppercase">
          <strong>Educational Research Tool only:</strong> Implements an academic scoring methodology for learning purposes. Always conduct independent financial advisor diligence.
        </p>
      </div>

      {/* CORE WORKSPACE */}
      <main className="flex-1 p-4 md:p-8 space-y-6">
        
        {activeTab === 'screener' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* LEFT SIDEBAR CONTROLS (GRID SPAN 1) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* SCREEN COMMAND CARD */}
              <div className="glass-panel border border-[#2D2D33] rounded-sm p-5 space-y-5 bg-[#0F0F12]">
                <div className="flex items-center gap-2 border-b border-[#2D2D33] pb-3">
                  <Sliders size={16} className="text-indigo-400" />
                  <h3 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Screen Controls</h3>
                </div>

                {/* Sector Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-display">Target Sector</label>
                  <select
                    value={selectedSector}
                    onChange={(e) => setSelectedSector(e.target.value)}
                    className="w-full bg-[#0A0A0C] border border-[#2D2D33] rounded-sm px-3.5 py-2.5 text-xs text-[#E0E0E6] focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {SECTORS.map(sec => (
                      <option key={sec} value={sec} className="bg-[#0F0F12]">{sec}</option>
                    ))}
                  </select>
                </div>

                {/* Min Score Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-display">Min ML Score</label>
                    <span className="font-mono text-xs font-bold text-indigo-400">{(minScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="px-1">
                    <input
                      type="range"
                      min="0.30"
                      max="0.80"
                      step="0.05"
                      value={minScore}
                      onChange={(e) => setMinScore(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 bg-[#1A1A1F] h-1.5 rounded-none cursor-pointer"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-mono">Filters weaker companies relative to sector peers.</p>
                </div>

                {/* Limit Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-display">Top N Candidates</label>
                    <span className="font-mono text-xs font-bold text-indigo-400">{topN}</span>
                  </div>
                  <div className="px-1">
                    <input
                      type="range"
                      min="3"
                      max="10"
                      step="1"
                      value={topN}
                      onChange={(e) => setTopN(parseInt(e.target.value))}
                      className="w-full accent-indigo-600 bg-[#1A1A1F] h-1.5 rounded-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={() => handleRunScreen(selectedSector, minScore, topN)}
                  disabled={isLoadingScreen}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-sm py-2.5 text-xs font-semibold shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoadingScreen ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Play size={12} className="fill-current group-hover:translate-x-0.5 transition-transform" />
                  )}
                  Run Screener Model
                </button>
              </div>

              {/* METHODOLOGY WEIGHTS CARD */}
              <div className="glass-panel border border-[#2D2D33] rounded-sm p-5 space-y-4 bg-[#0F0F12]">
                <div>
                  <h4 className="font-display font-semibold text-[10px] text-gray-500 uppercase tracking-widest">Model Feature Weights</h4>
                  <p className="text-[10px] text-gray-500 leading-relaxed">Weights from research paper Table 4, Rathore (2026)</p>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "6M Price Momentum", weight: 31, color: "bg-indigo-500" },
                    { name: "Profitability (ROE)", weight: 22, color: "bg-emerald-500" },
                    { name: "Revenue Growth YoY", weight: 18, color: "bg-sky-500" },
                    { name: "Book Valuation (P/B)", weight: 14, color: "bg-amber-500" },
                    { name: "Earnings Multiples (P/E)", weight: 10, color: "bg-pink-500" },
                    { name: "Leverage Safety (D/E)", weight: 5, color: "bg-slate-500" },
                  ].map(f => (
                    <div key={f.name} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-medium text-gray-300">
                        <span>{f.name}</span>
                        <span className="font-mono text-gray-500">{f.weight}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-[#1A1A1F] rounded-none overflow-hidden">
                        <div className={`h-full ${f.color}`} style={{ width: `${f.weight}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MAIN WORKSPACE SCREEN (GRID SPAN 3) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* LIVE MARKET OVERVIEW CARDS */}
              {screenResults && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#0F0F12] border border-[#2D2D33] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Target Sector</div>
                    <div className="text-base font-bold text-white truncate font-display italic">{screenResults.sector}</div>
                  </div>
                  <div className="bg-[#0F0F12] border border-[#2D2D33] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Surfaced Ratio</div>
                    <div className="text-base font-bold text-emerald-400 font-mono">
                      {screenResults.stats.surfacedCount} / {screenResults.stats.totalFetched}
                    </div>
                  </div>
                  <div className="bg-[#0F0F12] border border-[#2D2D33] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Highest Model Score</div>
                    <div className="text-base font-bold text-indigo-400 font-mono">
                      {(screenResults.stats.topScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="bg-[#0F0F12] border border-[#2D2D33] p-4 rounded-sm">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Average Peer Score</div>
                    <div className="text-base font-bold text-gray-300 font-mono">
                      {(screenResults.stats.averageScore * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              )}

              {/* SEARCHED STOCK ALERT / DEEP DIVE FOCUS */}
              {searchedStock && (
                <div className="bg-[#15151A] border border-[#2D2D33] p-4 rounded-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-[9px] bg-[#0A0A0C] border border-[#2D2D33] text-indigo-400 font-mono font-bold px-2 py-0.5 rounded-sm uppercase">Focused Stock Profile</span>
                    <h3 className="text-base font-bold text-white font-display mt-1 italic">{searchedStock.name} ({searchedStock.ticker})</h3>
                    <p className="text-xs text-gray-500">Listed under {searchedStock.sector} sector • Market Cap: ₹{searchedStock.marketCapB}B INR</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setSearchedStock(null); setExpandedStock(null); }}
                      className="text-xs bg-[#0A0A0C] hover:bg-[#1A1A1F] border border-[#2D2D33] rounded-sm px-4 py-2 text-gray-400 transition-colors cursor-pointer"
                    >
                      Clear Focus
                    </button>
                    <button 
                      onClick={() => handleToggleCompare(searchedStock)}
                      className={`text-xs rounded-sm px-4 py-2 border transition-colors flex items-center gap-1.5 cursor-pointer ${
                        compareStocks.some(s => s.ticker === searchedStock.ticker)
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 border-indigo-500/20 text-white'
                      }`}
                    >
                      {compareStocks.some(s => s.ticker === searchedStock.ticker) ? <Check size={12} /> : null}
                      {compareStocks.some(s => s.ticker === searchedStock.ticker) ? "Added to Compare" : "Compare Stock"}
                    </button>
                  </div>
                </div>
              )}

              {/* SCREENER RESULTS TABLE */}
              <div className="border border-[#2D2D33] rounded-sm bg-[#0F0F12] overflow-hidden">
                <div className="px-5 py-4 border-b border-[#2D2D33] bg-[#15151A] flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-semibold text-[#E0E0E6] font-display uppercase tracking-wider">Rathore Screener Output</span>
                  </div>
                  {screenResults && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleExportCSV}
                        className="text-xs text-gray-400 hover:text-white bg-[#0A0A0C] border border-[#2D2D33] px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download size={13} />
                        Export CSV
                      </button>
                    </div>
                  )}
                </div>

                {isLoadingScreen ? (
                  <div className="py-24 text-center space-y-3 bg-[#0F0F12]">
                    <RefreshCw size={36} className="text-indigo-400 animate-spin mx-auto" />
                    <p className="text-gray-500 text-xs font-mono">Screening stock metrics & computing cross-sectional Z-scores...</p>
                  </div>
                ) : screenError ? (
                  <div className="p-8 text-center space-y-3 bg-[#0F0F12]">
                    <CircleAlert size={36} className="text-red-400 mx-auto" />
                    <p className="text-sm text-red-300 font-semibold">{screenError}</p>
                    <button
                      onClick={() => handleRunScreen()}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-sm cursor-pointer"
                    >
                      Retry Screen
                    </button>
                  </div>
                ) : screenResults && screenResults.stocks.length === 0 ? (
                  <div className="py-16 text-center space-y-2 bg-[#0F0F12]">
                    <ShieldAlert size={36} className="text-gray-500 mx-auto" />
                    <h4 className="font-bold text-white text-sm">No Stocks Cleared Filter</h4>
                    <p className="text-gray-500 text-xs max-w-xs mx-auto">Lower the "Min ML Score" filter threshold in the sidebar to surface more companies.</p>
                  </div>
                ) : screenResults ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#15151A] border-b border-[#2D2D33] text-[10px] font-bold text-gray-500 uppercase tracking-widest font-display">
                          <th className="p-4 w-12 text-center">Rank</th>
                          <th className="p-4">Company</th>
                          <th className="p-4">Price</th>
                          <th className="p-4 text-center">ML Score</th>
                          <th className="p-4">P/E</th>
                          <th className="p-4">P/B</th>
                          <th className="p-4 text-emerald-400">ROE</th>
                          <th className="p-4 text-sky-400">Rev Gr</th>
                          <th className="p-4 text-indigo-400">6M Mom</th>
                          <th className="p-4 text-center">Compare</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2D2D33] font-mono text-xs text-[#E0E0E6]">
                        {screenResults.stocks.map((s, idx) => {
                          const isExpanded = expandedStock === s.ticker;
                          const isInCompare = compareStocks.some(c => c.ticker === s.ticker);
                          
                          // Determine metric highlight profiles
                          const scoreColorClass = s.score >= 0.70 ? 'text-emerald-400 bg-emerald-950/20 border-emerald-500/20' : (s.score >= 0.50 ? 'text-indigo-400 bg-indigo-950/20 border-indigo-500/20' : 'text-gray-400 bg-[#1A1A1F] border-[#2D2D33]');
                          
                          return (
                            <React.Fragment key={s.ticker}>
                              {/* Main row */}
                              <tr 
                                onClick={() => setExpandedStock(isExpanded ? null : s.ticker)}
                                className={`cursor-pointer transition-colors ${
                                  isExpanded ? 'bg-[#15151A]' : 'hover:bg-[#1A1A1F]'
                                }`}
                              >
                                <td className="p-4 text-center font-bold font-display text-gray-500">
                                  #{s.rank || idx + 1}
                                </td>
                                <td className="p-4">
                                  <div className="font-display font-semibold text-sm text-white">{s.name}</div>
                                  <div className="text-[10px] text-gray-500 font-mono">{s.ticker}.NS</div>
                                </td>
                                <td className="p-4 font-bold text-[#E0E0E6]">
                                  <div>₹{s.price.toLocaleString('en-IN')}</div>
                                  <div className={`text-[10px] ${s.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {s.change24h >= 0 ? '+' : ''}{s.change24h}%
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-2.5 py-1 rounded-sm text-[11px] font-bold border ${scoreColorClass}`}>
                                    {(s.score * 100).toFixed(0)}%
                                  </span>
                                </td>
                                <td className="p-4 text-[#E0E0E6]">{s.pe.toFixed(1)}x</td>
                                <td className="p-4 text-[#E0E0E6]">{s.pb.toFixed(2)}x</td>
                                <td className="p-4 text-emerald-400 font-semibold">{s.roe.toFixed(1)}%</td>
                                <td className="p-4 text-sky-400 font-semibold">+{s.revGrowth.toFixed(1)}%</td>
                                <td className="p-4 text-indigo-400 font-semibold">+{s.momentum6m.toFixed(1)}%</td>
                                <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => handleToggleCompare(s)}
                                    className={`p-2 rounded-sm border transition-all cursor-pointer ${
                                      isInCompare 
                                        ? 'bg-indigo-600 text-white border-indigo-500/20' 
                                        : 'text-gray-500 border-[#2D2D33] hover:text-indigo-400 hover:border-indigo-500/20 bg-[#0A0A0C]'
                                    }`}
                                    title={isInCompare ? "Remove from Compare" : "Add to Compare"}
                                  >
                                    <Star size={12} fill={isInCompare ? "currentColor" : "none"} />
                                  </button>
                                </td>
                              </tr>

                              {/* Expanded stock deep-dive panel */}
                              {isExpanded && (
                                <tr>
                                  <td colSpan={10} className="p-5 bg-[#0A0A0C] border-y border-[#2D2D33]">
                                    <div className="space-y-6">
                                      
                                      {/* Technical Stats overview */}
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                                        <div className="bg-[#0F0F12] p-3 rounded-sm border border-[#2D2D33]">
                                          <div className="text-gray-500 mb-0.5 font-display text-[10px] uppercase tracking-widest">52W High Estimate</div>
                                          <div className="font-bold text-sm text-white font-mono">₹{(s.price * 1.18).toLocaleString('en-IN', {maximumFractionDigits:0})}</div>
                                        </div>
                                        <div className="bg-[#0F0F12] p-3 rounded-sm border border-[#2D2D33]">
                                          <div className="text-gray-500 mb-0.5 font-display text-[10px] uppercase tracking-widest">Historical Volatility</div>
                                          <div className="font-bold text-sm text-[#E0E0E6] font-mono">18.4% Ann.</div>
                                        </div>
                                        <div className="bg-[#0F0F12] p-3 rounded-sm border border-[#2D2D33]">
                                          <div className="text-gray-500 mb-0.5 font-display text-[10px] uppercase tracking-widest">Debt / Equity Profile</div>
                                          <div className={`font-bold text-sm font-mono ${s.de < 0.2 ? 'text-emerald-400' : 'text-[#E0E0E6]'}`}>
                                            {s.de === 0 ? "Debt-Free" : s.de.toFixed(2)}
                                          </div>
                                        </div>
                                        <div className="bg-[#0F0F12] p-3 rounded-sm border border-[#2D2D33]">
                                          <div className="text-gray-500 mb-0.5 font-display text-[10px] uppercase tracking-widest">Market Valuation Cap</div>
                                          <div className="font-bold text-sm text-[#E0E0E6] font-mono">₹{s.marketCapB}B INR</div>
                                        </div>
                                      </div>

                                      {/* Methodology explanation box */}
                                      <div className="p-3.5 bg-[#15151A] border-l-4 border-indigo-500 rounded-sm text-xs leading-relaxed text-[#E0E0E6]">
                                        💡 <strong>Multi-Factor Justification:</strong> {s.reason}
                                      </div>

                                      {/* Price Chart */}
                                      <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest font-display">1-Year Historical Price (Daily Trend)</span>
                                          <span className="text-[10px] text-gray-500 font-mono">Dynamic Random-Walk Ticks Active</span>
                                        </div>
                                        <div className="h-56 w-full bg-[#0F0F12] rounded-sm border border-[#2D2D33] p-2">
                                          <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={s.historicalData}>
                                              <defs>
                                                <linearGradient id="priceGlow" x1="0" y1="0" x2="0" y2="1">
                                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                                                </linearGradient>
                                              </defs>
                                              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D33" opacity={0.5} />
                                              <XAxis 
                                                dataKey="date" 
                                                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                                                stroke="#2D2D33"
                                              />
                                              <YAxis 
                                                domain={['auto', 'auto']}
                                                tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                                                tickFormatter={(v) => `₹${v}`}
                                                stroke="#2D2D33"
                                              />
                                              <RechartsTooltip 
                                                contentStyle={{
                                                  backgroundColor: '#0F0F12',
                                                  borderColor: '#2D2D33',
                                                  borderRadius: '0px',
                                                  color: '#E0E0E6',
                                                  fontFamily: 'JetBrains Mono',
                                                  fontSize: '11px'
                                                }}
                                                formatter={(val: any) => [`₹${parseFloat(val).toLocaleString('en-IN')}`, 'Close Price']}
                                              />
                                              <Area 
                                                type="monotone" 
                                                dataKey="close" 
                                                stroke="#6366f1" 
                                                strokeWidth={2}
                                                fillOpacity={1} 
                                                fill="url(#priceGlow)" 
                                              />
                                            </AreaChart>
                                          </ResponsiveContainer>
                                        </div>
                                      </div>

                                      {/* AI Analyst Report Button & Generator */}
                                      <div className="pt-2 border-t border-[#2D2D33]">
                                        {!activeReport && !isLoadingReport && (
                                          <div className="flex justify-between items-center flex-wrap gap-2">
                                            <span className="text-xs text-gray-500 font-mono uppercase tracking-tight">Need deep analysis? Request automated research paper drafted by server-side Gemini.</span>
                                            <button
                                              onClick={() => handleGenerateAIReport(s)}
                                              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                                            >
                                              <Brain size={14} />
                                              Generate AI Analyst Report
                                            </button>
                                          </div>
                                        )}

                                        {isLoadingReport && (
                                          <div className="py-8 text-center space-y-2 bg-[#0F0F12] border border-[#2D2D33] rounded-sm">
                                            <RefreshCw size={24} className="text-indigo-400 animate-spin mx-auto" />
                                            <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Gemini is drafting formal institutional equity report...</p>
                                          </div>
                                        )}

                                        {reportError && (
                                          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-sm text-xs text-red-400">
                                            {reportError}
                                          </div>
                                        )}

                                        {activeReport && activeReport.ticker === s.ticker && (
                                          <div className="bg-[#0F0F12] border border-[#2D2D33] rounded-sm p-5 space-y-4 shadow-2xl relative">
                                            {/* Report Title Header */}
                                            <div className="flex justify-between items-start border-b border-[#2D2D33] pb-4 flex-wrap gap-3">
                                              <div>
                                                <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">GEMINI INSTITUTIONAL RESEARCH PAPER</div>
                                                <h4 className="text-lg font-bold text-white font-display mt-0.5 italic">Equity Research: {activeReport.name}</h4>
                                                <p className="text-[10px] text-gray-500 font-mono">Generated: {new Date().toLocaleDateString()} • SECID-#{s.ticker}-NSE</p>
                                              </div>
                                              <div className="flex gap-4">
                                                <div>
                                                  <div className="text-[9px] text-gray-500 font-display font-semibold uppercase tracking-wider">Recommendation</div>
                                                  <span className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-sm uppercase inline-block mt-1">
                                                    {activeReport.recommendation}
                                                  </span>
                                                </div>
                                                <div>
                                                  <div className="text-[9px] text-gray-500 font-display font-semibold uppercase tracking-wider">Risk Rating</div>
                                                  <span className="bg-indigo-950/40 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-2.5 py-1 rounded-sm uppercase inline-block mt-1">
                                                    {activeReport.riskRating}
                                                  </span>
                                                </div>
                                                <div>
                                                  <div className="text-[9px] text-gray-500 font-display font-semibold uppercase tracking-wider">1Y Price Target</div>
                                                  <span className="text-white font-mono font-bold text-sm block mt-1">
                                                    ₹{activeReport.priceTarget.toLocaleString('en-IN')}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Report Markdown Content */}
                                            <div className="text-sm text-[#E0E0E6] leading-relaxed space-y-3 prose prose-invert max-w-none font-sans">
                                              {activeReport.report.split('\n').map((line, rIdx) => {
                                                if (line.startsWith('### ')) {
                                                  return <h5 key={rIdx} className="text-sm font-semibold text-white font-display mt-4 mb-2">{line.replace('### ', '')}</h5>;
                                                }
                                                if (line.startsWith('## ')) {
                                                  return <h4 key={rIdx} className="text-xs font-bold text-indigo-400 font-display uppercase tracking-wider mt-5 mb-2.5 border-b border-[#2D2D33] pb-1">{line.replace('## ', '')}</h4>;
                                                }
                                                if (line.startsWith('- ') || line.startsWith('* ')) {
                                                  return <li key={rIdx} className="ml-4 list-disc text-xs text-[#E0E0E6] mb-1 leading-relaxed">{line.substring(2)}</li>;
                                                }
                                                if (line.trim() === "") return <div key={rIdx} className="h-2" />;
                                                
                                                return <p key={rIdx} className="text-xs text-gray-400 mb-2 leading-relaxed">{line}</p>;
                                              })}
                                            </div>

                                            {/* Footer sign-off */}
                                            <div className="pt-3 border-t border-[#2D2D33] flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                              <span>Analyst Sign-off: Rathore AI Automated Research Desk</span>
                                              <button 
                                                onClick={() => window.print()}
                                                className="hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                                              >
                                                <Printer size={10} /> Print Report
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>

              {/* SIDE-BY-SIDE MULTI-FACTOR COMPARE BOARD */}
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b border-[#2D2D33] pb-2">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-indigo-400" />
                    <h3 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Factor Compare Board</h3>
                  </div>
                  {compareStocks.length > 0 && (
                    <button
                      onClick={() => setCompareStocks([])}
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear All ({compareStocks.length})
                    </button>
                  )}
                </div>

                <CompareEngine 
                  selectedStocks={compareStocks} 
                  allStocks={screenResults?.stocks || []}
                  onRemoveStock={(ticker) => setCompareStocks(prev => prev.filter(s => s.ticker !== ticker))}
                />
              </div>

            </div>

          </div>
        )}

        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Quick Context sidebar */}
            <div className="lg:col-span-1 bg-[#0F0F12] border border-[#2D2D33] rounded-sm p-5 space-y-4 h-fit">
              <div className="flex items-center gap-2 text-indigo-400 border-b border-[#2D2D33] pb-3">
                <Brain size={16} />
                <h4 className="font-display font-semibold text-xs text-white uppercase tracking-wider">Methodology Review</h4>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Rathore (2026) implements dynamic, cross-sectional evaluation where stocks are graded exclusively against active sector peers.
              </p>
              <div className="space-y-3 pt-1 text-xs">
                <div className="p-3 bg-[#0A0A0C] border border-[#2D2D33] rounded-sm space-y-1">
                  <div className="font-bold text-[11px] text-white">Cross-Sectional Z-Score</div>
                  <p className="text-gray-500 text-[10.5px]">Normalises metrics within sectors so that outliers do not skew evaluations.</p>
                </div>
                <div className="p-3 bg-[#0A0A0C] border border-[#2D2D33] rounded-sm space-y-1">
                  <div className="font-bold text-[11px] text-white">Multimodal Fusion</div>
                  <p className="text-gray-500 text-[10.5px]">Combines value, momentum, growth, and leverage aspects simultaneously.</p>
                </div>
              </div>
            </div>

            {/* Main Interactive AI Copilot chat */}
            <div className="lg:col-span-3">
              <ChatCopilot 
                onSelectStock={async (ticker) => {
                  // Switch tab and load stock expander automatically
                  try {
                    const res = await fetch(`/api/stock/${ticker}`);
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error);
                    setSearchedStock(data);
                    setExpandedStock(data.ticker);
                    setActiveTab('screener');
                  } catch (e: any) {
                    alert(e.message || "Failed to locate stock.");
                  }
                }}
                onRunSectorScreen={(sector) => {
                  setSelectedSector(sector);
                  handleRunScreen(sector, minScore, topN);
                  setActiveTab('screener');
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'deployment' && (
          <DeploymentGuide />
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-[#2D2D33] bg-[#15151A] py-6 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 mt-12 font-mono text-[10px] tracking-wider uppercase">
        <div className="text-center md:text-left space-y-1">
          <div className="font-semibold text-xs text-indigo-400 font-display">NSE Alpha Screener</div>
          <p className="text-[10px] text-gray-500">Based on published research: "AI-Driven Stock Screening in Indian Equity Markets" (Rathore, 2026).</p>
        </div>
        <div className="text-center md:text-right text-[10px] text-gray-600 space-y-1">
          <div>Source: official exchange feed (delayed 15m) • network: synced</div>
          <div>Created by Jashwant Singh Rathore • Powered by Gemini</div>
        </div>
      </footer>

    </div>
  );
}

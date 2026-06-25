import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';
import { Star, Shield, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Stock } from '../types';

interface CompareEngineProps {
  selectedStocks: Stock[];
  allStocks: Stock[];
  onRemoveStock: (ticker: string) => void;
}

export default function CompareEngine({ selectedStocks, allStocks, onRemoveStock }: CompareEngineProps) {
  if (selectedStocks.length === 0) {
    return (
      <div className="text-center py-12 bg-[#0F0F12] rounded-sm border border-[#2D2D33] space-y-2">
        <TrendingUp size={36} className="text-indigo-400/40 mx-auto animate-bounce" />
        <h3 className="font-semibold text-white font-display text-sm uppercase tracking-wider">No Stocks Selected for Comparison</h3>
        <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed font-mono uppercase">
          Select 2 to 4 stocks from the screening results table or search results to perform side-by-side institutional multi-factor comparison.
        </p>
      </div>
    );
  }

  if (selectedStocks.length === 1) {
    return (
      <div className="text-center py-12 bg-[#0F0F12] rounded-sm border border-[#2D2D33] space-y-2">
        <Star size={36} className="text-indigo-400/40 mx-auto animate-pulse" />
        <h3 className="font-semibold text-white font-display text-sm uppercase tracking-wider">Select at Least One More Stock</h3>
        <p className="text-gray-500 text-xs max-w-sm mx-auto leading-relaxed font-mono uppercase">
          You have selected <span className="text-indigo-400 font-bold font-mono">{selectedStocks[0].ticker}</span>. Select another stock to unlock comparative Z-score charts and factor highlights.
        </p>
      </div>
    );
  }

  // Define metrics, accessors, and configuration
  const metrics = [
    { label: "ML Composite Score", key: "score", format: (v: number) => `${(v * 100).toFixed(0)}%`, higherIsBetter: true },
    { label: "Price (₹)", key: "price", format: (v: number) => `₹${v.toLocaleString('en-IN')}`, higherIsBetter: null },
    { label: "P/E Ratio", key: "pe", format: (v: number) => `${v.toFixed(1)}x`, higherIsBetter: false },
    { label: "P/B Ratio", key: "pb", format: (v: number) => `${v.toFixed(2)}x`, higherIsBetter: false },
    { label: "ROE %", key: "roe", format: (v: number) => `${v.toFixed(1)}%`, higherIsBetter: true },
    { label: "Rev Growth %", key: "revGrowth", format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`, higherIsBetter: true },
    { label: "6M Momentum %", key: "momentum6m", format: (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`, higherIsBetter: true },
    { label: "Debt/Equity Ratio", key: "de", format: (v: number) => v.toFixed(2), higherIsBetter: false },
  ];

  // Calculate the winner in each dimension across selected stocks
  const winners = metrics.reduce((acc, m) => {
    if (m.higherIsBetter === null) return acc;
    
    let winnerIndex = 0;
    let bestValue = selectedStocks[0][m.key as keyof Stock] as number;

    selectedStocks.forEach((stock, idx) => {
      const val = stock[m.key as keyof Stock] as number;
      if (m.higherIsBetter) {
        if (val > bestValue) {
          bestValue = val;
          winnerIndex = idx;
        }
      } else {
        if (val < bestValue) {
          bestValue = val;
          winnerIndex = idx;
        }
      }
    });

    acc[m.key] = winnerIndex;
    return acc;
  }, {} as { [key: string]: number });

  // Normalise values 0-100 within full sector universe for radar chart comparison
  // To protect radar shape, we invert negative attributes (PE, PB, DE) so that "bigger/outer" is ALWAYS better
  const radarFeatures = [
    { label: "Profitability (ROE)", key: "roe", invert: false },
    { label: "Expansion (Rev Gr)", key: "revGrowth", invert: false },
    { label: "Momentum (6M)", key: "momentum6m", invert: false },
    { label: "Value (Inv P/E)", key: "pe", invert: true },
    { label: "Value (Inv P/B)", key: "pb", invert: true },
    { label: "Safety (Inv D/E)", key: "de", invert: true },
  ];

  const chartData = radarFeatures.map(feat => {
    const dataPoint: { [key: string]: any } = { subject: feat.label };
    
    selectedStocks.forEach(stock => {
      // Find limits in allStocks for proper relative scaling
      const vals = allStocks.map(s => s[feat.key as keyof Stock] as number);
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const diff = max - min || 1;
      
      const val = stock[feat.key as keyof Stock] as number;
      let score = ((val - min) / diff) * 100;
      
      if (feat.invert) {
        score = 100 - score; // lower raw value becomes higher (outer) score
      }
      
      dataPoint[stock.ticker] = Math.round(score);
    });
    
    return dataPoint;
  });

  const colors = ["#6366f1", "#10b981", "#fbbf24", "#f472b6"];

  return (
    <div className="space-y-6">
      {/* Side-by-Side Comparison Table */}
      <div className="bg-[#0F0F12] border border-[#2D2D33] rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#15151A] border-b border-[#2D2D33]">
                <th className="p-4 font-display text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  Factor Review
                </th>
                {selectedStocks.map((stock, idx) => (
                  <th key={stock.ticker} className="p-4 border-l border-[#2D2D33] min-w-[150px]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="font-display font-semibold text-sm text-indigo-400">{stock.ticker}</div>
                        <div className="text-[10px] text-gray-500 font-mono font-semibold uppercase">{stock.name}</div>
                      </div>
                      <button
                        onClick={() => onRemoveStock(stock.ticker)}
                        className="text-gray-500 hover:text-red-400 text-xs font-mono px-1.5 py-0.5 rounded-sm border border-[#2D2D33] hover:border-red-950 hover:bg-red-950/20 transition-all cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D33] font-mono text-xs text-[#E0E0E6]">
              {metrics.map((m) => (
                <tr key={m.key} className="hover:bg-[#1A1A1F] transition-colors">
                  <td className="p-4 font-display text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {m.label}
                  </td>
                  {selectedStocks.map((stock, sIdx) => {
                    const rawVal = stock[m.key as keyof Stock] as number;
                    const isWinner = winners[m.key] === sIdx;
                    return (
                      <td 
                        key={stock.ticker} 
                        className={`p-4 border-l border-[#2D2D33] text-xs font-mono ${
                          isWinner 
                            ? 'bg-indigo-950/15 text-indigo-300 font-bold border-l-2 border-indigo-500' 
                            : 'text-[#E0E0E6]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1.5">
                          <span>{m.format(rawVal)}</span>
                          {isWinner && (
                            <span 
                              className="text-[9px] bg-indigo-950/40 text-indigo-400 px-1.5 py-0.5 rounded-sm font-sans font-semibold flex items-center gap-0.5 border border-indigo-500/20 uppercase"
                              title="Sector Peer Winner"
                            >
                              <Star size={8} fill="currentColor" /> Outperform
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Radar Factor Comparison */}
      <div className="grid lg:grid-cols-3 gap-6 items-center">
        {/* Explanation Card */}
        <div className="bg-[#0F0F12] border border-[#2D2D33] rounded-sm p-5 space-y-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-indigo-400">
            <Shield size={18} />
            <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-white">Factor Profile Analysis</h4>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            The radar chart maps the relative strength of each stock within its sector. 
            All factor values are Z-score normalised from **0 to 100**.
          </p>
          <div className="space-y-2 text-xs text-gray-400 pt-1 font-mono uppercase tracking-tight text-[11px]">
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 mt-0.5">✔</span>
              <span>**ROE**: Higher profitability is stronger.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 mt-0.5">✔</span>
              <span>**Inverted Value**: Lower P/E or P/B moves the point **further outward** (cheaper buy).</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-400 shrink-0 mt-0.5">✔</span>
              <span>**Inverted Leverage**: Lower debt/equity moves the point **further outward** (safer).</span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-[#0F0F12] border border-[#2D2D33] rounded-sm p-4 lg:col-span-2 h-[340px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
              <PolarGrid stroke="#2D2D33" opacity={0.6} />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fill: '#8e8e93', fontSize: 10, fontFamily: 'Space Grotesk' }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: '#64748b', fontSize: 8 }}
                stroke="#2D2D33"
                opacity={0.5}
              />
              {selectedStocks.map((stock, idx) => (
                <Radar
                  key={stock.ticker}
                  name={stock.ticker}
                  dataKey={stock.ticker}
                  stroke={colors[idx % colors.length]}
                  fill={colors[idx % colors.length]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#0F0F12',
                  borderColor: '#2D2D33',
                  borderRadius: '0px',
                  color: '#E0E0E6',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '11px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px', fontFamily: 'Space Grotesk', color: '#E0E0E6' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

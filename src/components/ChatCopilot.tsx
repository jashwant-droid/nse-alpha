import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Brain, Loader2, RefreshCw, CornerDownLeft, Terminal } from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatCopilotProps {
  onSelectStock: (ticker: string) => void;
  onRunSectorScreen: (sector: string) => void;
}

const QUICK_PROMPTS = [
  { text: "Find high ROE tech stocks", category: "Quality" },
  { text: "Which Banking stock looks best?", category: "Screener" },
  { text: "Explain Rathore's weighted signals", category: "Methodology" },
  { text: "Show Auto stocks with strong momentum", category: "Momentum" }
];

export default function ChatCopilot({ onSelectStock, onRunSectorScreen }: ChatCopilotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "👋 Welcome to **Rathore AI Copilot**!\n\nI am your institutional-grade financial analyst assistant trained on the Z-score cross-sectional scoring models of **Rathore (2026)**.\n\nAsk me anything! For example:\n* *'Which companies in Capital Goods show high 6M Momentum?'*\n* *'Why are Return on Equity (ROE) and top-line growth weighted so highly?'*\n* *'Tell me about the valuation metrics of TCS vs INFY.'*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    setError(null);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Package conversation history for contextual memory
      const historyPayload = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6) // Send last 6 messages for context
        .map(m => ({
          sender: m.sender,
          text: m.text
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history: historyPayload })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedStocks: data.suggestedStocks
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to the AI agent. Make sure GEMINI_API_KEY is configured in Settings > Secrets.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "🧹 Chat cleared. Let's begin a new institutional market review! Ask me to evaluate sectors or explain stock metrics.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setError(null);
  };

  // Safe markdown bullet renderer
  const renderMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let content = line;
      let isBullet = false;
      
      // Basic markdown bold/italic translation
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
      content = content.replace(/`(.*?)`/g, '<code class="px-1.5 py-0.5 rounded-sm bg-[#0A0A0C] border border-[#2D2D33] font-mono text-[11px] text-indigo-400">$1</code>');

      if (line.trim().startsWith('* ')) {
        isBullet = true;
        content = content.trim().substring(2);
      } else if (line.trim().startsWith('- ')) {
        isBullet = true;
        content = content.trim().substring(2);
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-gray-300 mb-1 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
        );
      }

      // Check for empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      // Check for heading
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-xs font-semibold text-white mt-3 mb-1.5 font-display uppercase tracking-wider" dangerouslySetInnerHTML={{ __html: line.substring(4) }} />;
      }

      return (
        <p key={idx} className="text-xs text-gray-300 mb-2 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  return (
    <div className="flex flex-col h-[600px] border border-[#2D2D33] rounded-sm bg-[#0F0F12] relative overflow-hidden">
      {/* Panel Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-[#2D2D33] bg-[#15151A]">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-400 font-display uppercase tracking-wider">Rathore Copilot</span>
          <span className="bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-sm font-mono uppercase font-semibold">Active</span>
        </div>
        <button 
          onClick={clearChat}
          className="text-gray-500 hover:text-indigo-400 p-1 rounded-sm hover:bg-[#1A1A1F] transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Messages Drawer */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div key={m.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-sm px-4 py-3 ${
                isUser 
                  ? 'bg-indigo-600/90 text-white shadow-md' 
                  : 'bg-[#0A0A0C] border border-[#2D2D33] text-gray-300'
              }`}>
                {/* Body */}
                <div className="space-y-1">
                  {renderMessageText(m.text)}
                </div>

                {/* Quick actions for suggested stocks */}
                {!isUser && m.suggestedStocks && m.suggestedStocks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2D2D33] flex flex-wrap gap-2 items-center">
                    <span className="text-[10px] text-gray-500 font-bold font-display uppercase tracking-wider mr-1">Direct Screen:</span>
                    {m.suggestedStocks.map((stock) => (
                      <button
                        key={stock.ticker}
                        onClick={() => onSelectStock(stock.ticker)}
                        className="bg-[#15151A] hover:bg-indigo-950/40 border border-[#2D2D33] text-indigo-300 text-[10px] font-mono px-2 py-1 rounded-sm font-semibold transition-all hover:scale-105 active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <Terminal size={10} />
                        {stock.ticker}
                      </button>
                    ))}
                  </div>
                )}

                {/* Footer Timestamp */}
                <div className={`text-[9px] font-mono mt-1.5 text-right uppercase ${isUser ? 'text-indigo-200' : 'text-gray-600'}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#0A0A0C] border border-[#2D2D33] rounded-sm px-4 py-3 flex items-center gap-3">
              <Loader2 size={16} className="text-indigo-400 animate-spin" />
              <span className="text-xs text-gray-500 font-mono uppercase tracking-widest">Copilot is analyzing market ratios...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-sm text-xs text-red-400 leading-relaxed">
            {error}
            <div className="mt-1 text-gray-500">
              💡 Please verify your <code className="font-mono bg-[#0A0A0C] px-1 py-0.5 rounded-sm text-[11px] text-pink-400">GEMINI_API_KEY</code> is correctly set up in the **Secrets** menu.
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick suggestions panel (Only visible when chat is short) */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 py-2 bg-[#15151A] border-t border-[#2D2D33]">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 font-display">
            <Sparkles size={11} className="text-yellow-500 animate-bounce" />
            Quick Market Queries
          </div>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.text)}
                className="text-left bg-[#0A0A0C] hover:bg-[#15151A] border border-[#2D2D33] p-2 rounded-sm transition-all text-xs group cursor-pointer"
              >
                <div className="text-[9px] text-indigo-400 font-mono font-bold uppercase mb-0.5 tracking-wider">{p.category}</div>
                <div className="text-gray-300 group-hover:text-white truncate font-medium font-sans">{p.text}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="p-3 border-t border-[#2D2D33] bg-[#15151A] flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Analyst for custom screening..."
          className="flex-1 bg-[#0A0A0C] border border-[#2D2D33] rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-gray-600 font-sans"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-sm disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
          disabled={!input.trim() || isLoading}
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}

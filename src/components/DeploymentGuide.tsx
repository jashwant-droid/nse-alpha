import React from 'react';
import { Rocket, Server, Globe, Shield, CheckCircle2 } from 'lucide-react';

export default function DeploymentGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      {/* Hero Header */}
      <div className="bg-white border border-gray-200 rounded-sm p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Rocket size={120} className="text-indigo-600 animate-pulse" />
        </div>
        <div className="relative z-10 space-y-2">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">SOP & Production Readiness</span>
          <h2 className="text-xl md:text-2xl font-bold text-gray-950 font-display uppercase tracking-wider italic">Host & Secure Your Free Domain</h2>
          <p className="text-gray-600 text-xs max-w-2xl leading-relaxed">
            Congratulations! Your full-stack NSE AI Screener is fully optimized and structured for immediate deployment. 
            Follow this developer checklist to publish it online for free with a secure custom SSL connection.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Hosting Platforms */}
        <div className="bg-white rounded-sm p-5 border border-gray-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600">
            <Server size={18} />
            <h3 className="font-semibold text-gray-950 font-display text-xs uppercase tracking-wider">1. Free Full-Stack Hosting</h3>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-tight">
            Since this app uses a Node.js Express backend and Vite frontend, you need a full-stack container/web service hosting platform. Here are the best 100% free options:
          </p>

          <div className="space-y-3 pt-2">
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs text-gray-950">Render.com (Recommended)</span>
                <span className="bg-indigo-50 border border-indigo-200 text-indigo-700 text-[9px] px-2 py-0.5 rounded-sm font-mono uppercase font-bold">Free Tier</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Deploy directly from your GitHub repository. Detects <code className="text-[11px] font-mono text-pink-600">package.json</code>, builds your project, and deploys it on a free subdomain (<code className="text-[11px] font-mono">*.onrender.com</code>).
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs text-gray-950">Koyeb.com</span>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] px-2 py-0.5 rounded-sm font-mono uppercase font-bold">Free Tier</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Super fast, global container runner. Offers microvms with auto-healing and instant continuous deployment via GitHub. Includes free <code className="text-[11px] font-mono">*.koyeb.app</code> SSL subdomains.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-xs text-gray-950">Railway.app</span>
                <span className="bg-purple-50 border border-purple-200 text-purple-700 text-[9px] px-2 py-0.5 rounded-sm font-mono uppercase font-bold">Trial Credits</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Offers $5/month of free execution. Perfect database-and-app co-location, with zero setup and a beautiful canvas design.
              </p>
            </div>
          </div>
        </div>

        {/* Free Custom Domains */}
        <div className="bg-white rounded-sm p-5 border border-gray-200 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <Globe size={18} />
            <h3 className="font-semibold text-gray-950 font-display text-xs uppercase tracking-wider">2. How to Get a Free Domain</h3>
          </div>
          <p className="text-xs text-gray-500 font-mono uppercase tracking-tight">
            You don't need to spend money to get a clean custom web address. Use these methods to secure your domain for free:
          </p>

          <div className="space-y-3 pt-2">
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm space-y-1">
              <span className="font-semibold text-xs text-gray-950">GitHub Student Developer Pack</span>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                If you are a student, apply to Github Student Pack. You get **1 Year of Free Custom Domain names** including <code className="text-pink-600 font-mono text-[11px]">.me</code> via Namecheap, <code className="text-pink-600 font-mono text-[11px]">.tech</code> via Name.com, and <code className="text-pink-600 font-mono text-[11px]">.live</code>.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm space-y-1">
              <span className="font-semibold text-xs text-gray-950">DuckDNS.org (Dynamic Free Subdomain)</span>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                A 100% free, permanent public DNS server with support for SSL certificates. You can point <code className="text-emerald-600 font-mono text-[11px]">yourname.duckdns.org</code> to any host server for free.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 p-3 rounded-sm space-y-1">
              <span className="font-semibold text-xs text-gray-950">Platform Subdomains (Easiest)</span>
              <p className="text-xs text-gray-600 leading-relaxed font-sans">
                Both Render and Koyeb generate secure HTTPS URLs for free (e.g., <code className="text-indigo-600 font-mono text-[11px]">nse-ai-screener.onrender.com</code>). For portfolio projects, these subdomains are standard, fast, and completely free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Deploy Steps Checklist */}
      <div className="bg-white rounded-sm p-5 border border-gray-200 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 text-indigo-600 border-b border-gray-200 pb-3">
          <CheckCircle2 size={18} className="text-emerald-600" />
          <h3 className="font-semibold text-gray-950 font-display text-xs uppercase tracking-wider">Step-by-Step GitHub & Render Deployment</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-600 leading-relaxed">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-gray-950">
              <span className="bg-gray-50 border border-gray-200 text-indigo-600 w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-mono">1</span>
              Push to GitHub
            </div>
            <p className="font-sans text-gray-650">
              Initialize a git repository in your export folder, commit all files, and push to a public or private GitHub repository.
            </p>
            <div className="bg-gray-50 border border-gray-200 font-mono p-2 rounded-sm text-[10px] text-indigo-600">
              git init<br />
              git add .<br />
              git commit -m "NSE AI"<br />
              git push origin main
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-gray-950">
              <span className="bg-gray-50 border border-gray-200 text-indigo-600 w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-mono">2</span>
              Configure Render Web Service
            </div>
            <p className="font-sans text-gray-650">
              Sign up on **Render.com** and click **New &gt; Web Service**. Connect your GitHub repository and set these settings:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] font-mono text-gray-600">
              <li>Runtime: <span className="text-gray-950">Node</span></li>
              <li>Build: <code className="text-pink-600 font-mono text-[10px]">npm i && npm run build</code></li>
              <li>Start: <code className="text-pink-600 font-mono text-[10px]">npm run start</code></li>
            </ul>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-gray-950">
              <span className="bg-gray-50 border border-gray-200 text-indigo-600 w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-mono">3</span>
              Inject Secrets & Launch
            </div>
            <p className="font-sans text-gray-650">
              Navigate to the **Environment** tab on Render. Inject the required server secrets securely:
            </p>
            <div className="space-y-1 bg-gray-50 border border-gray-200 font-mono p-2 rounded-sm text-[10px] text-emerald-700">
              <div>GEMINI_API_KEY = "your_actual_key"</div>
              <div>NODE_ENV = "production"</div>
            </div>
            <p className="text-[11px] text-gray-500 font-sans">
              Click **Deploy**. Render will automatically build the React assets, compile your Express server, and host it live!
            </p>
          </div>
        </div>
      </div>

      {/* Production Security Notes */}
      <div className="bg-white border border-gray-200 rounded-sm p-4 flex gap-3 shadow-sm">
        <Shield size={18} className="text-emerald-650 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider font-display">Secure Full-Stack Architecture Guarded</h4>
          <p className="text-xs text-gray-600 leading-relaxed font-sans">
            Our codebase already respects strict enterprise security boundaries. All requests targeting the **Gemini API** are executed entirely on the server-side (<code className="text-[11px] font-mono">/server.ts</code>). Your Gemini key is completely safe and is never exposed to the client browser. No key inputs or forms are ever presented to end-users.
          </p>
        </div>
      </div>
    </div>
  );
}

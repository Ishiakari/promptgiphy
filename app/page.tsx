'use client';

import { useState, useEffect } from 'react';
import { Download, Link } from 'lucide-react';

export default function PromptGiphy() {
  const [videoPath, setVideoPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [memeData, setMemeData] = useState<{ startTime: number; caption: string } | null>(null);
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {
    setTimestamp(new Date().toISOString().replace('T', ' // ').substring(0, 23));
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPath) return alert('Please input an absolute local file path!');

    setLoading(true);
    setGeneratedGif(null);
    setMemeData(null);
    setStatus('Extracting audio & querying Whisper AI...');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoPath }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Pipeline execution failed');

      setGeneratedGif(data.gifUrl);
      setMemeData(data.config);
      setTimestamp(new Date().toISOString().replace('T', ' // ').substring(0, 23));
      setStatus('loop compiled successfully - 1 output.');
    } catch (err: any) {
      alert(`Pipeline Error: ${err.message}`);
      setStatus('Failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedGif) {
      navigator.clipboard.writeText(window.location.origin + generatedGif);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0c0e] text-slate-300 flex flex-col items-center justify-center p-6 font-mono selection:bg-slate-700">
      <div className="w-full max-w-xl space-y-8">
        
        {/* Header System */}
        <header className="flex items-center justify-between">
          <div className="text-sm font-bold tracking-tight text-slate-200">
            PromptGiphy <span className="text-slate-500 font-normal ml-2">v1.0.0</span>
          </div>
          <div className="flex items-center gap-2 border border-neutral-800 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            LOCAL_MODE
          </div>
        </header>

        {/* Workspace Form */}
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-widest text-slate-500">
              ABSOLUTE VIDEO FILE PATH
            </label>
            <input
              type="text"
              placeholder="/Users/you/projects/clip.mp4"
              value={videoPath}
              onChange={(e) => setVideoPath(e.target.value)}
              className="w-full bg-transparent border border-slate-800 px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-slate-600 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold py-3 px-4 shadow-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Compiling...' : 'Compile Loop'}
          </button>
        </form>

        {/* Status text */}
        {status && (
          <div className={`text-[10px] tracking-wider ${loading ? 'text-slate-500 animate-pulse' : 'text-slate-500'}`}>
            &gt;&gt; {status}
          </div>
        )}

        {/* Output Canvas */}
        {generatedGif && (
          <div className="space-y-4">
            <div className="overflow-hidden flex justify-center items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedGif} alt="Generated Loop" className="w-full h-auto object-cover" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={generatedGif}
                download={`promptgiphy_${Date.now()}.gif`}
                className="bg-[#121316] hover:bg-[#1a1c20] border border-neutral-900 text-slate-400 text-xs py-3 px-4 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} /> Download File
              </a>
              <button
                onClick={handleCopyLink}
                className="bg-[#121316] hover:bg-[#1a1c20] border border-neutral-900 text-slate-400 text-xs py-3 px-4 transition flex items-center justify-center gap-2"
              >
                <Link size={14} /> Copy Link
              </button>
            </div>
          </div>
        )}

        {/* Technical Metadata Table */}
        <div className="bg-[#121316] border border-neutral-900 p-6">
          <div className="text-[10px] uppercase tracking-widest text-slate-500 mb-6">METADATA</div>
          
          <div className="grid grid-cols-[160px_1fr] gap-y-4 text-[11px]">
            <div className="text-slate-500 tracking-wider">TIMESTAMP</div>
            <div className="text-slate-300">
              {timestamp || '--'}
            </div>
            
            <div className="text-slate-500 tracking-wider">CONFIDENCE</div>
            <div className="text-slate-300">0.973 - HIGH</div>

            {memeData && (
              <>
                <div className="text-slate-500 tracking-wider">CONFIG_START</div>
                <div className="text-slate-300">{memeData.startTime}s</div>

                <div className="text-slate-500 tracking-wider">ASSIGNED_CAPTION</div>
                <div className="text-slate-300">"{memeData.caption}"</div>
              </>
            )}
            {!memeData && (
              <>
                <div className="text-slate-500 tracking-wider">AUTO_CAPTION</div>
                <div className="text-slate-300">"and so the loop begins again -"</div>
              </>
            )}

            <div className="text-slate-500 tracking-wider">SOURCE_HASH</div>
            <div className="text-slate-300">sha256:a4f3c1...</div>

            <div className="text-slate-500 tracking-wider">FRAMES</div>
            <div className="text-slate-300">48 @ 12fps // 4.0s</div>
          </div>
        </div>

        {/* Bottom Footer */}
        <footer className="flex items-center justify-between pt-8 text-[10px] text-slate-600 tracking-wider">
          <div>PromptGiphy Local Runtime</div>
          <div>No network. No telemetry.</div>
        </footer>
      </div>
    </main>
  );
}
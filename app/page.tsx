'use client';

import { useState } from 'react';

export default function PromptGiphy() {
  const [videoPath, setVideoPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [generatedGif, setGeneratedGif] = useState<string | null>(null);
  const [memeData, setMemeData] = useState<{ startTime: number; caption: string } | null>(null);

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
      setStatus('Success! GIF Compiled.');
    } catch (err: any) {
      alert(`Pipeline Error: ${err.message}`);
      setStatus('Failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          PROMPTGIPHY
        </h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          Local Personal AI Meme Factory
        </p>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Absolute Local Video File Path
            </label>
            <input
              type="text"
              placeholder="e.g., C:\Users\Zach\Videos\funny_clip.mp4"
              value={videoPath}
              onChange={(e) => setVideoPath(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-teal-500 font-mono transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Crunching Media Data...' : 'Spit Out AI GIF'}
          </button>
        </form>

        {status && (
          <div className="mt-4 text-center text-xs font-mono text-slate-500">
            Pipeline Log: <span className="text-teal-400">{status}</span>
          </div>
        )}

        {generatedGif && (
          <div className="mt-8 border-t border-slate-800 pt-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-400 text-center uppercase tracking-widest">Output Masterpiece</h2>
            
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={generatedGif} alt="Meme Output" className="rounded-lg max-h-80 object-contain" />
            </div>

            {/* Interactive Download Button */}
            <div className="flex justify-center">
              <a
                href={generatedGif}
                download={`promptgiphy_${Date.now()}.gif`}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-teal-400 font-mono text-xs font-bold py-2.5 px-6 rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                💾 Download GIF File
              </a>
            </div>

            {memeData && (
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 font-mono text-xs space-y-1 text-slate-300">
                <p><span className="text-emerald-400">Target_Timestamp:</span> {memeData.startTime}s</p>
                <p><span className="text-emerald-400">Assigned_Caption:</span> "{memeData.caption}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
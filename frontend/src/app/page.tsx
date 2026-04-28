"use client";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function UploadDashboard() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  const pickFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) { setError("Images only"); return; }
    if (f.size > 10485760) { setError("Max 10 MB"); return; }
    setFile(f); setError(null);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    if (e.dataTransfer.files[0]) pickFile(e.dataTransfer.files[0]);
  }, [pickFile]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!file) { setError("Upload an asset"); return; }
    setLoading(true); setError(null); setProgress("Hashing & analyzing...");
    try {
      const fd = new FormData();
      fd.append("creatorName", name.trim());
      fd.append("image", file);
      const res = await fetch(`${API}/api/mint`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Mint failed"); setLoading(false); return; }
      setProgress("Redirecting...");
      setTimeout(() => router.push(`/certificate/${data.id}`), 500);
    } catch { setError("Network error — is the backend running?"); setLoading(false); }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="text-center mb-10 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">KinetiCrypt</h1>
        </div>
        <p className="text-sm text-slate-400 max-w-md mx-auto">Digital Asset Provenance Engine — Mint a cryptographically verifiable Certificate of Authenticity.</p>
      </div>

      <div className="glass-card w-full max-w-lg p-8 animate-fade-in-delay-1">
        <form onSubmit={submit} className="space-y-6">
          <div>
            <label htmlFor="creatorName" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Creator Identity</label>
            <input id="creatorName" type="text" className="input-glass" placeholder="Your name or pseudonym" value={name} onChange={e => setName(e.target.value)} disabled={loading} />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Digital Asset</label>
            <div className={`drop-zone ${dragging ? "active" : ""}`} onDrop={onDrop} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={e => { e.preventDefault(); setDragging(false); }} onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) pickFile(e.target.files[0]); }} disabled={loading} />
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                  <p className="mt-2 text-xs text-slate-400 truncate">{file?.name} • {file ? (file.size/1024).toFixed(1) : 0} KB
                    <button type="button" onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); }} className="ml-2 text-red-400 hover:text-red-300">Remove</button>
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-cyan-500/10 to-purple-500/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                  </div>
                  <p className="text-sm text-slate-300">Drag & drop your image here</p>
                  <p className="text-xs text-slate-500">PNG, JPG, WEBP up to 10 MB</p>
                </div>
              )}
            </div>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <button type="submit" className="btn-neon w-full" disabled={loading || !file || !name.trim()}>
            {loading ? (<><div className="spinner" /><span>{progress}</span></>) : (<><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg><span>Mint Certificate of Authenticity</span></>)}
          </button>
        </form>
      </div>

      <div className="mt-8 flex items-center gap-6 text-xs text-slate-500 animate-fade-in-delay-3">
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />SHA-256</div>
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />AI Analysis</div>
        <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />Immutable</div>
      </div>
    </main>
  );
}

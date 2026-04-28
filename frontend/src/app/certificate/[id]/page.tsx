"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { QRCodeSVG } from "qrcode.react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface CertData {
  id: string;
  creatorName: string;
  assetHash: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  geminiAnalysis: string;
  timestamp: string;
  status: string;
}

export default function CertificatePage() {
  const params = useParams();
  const [cert, setCert] = useState<CertData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params.id) return;
    fetch(`${API}/api/certificate/${params.id}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => { setCert(d); setLoading(false); })
      .catch(() => { setError("Certificate not found"); setLoading(false); });
  }, [params.id]);

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(certRef.current, { backgroundColor: "#0a0a1a", pixelRatio: 2 });
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const pdfHeight = (img.height * pdfWidth) / img.width;
      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("KinetiCrypt_Certificate.pdf");
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setDownloading(false);
    }
  };

  const copyToClipboard = () => {
    if (cert?.assetHash) {
      navigator.clipboard.writeText(cert.assetHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4 animate-fade-in">
        <div className="spinner mx-auto !w-10 !h-10 !border-[3px]" />
        <p className="text-slate-400 text-sm">Verifying Cryptographic Ledger...</p>
      </div>
    </main>
  );

  if (error || !cert) return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="glass-card p-10 text-center max-w-md animate-fade-in">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-200 mb-2">Certificate Not Found</h2>
        <p className="text-sm text-slate-400 mb-6">The requested certificate ID is invalid or does not exist.</p>
        <Link href="/" className="btn-neon">Back to Dashboard</Link>
      </div>
    </main>
  );

  const date = new Date(cert.timestamp);
  const formatted = date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + " at " + date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  const bullets = cert.geminiAnalysis
    .split("\n")
    .map(l => l.replace(/^[\s•\-*]+/, "").trim())
    .filter(l => l.length > 0);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8 animate-fade-in">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          Back
        </Link>
        <div className="status-badge minted">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          Verified Original
        </div>
      </div>

      <div ref={certRef} className="glass-card cert-border w-full max-w-2xl p-10 animate-fade-in-delay-1 relative bg-[#0a0a1a]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 mb-1">KinetiCrypt Provenance Engine</p>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">Certificate of Authenticity</h1>
        </div>

        <div className="neon-divider mb-8" />

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Creator</p>
            <p className="text-lg font-semibold text-slate-100">{cert.creatorName}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Minted</p>
            <p className="text-sm text-slate-300">{formatted}</p>
          </div>
        </div>

        <div className="mb-8 relative group">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 flex justify-between items-center">
            SHA-256 Cryptographic Hash
            <button onClick={copyToClipboard} className="text-cyan-400 hover:text-white transition-colors text-[9px] uppercase tracking-widest">
              {copied ? "Copied!" : "Copy Hash"}
            </button>
          </p>
          <div className="hash-display">
            <span className="text-[10px] text-slate-500 block mb-1">sha256://</span>
            {cert.assetHash}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Filename</p>
            <p className="text-xs text-slate-300 truncate">{cert.originalFileName}</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Size</p>
            <p className="text-xs text-slate-300">{(cert.fileSize / 1024).toFixed(1)} KB</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Type</p>
            <p className="text-xs text-slate-300">{cert.mimeType}</p>
          </div>
        </div>

        <div className="neon-divider mb-8" />

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-md bg-purple-500/20 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">AI Visual Analysis <span className="text-slate-600">— Gemini 2.5 Flash</span></p>
          </div>
          <ul className="space-y-3">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-cyan-400">{i + 1}</span>
                </div>
                <span className="text-sm text-slate-300 leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="neon-divider mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
          <div className="text-center md:text-left">
            <p className="text-[10px] text-slate-600 tracking-wider uppercase">Certificate ID: {cert.id}</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">Verified by KinetiCrypt Engine</p>
          </div>
          <div className="p-2 bg-white rounded-xl shadow-lg">
            <QRCodeSVG 
              value={typeof window !== 'undefined' ? window.location.href : ''} 
              size={70} 
              bgColor="#ffffff" 
              fgColor="#0a0a1a" 
              level="M"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-4 animate-fade-in-delay-3">
        <button 
          onClick={handleDownloadPDF} 
          disabled={downloading}
          className="btn-neon"
        >
          {downloading ? "Generating PDF..." : "Download PDF"}
        </button>
        <Link href="/" className="btn-neon !bg-white/5 !border-white/10 hover:!bg-white/10 transition-all">
          Mint Another
        </Link>
      </div>
    </main>
  );
}

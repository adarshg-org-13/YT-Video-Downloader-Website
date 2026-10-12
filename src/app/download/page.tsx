"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import YtVidLogo from "../components/YtVidLogo";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

type Format = { label: string; value: string; pro: boolean; desc: string };

const VIDEO_FORMATS: Format[] = [
  { label: "360p", value: "360p", pro: false, desc: "Low quality · fast" },
  { label: "480p", value: "480p", pro: false, desc: "Standard quality" },
  { label: "720p HD", value: "720p", pro: false, desc: "High definition · recommended" },
  { label: "1080p Full HD", value: "1080p", pro: true, desc: "Best quality · Pro only" },
];

type DownloadStatus = "idle" | "fetching" | "ready" | "downloading" | "done" | "error";

interface VideoInfo {
  title: string;
  duration: string;
  thumbnail: string;
  channel: string;
  views: string;
}

function DownloadPageInner() {
  const searchParams = useSearchParams();
  const initialFormat = searchParams.get("format") === "mp3" ? "mp3" : "video";
  const isPro = searchParams.get("plan") === "pro";

  const [url, setUrl] = useState("");
  const [mediaType, setMediaType] = useState<"video" | "mp3">(initialFormat);
  const [selectedQuality, setSelectedQuality] = useState("720p");
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isValidYouTubeUrl = (u: string) =>
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|playlist\?list=)|youtu\.be\/)/.test(u);

  const handleFetchInfo = async () => {
    if (!url.trim()) return;
    if (!isValidYouTubeUrl(url)) {
      setErrorMsg("Please enter a valid YouTube URL.");
      setStatus("error");
      return;
    }
    setStatus("fetching");
    setVideoInfo(null);
    setErrorMsg("");
    try {
      const res = await fetch(`http://localhost:5000/api/info?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error("Failed to fetch video info");
      const data = await res.json();
      setVideoInfo(data);
      setStatus("ready");
    } catch {
      setErrorMsg("Could not fetch video info. Make sure the Python backend is running on port 5000.");
      setStatus("error");
    }
  };

  const handleDownload = async () => {
    if (!url || !videoInfo) return;
    setStatus("downloading");
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 88) { if (progressRef.current) clearInterval(progressRef.current); return 88; }
        return p + Math.random() * 7;
      });
    }, 400);
    try {
      const quality = mediaType === "mp3" ? "mp3" : selectedQuality;
      const res = await fetch("http://localhost:5000/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, quality, format: mediaType }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Download failed"); }
      if (progressRef.current) clearInterval(progressRef.current);
      setProgress(100);
      const blob = await res.blob();
      const ext = mediaType === "mp3" ? "mp3" : "mp4";
      const filename = `${videoInfo.title.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = dlUrl; a.download = filename; a.click();
      URL.revokeObjectURL(dlUrl);
      setStatus("done");
    } catch (err: unknown) {
      if (progressRef.current) clearInterval(progressRef.current);
      setErrorMsg(err instanceof Error ? err.message : "Download failed. Please try again.");
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle"); setVideoInfo(null); setProgress(0); setErrorMsg("");
  };

  return (
    <div style={{ background: "#1a1a1a", color: "#ffffff", minHeight: "100vh", overflowX: "hidden" }}>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes spin     { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes waveLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes waveRight{ 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        @keyframes fadeUp   { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform:translateY(0); } }
        input::placeholder  { color: rgba(255, 255, 255, 0.25); }
        input:focus         { outline: none; border-color: rgba(255,255,255,0.35) !important; box-shadow: 0 0 0 3px rgba(255,255,255,0.05) !important; }
        .type-btn:hover     { opacity: 0.85; }
        .quality-btn:hover  { border-color: rgba(255,255,255,0.45) !important; }
        .action-btn:hover   { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(0,0,0,0.35) !important; }
        .action-btn         { transition: all 0.22s ease; }
        .ghost-btn:hover    { background: rgba(255,255,255,0.1) !important; }
        `
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5%", height: "64px",
        background: scrolled ? "rgba(18,18,18,0.97)" : "rgba(18,18,18,0.85)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        transition: "background 0.3s ease",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <YtVidLogo size={28} color="#ffffff" />
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#fff", fontFamily: "var(--font-montserrat)" }}>YtVid</span>
        </Link>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/docs" style={{
            padding: "8px 20px", borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "rgba(255, 255, 255, 1)", fontSize: "14px", fontWeight: 600,
            textDecoration: "none", transition: "border-color 0.2s",
          }}>
            Docs
          </Link>
          <a href="https://github.com/adarshg-org-13/YT-Video-Downloader-Website"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "8px 20px", borderRadius: "999px",
              background: "#fff", color: "#111",
              fontWeight: 700, fontSize: "14px", textDecoration: "none",
            }}>
            <GithubIcon size={14} /> GitHub
          </a>
        </div>
      </nav>

      {/* ── HERO + DOWNLOADER ── */}
      <section style={{
        position: "relative", minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 5% 100px", overflow: "hidden",
      }}>
        {/* Radial glow */}
        <div style={{
          position: "absolute", top: "25%", left: "50%", transform: "translateX(-50%)",
          width: "700px", height: "500px",
          background: "radial-gradient(ellipse, rgba(90,90,90,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Waves */}
        <div style={{ position: "absolute", bottom: -2, left: 0, width: "100%", height: "220px", overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "100%", animation: "waveLeft 12s linear infinite" }}>
            <path d="M0,60 Q150,120 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(255, 255, 255, 0.12)" />
          </svg>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "65%", animation: "waveRight 16s linear infinite" }}>
            <path d="M0,60 Q150,120 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(255, 255, 255, 0.22)" />
          </svg>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "35%", animation: "waveLeft 8s linear infinite" }}>
            <path d="M0,60 Q150,120 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(219, 219, 219, 1)" />
          </svg>
        </div>

        <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "860px" }}>

          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "20px", animation: "fadeUp 1.0s ease" }}>
            <h1 style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "clamp(62px, 6.6vw, 80px)",
              fontWeight: 1000, letterSpacing: "-1.5px",
              color: "#f8f8f8ff", lineHeight: 1.08, marginBottom: "16px",
            }}>
              Download YouTube<br />
              <span style={{ color: "rgba(255, 255, 255, 0.24)" }}>video or audio.</span>
            </h1>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.45)", fontWeight: 500, lineHeight: 1.6 }}>
              Paste a YouTube link — free up to 720p, Pro for 1080p.
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            padding: "36px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
            animation: "fadeUp 0.65s ease 0.1s both",
          }}>

            {/* Media type toggle */}
            <div style={{
              display: "flex", gap: "0",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "14px", padding: "4px",
              marginBottom: "24px",
            }}>
              {(["video", "mp3"] as const).map((type) => (
                <button
                  key={type}
                  className="type-btn"
                  onClick={() => setMediaType(type)}
                  style={{
                    flex: 1, padding: "12px 16px", borderRadius: "10px",
                    background: mediaType === type ? "#ffffff" : "transparent",
                    color: mediaType === type ? "#1a1a1a" : "rgba(255,255,255,0.45)",
                    border: "none", fontSize: "14px", fontWeight: 800,
                    cursor: "pointer", transition: "all 0.2s ease",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    fontFamily: "var(--font-montserrat)",
                  }}
                >
                  {type === "video" ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
                      Video (MP4)
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                      Audio (MP3)
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* URL Input */}
            <div style={{ position: "relative", marginBottom: "16px" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.28)", pointerEvents: "none" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </div>
              <input
                type="url"
                id="youtube-url-input"
                value={url}
                onChange={(e) => { setUrl(e.target.value); if (status === "error") setStatus("idle"); }}
                onKeyDown={(e) => e.key === "Enter" && handleFetchInfo()}
                placeholder="https://www.youtube.com/watch?v=..."
                style={{
                  width: "100%", padding: "15px 44px 15px 46px",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.13)",
                  color: "#fff", fontSize: "14px",
                  fontFamily: "ui-monospace, monospace",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                }}
              />
              {url && (
                <button onClick={() => { setUrl(""); handleReset(); }}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: "4px", display: "flex" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              )}
            </div>

            {/* Fetch button */}
            {(status === "idle" || status === "error") && (
              <button
                id="fetch-info-btn"
                className="action-btn"
                onClick={handleFetchInfo}
                disabled={!url.trim()}
                style={{
                  width: "100%", padding: "16px",
                  borderRadius: "12px",
                  background: url.trim() ? "#ffffff" : "rgba(255,255,255,0.08)",
                  color: url.trim() ? "#1a1a1a" : "rgba(255,255,255,0.3)",
                  fontSize: "15px", fontWeight: 800,
                  border: "none", cursor: url.trim() ? "pointer" : "not-allowed",
                  fontFamily: "var(--font-montserrat)",
                  boxShadow: url.trim() ? "0 8px 24px rgba(0,0,0,0.25)" : "none",
                }}
              >
                Fetch Video Info
              </button>
            )}

            {/* Fetching spinner */}
            {status === "fetching" && (
              <div style={{ textAlign: "center", padding: "28px 0" }}>
                <div style={{ width: 36, height: 36, border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto 14px" }} />
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", fontWeight: 500 }}>Fetching video info...</p>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div style={{
                marginTop: "14px", padding: "14px 18px",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "10px", color: "#fca5a5", fontSize: "14px", fontWeight: 500,
              }}>
                {errorMsg}
              </div>
            )}

            {/* Video info + controls */}
            {(status === "ready" || status === "downloading" || status === "done") && videoInfo && (
              <div>
                {/* Divider */}
                <div style={{ height: "1px", background: "rgba(255,255,255,0.08)", margin: "24px 0" }} />

                {/* Thumbnail + info */}
                <div style={{
                  display: "flex", gap: "16px", alignItems: "flex-start",
                  marginBottom: "24px",
                }}>
                  {videoInfo.thumbnail && (
                    <img src={videoInfo.thumbnail} alt="thumbnail"
                      style={{ width: 96, height: 64, objectFit: "cover", borderRadius: "8px", flexShrink: 0, border: "1px solid rgba(255,255,255,0.08)" }} />
                  )}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "6px", lineHeight: 1.4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                      {videoInfo.title}
                    </div>
                    <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.38)", display: "flex", gap: "14px", flexWrap: "wrap" }}>
                      <span>{videoInfo.channel}</span>
                      <span>{videoInfo.duration}</span>
                      {videoInfo.views && <span>{videoInfo.views} views</span>}
                    </div>
                  </div>
                </div>

                {/* Quality selector */}
                {mediaType === "video" && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 800, color: "rgba(255,255,255,0.35)", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "10px" }}>
                      Quality
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {VIDEO_FORMATS.map((fmt) => {
                        const locked = fmt.pro && !isPro;
                        const selected = selectedQuality === fmt.value && !locked;
                        return (
                          <button key={fmt.value} id={`quality-${fmt.value}`}
                            className="quality-btn"
                            onClick={() => !locked && setSelectedQuality(fmt.value)}
                            title={locked ? "Pro plan required" : fmt.desc}
                            style={{
                              padding: "9px 18px", borderRadius: "999px",
                              background: selected ? "#ffffff" : "rgba(255,255,255,0.06)",
                              color: selected ? "#1a1a1a" : locked ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)",
                              border: selected ? "none" : locked ? "1px dashed rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.14)",
                              fontSize: "13px", fontWeight: 700,
                              cursor: locked ? "not-allowed" : "pointer",
                              transition: "all 0.18s ease",
                              display: "inline-flex", alignItems: "center", gap: "6px",
                              fontFamily: "var(--font-montserrat)",
                            }}>
                            {fmt.label}
                            {locked && (
                              <span style={{ fontSize: "10px", background: "rgba(250,204,21,0.18)", color: "#fbbf24", padding: "1px 6px", borderRadius: "4px", fontWeight: 700 }}>
                                PRO
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    {!isPro && (
                      <div style={{ marginTop: "10px", fontSize: "13px", color: "rgba(255,255,255,0.28)" }}>
                        1080p requires a{" "}
                        <Link href="/#pricing" style={{ color: "rgba(255,255,255,0.55)", textDecoration: "underline" }}>Pro plan</Link>.
                      </div>
                    )}
                  </div>
                )}

                {mediaType === "mp3" && (
                  <div style={{
                    padding: "12px 16px", background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px",
                    marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px",
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                    <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                      MP3 audio · 192 kbps (320 kbps for Pro)
                    </span>
                  </div>
                )}

                {/* Progress bar */}
                {status === "downloading" && (
                  <div style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", fontWeight: 600 }}>Downloading...</span>
                      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ height: "5px", background: "rgba(255,255,255,0.08)", borderRadius: "999px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "#ffffff", borderRadius: "999px", transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                )}

                {/* Done */}
                {status === "done" && (
                  <div style={{
                    marginBottom: "20px", padding: "13px 16px",
                    background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)",
                    borderRadius: "10px", color: "#86efac",
                    display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: 600,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                    Download complete!
                  </div>
                )}

                {/* Buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                  {status !== "done" && (
                    <button id="start-download-btn"
                      className="action-btn"
                      onClick={handleDownload}
                      disabled={status === "downloading"}
                      style={{
                        flex: 1, padding: "16px", borderRadius: "12px",
                        background: status === "downloading" ? "rgba(255,255,255,0.08)" : "#ffffff",
                        color: status === "downloading" ? "rgba(255,255,255,0.35)" : "#1a1a1a",
                        fontSize: "15px", fontWeight: 800,
                        border: "none", cursor: status === "downloading" ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        fontFamily: "var(--font-montserrat)",
                        boxShadow: status !== "downloading" ? "0 8px 24px rgba(0,0,0,0.3)" : "none",
                      }}>
                      {status === "downloading" ? (
                        <>
                          <div style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          Download {mediaType === "mp3" ? "MP3" : selectedQuality}
                        </>
                      )}
                    </button>
                  )}
                  <button
                    className="ghost-btn"
                    onClick={handleReset}
                    style={{
                      padding: "16px 20px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.5)", fontSize: "14px", fontWeight: 600,
                      cursor: "pointer", transition: "background 0.2s",
                      fontFamily: "var(--font-montserrat)",
                    }}>
                    {status === "done" ? "New Download" : "Reset"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function DownloadPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#1a1a1a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 32, height: 32, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <DownloadPageInner />
    </Suspense>
  );
}

"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import YtVidLogo from "../components/YtVidLogo";

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const SECTIONS = [
  {
    id: "what-is-ytdlp",
    number: "01",
    tag: "Core Engine",
    title: "What is yt-dlp?",
    paragraphs: [
      "yt-dlp is a feature-rich, open-source command-line tool and Python library for downloading audio and video from YouTube and thousands of other websites.",
      "It is an actively maintained fork of the popular youtube-dl project, continuously updated by the open-source community to patch streaming changes, improve multi-threaded download speed, and prevent throttling.",
      "YtVid uses yt-dlp as its primary core engine. When you paste a link, our Python backend calls yt-dlp directly to extract metadata, select stream formats, and download the media files."
    ],
    highlights: [
      { label: "License", val: "Unlicense (100% Free & Open-Source)" },
      { label: "Platform Support", val: "YouTube Videos, Shorts, Playlists & Channels" },
      { label: "Stream Handling", val: "DASH Video + Audio Concurrent Merging" },
      { label: "Storage Model", val: "Direct Browser Stream · 0 Files Kept On Server" }
    ]
  },
  {
    id: "how-it-works",
    number: "02",
    tag: "Architecture",
    title: "How the Download Pipeline Works",
    paragraphs: [
      "Every download passes through a streamlined 4-stage pipeline that ensures high reliability, instant UI feedback, and privacy protection.",
      "1. Manifest Probe: You paste a YouTube URL and click 'Fetch Video Info'. The Next.js frontend calls the local Python Flask backend on port 5000.",
      "2. Metadata Extraction: yt-dlp extracts title, thumbnail, duration, channel, and available formats in milliseconds without downloading video content.",
      "3. Format Remuxing: When you initiate download, yt-dlp downloads the video and audio streams concurrently, then invokes FFmpeg to merge them into a single high-quality MP4 or MP3 file.",
      "4. Direct Stream: The completed file is streamed directly to your browser as an attachment and deleted from server storage immediately."
    ],
    pipelineSteps: [
      { step: "1", title: "URL Probe", desc: "Fast metadata extraction in ~500ms" },
      { step: "2", title: "Stream Select", desc: "Best video & audio stream mapping" },
      { step: "3", title: "FFmpeg Merge", desc: "Remux streams into clean MP4/MP3" },
      { step: "4", title: "Direct Stream", desc: "Immediate browser download & cleanup" }
    ]
  },
  {
    id: "format-selection",
    number: "03",
    tag: "Quality Mapping",
    title: "Format Selection & Quality Strings",
    paragraphs: [
      "YouTube stores high-definition media (720p, 1080p, and above) as separate adaptive video and audio streams. yt-dlp uses format selector expressions to identify and download the highest-quality streams matching your choice.",
      "Free Plan downloads up to 720p HD using MP4/M4A containers. Pro Plan unlocks full 1080p Full HD video streams.",
      "For MP3 audio extraction, the highest available audio stream is downloaded and transcoded with FFmpeg (192 kbps for Free, 320 kbps for Pro users)."
    ],
    codeTitle: "format_selector.py",
    code: `# yt-dlp format options for YtVid
ydl_opts = {
    # 720p HD format selector string:
    "format": "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]",
    "merge_output_format": "mp4",
    "concurrent_fragment_downloads": 4,
    "retries": 10,
    "outtmpl": "downloads/%(title)s.%(ext)s",
}`
  },
  {
    id: "metadata-extraction",
    number: "04",
    tag: "Probing API",
    title: "Fast Metadata Extraction",
    paragraphs: [
      "Before starting any heavy media download, YtVid probes the video with download=False. This fetches only the video manifest payload, conserving bandwidth and giving you an instant preview.",
      "The returned metadata includes video title, author/uploader, view count, video thumbnail, duration in seconds, and all available resolution streams."
    ],
    codeTitle: "metadata_probe.py",
    code: `import yt_dlp

def fetch_metadata(url: str):
    # Probe metadata without downloading video bytes
    ydl_opts = {"quiet": True, "no_warnings": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        return {
            "title": info.get("title"),
            "thumbnail": info.get("thumbnail"),
            "duration": info.get("duration"),
            "channel": info.get("uploader"),
            "views": info.get("view_count"),
        }`
  },
  {
    id: "audio-conversion",
    number: "05",
    tag: "FFmpeg Pipeline",
    title: "MP3 Audio Extraction with FFmpeg",
    paragraphs: [
      "YouTube does not store native MP3 files; audio is delivered as Opus or AAC streams inside WebM or M4A containers.",
      "YtVid hooks an FFmpeg postprocessor directly into yt-dlp. As soon as the raw audio download completes, FFmpeg automatically encodes the file to standard MP3 with proper ID3 metadata tags."
    ],
    codeTitle: "audio_postprocessor.py",
    code: `# Audio extraction with FFmpeg
ydl_opts = {
    "format": "bestaudio/best",
    "postprocessors": [{
        "key": "FFmpegExtractAudio",
        "preferredcodec": "mp3",
        "preferredquality": "192",  # 320 kbps for Pro tier
    }],
    "outtmpl": "downloads/%(title)s.%(ext)s",
}`
  },
  {
    id: "running-locally",
    number: "06",
    tag: "Local Setup",
    title: "Running YtVid on Your Machine",
    paragraphs: [
      "YtVid runs 100% locally on your computer with complete privacy. The user interface runs on Next.js (port 3000) and the downloader service runs on Python Flask (port 5000).",
      "Prerequisites: Node.js 18+, Python 3.9+, and FFmpeg (required for video merging and audio extraction)."
    ],
    codeTitle: "bash · terminal",
    code: `# 1. Clone the repository
git clone https://github.com/adarshg-org-13/YT-Video-Downloader-Website
cd YT-Video-Downloader-Website

# 2. Run Next.js Frontend (http://localhost:3000)
npm install && npm run dev

# 3. In another terminal, run Python Backend (http://localhost:5000)
cd backend
pip install -r requirements.txt
python app.py

# 4. Install FFmpeg
sudo apt install ffmpeg   # Ubuntu/Debian
brew install ffmpeg       # macOS`
  }
];

export default function DocsPage() {
  const [scrolled, setScrolled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div style={{ background: "#ffffff", color: "#111827", minHeight: "100vh", overflowX: "hidden" }}>

      <style dangerouslySetInnerHTML={{
        __html: `
        .copy-btn:hover { background: rgba(255,255,255,0.18) !important; color: #ffffff !important; }
        .doc-nav-link:hover { color: #111827 !important; }
        .docs-sec-row {
          display: flex;
          gap: 56px;
          align-items: flex-start;
          padding: 60px 0;
          border-bottom: 1px solid #e5e7eb;
          flex-wrap: wrap;
        }
        .docs-sec-left {
          flex: 1 1 480px;
          max-width: 580px;
        }
        .docs-sec-right {
          flex: 1 1 440px;
          min-width: 320px;
        }
        `
      }} />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5%", height: "64px",
        background: scrolled ? "rgba(10, 10, 10, 0.97)" : "rgba(10, 10, 10, 0.9)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        transition: "background 0.3s ease",
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
          <YtVidLogo size={28} color="#ffffffff" />
          <span style={{ fontSize: "18px", fontWeight: 900, color: "#ffffffff", fontFamily: "var(--font-montserrat)" }}>YtVid</span>
        </Link>
        <div style={{ display: "flex", gap: "10px" }}>
          <Link href="/download" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "8px 20px", borderRadius: "999px",
            background: "#202020ff", color: "#fff",
            fontSize: "14px", fontWeight: 700, textDecoration: "none",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download
          </Link>
          <a href="https://github.com/adarshg-org-13/YT-Video-Downloader-Website"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "8px 20px", borderRadius: "999px",
              background: "#ffffff", color: "#111111",
              fontWeight: 800, fontSize: "14px", textDecoration: "none",
              transition: "opacity 0.2s ease, transform 0.2s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.9"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            <GithubIcon size={14} /> GitHub
          </a>
        </div>
      </nav>

      {/* ── MAIN CONTENT CONTAINER (Horizontal Layout) ── */}
      <div style={{ paddingTop: "100px", paddingBottom: "100px", maxWidth: "1240px", margin: "0 auto", paddingLeft: "5%", paddingRight: "5%" }}>

        {/* ── Page Header: Montserrat Black ── */}
        <div style={{ paddingTop: "20px", paddingBottom: "48px", borderBottom: "2px solid #111827" }}>
          <div style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#6b7280",
            marginBottom: "12px",
          }}>
            Developer Guide &amp; Technical Reference
          </div>

          {/* Heading: Montserrat Black (font weight 900) */}
          <h1 style={{
            fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
            fontSize: "clamp(38px, 5.5vw, 64px)",
            fontWeight: 900,
            letterSpacing: "-1.5px",
            color: "#111827",
            lineHeight: 1.05,
            margin: "0 0 16px 0",
            textTransform: "uppercase",
          }}>
            DOCUMENTATION
          </h1>

          <p style={{
            fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
            fontSize: "17px",
            color: "#4b5563",
            lineHeight: 1.7,
            maxWidth: "760px",
            margin: 0,
            fontWeight: 400,
          }}>
            Detailed explanation of the yt-dlp downloading engine, stream format selection logic, metadata extraction pipeline, and local deployment instructions.
          </p>
        </div>

        {/* ── Horizontal Documentation Sections ── */}
        <div>
          {SECTIONS.map((sec) => (
            <div key={sec.id} id={sec.id} className="docs-sec-row">

              {/* Left Column: Heading & Normal Text */}
              <div className="docs-sec-left">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#9ca3af", letterSpacing: "1px" }}>
                    {sec.number}
                  </span>
                  <span style={{ height: "1px", width: "20px", background: "#d1d5db" }} />
                  <span style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6b7280" }}>
                    {sec.tag}
                  </span>
                </div>

                <h2 style={{
                  fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                  fontSize: "clamp(24px, 2.6vw, 32px)",
                  fontWeight: 800,
                  color: "#111827",
                  letterSpacing: "-0.8px",
                  lineHeight: 1.2,
                  marginBottom: "18px",
                }}>
                  {sec.title}
                </h2>

                <div>
                  {sec.paragraphs.map((p, i) => (
                    <p key={i} style={{
                      fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
                      fontSize: "15.5px",
                      color: "#4b5563",
                      lineHeight: 1.75,
                      fontWeight: 400,
                      marginBottom: "14px",
                    }}>
                      {p}
                    </p>
                  ))}
                </div>
              </div>

              {/* Right Column: Code block OR Horizontal Features */}
              <div className="docs-sec-right">

                {/* Case 1: Code block */}
                {sec.code && (
                  <div style={{
                    background: "#111827",
                    borderRadius: "14px",
                    border: "1px solid #1f2937",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                  }}>
                    {/* Code toolbar */}
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 18px",
                      background: "#1f2937",
                      borderBottom: "1px solid #374151",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ display: "flex", gap: "5px" }}>
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ef4444", display: "inline-block" }} />
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
                          <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                        </div>
                        <span style={{ fontSize: "12px", fontFamily: "ui-monospace, monospace", color: "#9ca3af", marginLeft: "6px" }}>
                          {sec.codeTitle}
                        </span>
                      </div>
                      <button
                        className="copy-btn"
                        onClick={() => handleCopy(sec.id, sec.code!)}
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "12px",
                          fontWeight: 500,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          fontFamily: "ui-monospace, monospace",
                        }}
                      >
                        {copiedId === sec.id ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pre & code */}
                    <pre style={{
                      margin: 0,
                      padding: "20px 22px",
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                      fontSize: "13px",
                      lineHeight: 1.75,
                      color: "#e5e7eb",
                      overflowX: "auto",
                      background: "#111827",
                    }}>
                      <code>{sec.code}</code>
                    </pre>
                  </div>
                )}

                {/* Case 2: Highlights grid (for Section 1) */}
                {sec.highlights && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: "12px",
                  }}>
                    {sec.highlights.map((h, j) => (
                      <div key={j} style={{
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "16px 20px",
                      }}>
                        <div style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: "#6b7280", marginBottom: "4px" }}>
                          {h.label}
                        </div>
                        <div style={{ fontSize: "14.5px", fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
                          {h.val}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Case 3: Pipeline steps (for Section 2) */}
                {sec.pipelineSteps && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}>
                    {sec.pipelineSteps.map((s, k) => (
                      <div key={k} style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "14px 18px",
                      }}>
                        <div style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "8px",
                          background: "#111827",
                          color: "#ffffff",
                          fontSize: "13px",
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}>
                          {s.step}
                        </div>
                        <div>
                          <div style={{ fontSize: "14.5px", fontWeight: 700, color: "#111827" }}>
                            {s.title}
                          </div>
                          <div style={{ fontSize: "13px", color: "#6b7280" }}>
                            {s.desc}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* ── Horizontal Open Source Section with GitHub Buttons ── */}
        <div style={{
          marginTop: "64px",
          padding: "48px 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}>
          <div style={{ maxWidth: "560px" }}>
            <div style={{ fontSize: "11px", fontWeight: 800, letterSpacing: "2px", textTransform: "uppercase", color: "#6b7280", marginBottom: "8px" }}>
              Open Source
            </div>
            <h2 style={{
              fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
              fontSize: "clamp(24px, 3vw, 32px)",
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "-0.8px",
              margin: "0 0 10px 0",
            }}>
              Both projects are open source.
            </h2>
            <p style={{ fontSize: "15.5px", color: "#4b5563", lineHeight: 1.65, fontWeight: 400, margin: 0 }}>
              YtVid is built with yt-dlp. Explore the full source repositories, report bugs, and contribute directly on GitHub.
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a
              href="https://github.com/adarshg-org-13/YT-Video-Downloader-Website"
              target="_blank" rel="noopener noreferrer"
              id="docs-ytvid-github-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                padding: "13px 26px", borderRadius: "10px",
                background: "#1e1e1e", color: "#fff",
                fontSize: "14px", fontWeight: 700, textDecoration: "none",
                transition: "opacity 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              <GithubIcon size={16} />
              YtVid on GitHub
            </a>
            <a
              href="https://github.com/yt-dlp/yt-dlp"
              target="_blank" rel="noopener noreferrer"
              id="docs-ytdlp-github-btn"
              style={{
                display: "inline-flex", alignItems: "center", gap: "9px",
                padding: "13px 26px", borderRadius: "10px",
                background: "transparent", color: "#374151",
                fontSize: "14px", fontWeight: 700, textDecoration: "none",
                border: "1px solid #d1d5db",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <GithubIcon size={16} />
              yt-dlp on GitHub
            </a>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#111111", padding: "48px 5%",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        textAlign: "center",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "14px" }}>
          <YtVidLogo size={22} color="#fff" />
          <span style={{ fontSize: "15px", fontWeight: 900, color: "#fff", fontFamily: "var(--font-montserrat)" }}>YtVid</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.28)", fontSize: "13px", margin: "0 0 20px" }}>
          Open-source YouTube downloader · MIT License
        </p>
        <div style={{ display: "flex", gap: "24px", justifyContent: "center" }}>
          {[{ label: "Home", href: "/" }, { label: "Download", href: "/download" }, { label: "GitHub", href: "https://github.com/adarshg-org-13/YT-Video-Downloader-Website" }].map(({ label, href }) => (
            <a key={label} href={href}
              className="doc-nav-link"
              style={{ color: "rgba(255,255,255,0.33)", fontSize: "13px", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
              {label}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}

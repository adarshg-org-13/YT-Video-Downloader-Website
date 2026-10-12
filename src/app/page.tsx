"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import YtVidLogo from "./components/YtVidLogo";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, isVisible };
}

function RevealSection({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, isVisible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(40px)",
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.2,0.8,0.2,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

const HOW_IT_WORKS = [
  {
    id: "extract",
    title: "Intelligent Extraction.",
    highlight: "parses every YouTube URL",
    desc: "yt-dlp parses every YouTube URL — videos, Shorts, playlists, channels — and fetches full metadata: title, duration, thumbnails, available formats, and codec information without downloading a single byte.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    color: "#6366f1",
    align: "left",
  },
  {
    id: "format",
    title: "Format Selection.",
    highlight: "best quality stream available",
    desc: "Our backend instructs yt-dlp to select the best quality stream available for your plan — up to 720p for free users and full 1080p for Pro. Audio-only MP3 extraction uses FFmpeg post-processing to produce clean, tagged audio files.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    ),
    color: "#10b981",
    align: "right",
  },
  {
    id: "download",
    title: "Fast & Reliable.",
    highlight: "concurrent fragment downloading",
    desc: "yt-dlp uses concurrent fragment downloading and automatic retry logic to ensure maximum speed and reliability. Downloads are streamed directly to your browser — no cloud storage, no file retention on our servers.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    color: "#f59e0b",
    align: "left",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    highlight: true,
    description: "Perfect for casual users who need to download occasionally.",
    features: [
      "Up to 720p video quality",
      "MP4 video downloads",
      "MP3 audio extraction",
      "15 downloads per day",
      "Standard download speed",
      "No account required",
    ],
    cta: "Download Now",
    ctaHref: "/download",
  },
  {
    name: "Pro",
    price: "₹199",
    period: "per year",
    highlight: true,
    description: "For power users who need the best quality and no limits.",
    features: [
      "Full 1080p video quality",
      "MP4, WebM, MKV formats",
      "High-quality MP3 (320kbps)",
      "Unlimited downloads",
      "Priority download speed",
      "No ads",
    ],
    cta: "Go Pro",
    ctaHref: "/download?plan=pro",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: "#ffffff", color: "#111827", minHeight: "100vh", overflowX: "hidden" }}>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes waveLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes waveRight { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .nav-link:hover { color: #fff !important; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(0,0,0,0.25) !important; }
        .btn-secondary:hover { transform: translateY(-2px); background: rgba(255,255,255,0.18) !important; }
        .btn-primary, .btn-secondary { transition: all 0.25s ease; }
        .plan-card:hover { transform: translateY(-6px); }
        .plan-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        `
      }} />

      {/* ─── NAVBAR ─── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5%", height: "64px",
        background: scrolled ? "rgba(28,28,28,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <YtVidLogo size={30} color="#ffffff" />
          <span style={{ fontSize: "20px", fontWeight: 900, letterSpacing: "-0.5px", color: "#fff", fontFamily: "var(--font-montserrat)" }}>
            YtVid
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link href="/docs" style={{
            padding: "8px 22px", borderRadius: "999px",
            background: "transparent", color: "#fff",
            fontWeight: 600, fontSize: "14px",
            border: "1px solid rgba(255,255,255,0.28)",
            textDecoration: "none", transition: "background 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            Documentation
          </Link>
          <a
            href="https://github.com/adarshg-org-13/YT-Video-Downloader-Website"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "8px 22px", borderRadius: "999px",
              background: "#fff", color: "#1a1a1a",
              fontWeight: 700, fontSize: "14px", textDecoration: "none",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <GithubIcon size={15} />
            GitHub
          </a>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        position: "relative", minHeight: "100vh", background: "#1e1e1e",
        display: "flex", alignItems: "center",
        padding: "100px 5% 150px", zIndex: 1, overflow: "hidden",
      }}>
        {/* Subtle radial glow */}
        <div style={{
          position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
          width: "900px", height: "600px",
          background: "radial-gradient(ellipse, rgba(90,90,90,0.2) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Waves */}
        <div style={{ position: "absolute", bottom: -2, left: 0, width: "100%", height: "250px", overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "100%", animation: "waveLeft 12s linear infinite" }}>
            <path d="M0,60 Q150,120 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.06)" />
          </svg>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "75%", animation: "waveRight 16s linear infinite" }}>
            <path d="M0,60 Q150,120 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="rgba(255,255,255,0.1)" />
          </svg>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, left: 0, width: "200%", height: "40%", animation: "waveLeft 8s linear infinite" }}>
            <path d="M0,60 Q150,120 300,60 T600,60 T900,60 T1200,60 L1200,120 L0,120 Z" fill="#ffffff" />
          </svg>
        </div>

        <div style={{
          display: "flex", width: "100%", maxWidth: "1400px", margin: "0 auto",
          alignItems: "center", justifyContent: "space-between", gap: "60px",
          flexWrap: "wrap", position: "relative", zIndex: 10,
        }}>
          {/* Left */}
          <div style={{ flex: "1 1 500px", maxWidth: "650px" }}>
            <RevealSection delay={0.1}>
              <h1 style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "clamp(52px, 5.5vw, 82px)",
                fontWeight: 900, lineHeight: "1.05",
                letterSpacing: "-2.5px", color: "#ffffff",
                margin: "0 0 28px 0",
              }}>
                Download any<br />YouTube video<br />
                <span style={{ color: "rgba(255,255,255,0.35)" }}>in seconds.</span>
              </h1>
            </RevealSection>

            <RevealSection delay={0.2}>
              <p style={{
                fontSize: "clamp(17px, 1.6vw, 22px)", fontWeight: 500,
                lineHeight: "1.65", color: "rgba(255,255,255,0.55)",
                marginBottom: "52px", maxWidth: "520px",
              }}>
                Paste any YouTube link and download videos up to{" "}
                <span style={{ color: "#fff", fontWeight: 700 }}>1080p</span> or extract
                crystal-clear{" "}
                <span style={{ color: "#fff", fontWeight: 700 }}>MP3 audio</span> —
                free &amp; open-source.
              </p>
            </RevealSection>

            <RevealSection delay={0.3}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <Link
                  href="/download"
                  className="btn-primary"
                  id="hero-download-btn"
                  style={{
                    padding: "18px 40px", borderRadius: "999px",
                    background: "#ffffff", color: "#1a1a1a",
                    fontSize: "16px", fontWeight: 800,
                    border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: "10px",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download YouTube Video
                </Link>
                <Link
                  href="/download?format=mp3"
                  className="btn-secondary"
                  id="hero-mp3-btn"
                  style={{
                    padding: "18px 40px", borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(4px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "#ffffff", fontSize: "16px", fontWeight: 600,
                    textDecoration: "none",
                    display: "inline-flex", alignItems: "center", gap: "10px",
                  }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
                  </svg>
                  Download .mp3
                </Link>
              </div>
            </RevealSection>
          </div>

          {/* Right — Empty image placeholder */}
          <div style={{ flex: "1 1 460px", minHeight: "480px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RevealSection delay={0.4} className="w-full">
              <div style={{
                width: "100%", maxWidth: "500px", aspectRatio: "4/5",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "32px",
                border: "2px dashed rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {/* intentionally empty — user will add image */}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (alternating) ─── */}
      <section id="how-it-works" style={{ padding: "120px 5%", background: "#ffffff" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "140px" }}>

          {HOW_IT_WORKS.map((item) => {
            const isLeft = item.align === "left";
            return (
              <div key={item.id} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: "64px",
                flexDirection: isLeft ? "row" : "row-reverse",
                flexWrap: "wrap",
              }}>
                {/* Text */}
                <div style={{ flex: "1 1 400px", maxWidth: "500px" }}>
                  <RevealSection>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%",
                      background: item.color + "15", color: item.color,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: "24px", border: `2px solid ${item.color}30`,
                    }}>
                      {item.icon}
                    </div>
                    <h2 style={{
                      fontFamily: "var(--font-montserrat)",
                      fontSize: "clamp(38px, 4.5vw, 56px)",
                      fontWeight: 900, color: "#111827",
                      letterSpacing: "-1.5px", marginBottom: "20px", lineHeight: 1.1,
                    }}>
                      {item.title}
                    </h2>
                    <p style={{ fontSize: "19px", color: "#4b5563", lineHeight: 1.65, fontWeight: 500 }}>
                      {item.desc.split(item.highlight).map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i !== arr.length - 1 && (
                            <span style={{ color: item.color, fontWeight: 700 }}>{item.highlight}</span>
                          )}
                        </span>
                      ))}
                    </p>
                  </RevealSection>
                </div>

                {/* Empty image placeholder */}
                <div style={{ flex: "1 1 400px", minHeight: "380px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <RevealSection delay={0.2} className="w-full">
                    <div style={{
                      width: "100%", aspectRatio: "1/1", maxWidth: "480px",
                      background: "#f9fafb", borderRadius: "32px",
                      border: "1px dashed #d1d5db",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
                    }}>
                      {/* intentionally empty — user will add image */}
                    </div>
                  </RevealSection>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" style={{ padding: "120px 5%", background: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <RevealSection>
            <div style={{ textAlign: "center", marginBottom: "72px" }}>
              <h2 style={{
                fontFamily: "var(--font-montserrat)",
                fontSize: "clamp(36px, 4vw, 52px)",
                fontWeight: 900, color: "#111827",
                letterSpacing: "-1.5px", marginBottom: "14px",
              }}>
                Simple, honest pricing.
              </h2>
              <p style={{ fontSize: "18px", color: "#6b7280", maxWidth: "440px", margin: "0 auto", lineHeight: 1.6 }}>
                Start free. Upgrade to Pro for 1080p and unlimited downloads.
              </p>
            </div>
          </RevealSection>

          <div style={{ display: "flex", gap: "28px", justifyContent: "center", flexWrap: "wrap" }}>
            {PLANS.map((plan, idx) => (
              <RevealSection key={plan.name} delay={idx * 0.15}>
                <div
                  className="plan-card"
                  style={{
                    flex: "1 1 320px", maxWidth: "400px",
                    borderRadius: "28px",
                    background: plan.highlight ? "#1e1e1e" : "#ffffff",
                    border: plan.highlight ? "none" : "1px solid #e5e7eb",
                    padding: "44px 40px",
                    boxShadow: plan.highlight ? "0 30px 80px rgba(0,0,0,0.18)" : "0 4px 24px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  {plan.highlight && (
                    <div style={{
                      position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                      background: "#ffffff", color: "#1e1e1e",
                      fontSize: "11px", fontWeight: 800, letterSpacing: "1.5px",
                      padding: "6px 20px", borderRadius: "999px", textTransform: "uppercase",
                    }}>
                      Most Popular
                    </div>
                  )}

                  <div style={{ marginBottom: "8px" }}>
                    <span style={{
                      fontSize: "12px", fontWeight: 800, letterSpacing: "2px",
                      textTransform: "uppercase",
                      color: plan.highlight ? "rgba(255,255,255,0.45)" : "#9ca3af",
                    }}>
                      {plan.name}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "10px" }}>
                    <span style={{
                      fontSize: "52px", fontWeight: 900,
                      color: plan.highlight ? "#ffffff" : "#111827",
                      letterSpacing: "-2px",
                    }}>
                      {plan.price}
                    </span>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: plan.highlight ? "rgba(255,255,255,0.35)" : "#9ca3af" }}>
                      /{plan.period}
                    </span>
                  </div>

                  <p style={{
                    fontSize: "15px", lineHeight: 1.6, marginBottom: "32px",
                    color: plan.highlight ? "rgba(255,255,255,0.55)" : "#6b7280",
                  }}>
                    {plan.description}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px 0", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {plan.features.map((feature) => (
                      <li key={feature} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          background: plan.highlight ? "rgba(255,255,255,0.1)" : "#f0fdf4",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan.highlight ? "#fff" : "#22c55e"} strokeWidth="3.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span style={{
                          fontSize: "15px", fontWeight: 500,
                          color: plan.highlight ? "rgba(255,255,255,0.8)" : "#374151",
                        }}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.ctaHref}
                    id={`plan-cta-${plan.name.toLowerCase()}`}
                    style={{
                      display: "block", textAlign: "center",
                      padding: "16px 24px", borderRadius: "14px",
                      background: plan.highlight ? "#ffffff" : "#1e1e1e",
                      color: plan.highlight ? "#1e1e1e" : "#ffffff",
                      fontSize: "16px", fontWeight: 800,
                      textDecoration: "none", transition: "opacity 0.2s",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#111111", padding: "80px 5%", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <RevealSection>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "56px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "18px" }}>
                <YtVidLogo size={38} color="#ffffff" />
                <span style={{ fontSize: "24px", fontWeight: 900, color: "#ffffff", fontFamily: "var(--font-montserrat)", letterSpacing: "-0.5px" }}>
                  YtVid
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "16px", marginBottom: "32px", maxWidth: "380px", margin: "0 auto 32px" }}>
                Download YouTube videos and audio. Free &amp; open-source.
              </p>
              <a
                href="https://github.com/adarshg-org-13/YT-Video-Downloader-Website"
                target="_blank" rel="noopener noreferrer"
                id="footer-github-btn"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "10px",
                  padding: "16px 36px", borderRadius: "999px",
                  background: "#ffffff", color: "#111111",
                  fontSize: "15px", fontWeight: 800, textDecoration: "none",
                  boxShadow: "0 8px 30px rgba(255,255,255,0.08)",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 40px rgba(255,255,255,0.14)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(255,255,255,0.08)"; }}
              >
                <GithubIcon size={17} />
                View on GitHub
              </a>
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: "16px",
              borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "32px",
            }}>
              <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.28)", fontWeight: 500 }}>
                © 2026 YtVid. Open-source project.
              </span>
              <div style={{ display: "flex", gap: "24px" }}>
                {[{ label: "Documentation", href: "/docs" }, { label: "Download", href: "/download" }, { label: "GitHub", href: "https://github.com/adarshg-org-13/YT-Video-Downloader-Website" }].map(({ label, href }) => (
                  <a key={label} href={href}
                    style={{ fontSize: "14px", color: "rgba(255,255,255,0.35)", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </RevealSection>
      </footer>
    </div>
  );
}
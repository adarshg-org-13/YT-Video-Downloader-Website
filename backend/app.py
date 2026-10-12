"""
YtVid Backend — Flask API powered by yt-dlp
============================================
Endpoints:
  GET  /api/info?url=<youtube_url>   — Fetch video metadata (no download)
  POST /api/download                 — Download video or audio and stream to client
  GET  /api/health                   — Health check

Requirements:
  pip install flask flask-cors yt-dlp

Optional but recommended:
  sudo apt install ffmpeg   (or brew install ffmpeg on macOS)
  This is required for audio extraction (MP3) and video+audio merging.

Run:
  python app.py
  # Runs on http://localhost:5000
"""

import os
import re
import uuid
import json
import logging
import tempfile

from flask import Flask, request, jsonify, send_file, after_this_request
from flask_cors import CORS
import yt_dlp

# ─── Configuration ────────────────────────────────────────────────────────────

app = Flask(__name__)

# Allow requests from the Next.js dev server and production build
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
])

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

TEMP_DIR = tempfile.gettempdir()

# Quality → yt-dlp format string mapping
FORMAT_MAP = {
    "360p":  "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360][ext=mp4]/best[height<=360]",
    "480p":  "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[height<=480]",
    "720p":  "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best[height<=720]",
    "1080p": "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best[height<=1080]",
    "mp3":   "bestaudio/best",
}

# ─── Helpers ──────────────────────────────────────────────────────────────────

def is_valid_youtube_url(url: str) -> bool:
    """Accept standard YouTube, Shorts, and playlist URLs."""
    pattern = re.compile(
        r"^(https?://)?"
        r"(www\.)?"
        r"(youtube\.com/(watch\?v=|shorts/|playlist\?list=)|youtu\.be/)"
    )
    return bool(pattern.match(url.strip()))


def format_duration(seconds) -> str:
    """Convert seconds (int/float) to HH:MM:SS or MM:SS string."""
    if not seconds:
        return "Unknown"
    seconds = int(seconds)
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def format_views(view_count) -> str:
    """Format view count with commas."""
    if not view_count:
        return ""
    return f"{view_count:,}"


def clean_temp_file(path: str):
    """Delete a temporary file, ignoring errors."""
    try:
        if path and os.path.exists(path):
            os.remove(path)
            log.info(f"Cleaned up temp file: {path}")
    except Exception as e:
        log.warning(f"Could not remove temp file {path}: {e}")

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    """Simple health check endpoint."""
    return jsonify({"status": "ok", "service": "YtVid Backend"}), 200


@app.route("/api/info", methods=["GET"])
def get_info():
    """
    Fetch video metadata without downloading.

    Query params:
      url (str): YouTube video URL

    Returns JSON:
      {
        "title": str,
        "thumbnail": str,
        "duration": str,     # formatted as MM:SS or HH:MM:SS
        "channel": str,
        "views": str,        # formatted with commas
        "url": str
      }
    """
    url = request.args.get("url", "").strip()

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if not is_valid_youtube_url(url):
        return jsonify({"error": "Invalid YouTube URL"}), 400

    log.info(f"Fetching info for: {url}")

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
        "skip_download": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
    except yt_dlp.utils.DownloadError as e:
        log.error(f"yt-dlp error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        log.exception("Unexpected error fetching video info")
        return jsonify({"error": "Failed to fetch video info"}), 500

    return jsonify({
        "title":     info.get("title", "Unknown Title"),
        "thumbnail": info.get("thumbnail", ""),
        "duration":  format_duration(info.get("duration")),
        "channel":   info.get("uploader") or info.get("channel", "Unknown"),
        "views":     format_views(info.get("view_count")),
        "url":       url,
    }), 200


@app.route("/api/download", methods=["POST"])
def download_video():
    """
    Download a YouTube video or audio file and stream it to the client.

    Request body (JSON):
      {
        "url":     str,   # YouTube URL
        "quality": str,   # "360p", "480p", "720p", "1080p", or "mp3"
        "format":  str    # "video" or "mp3"
      }

    Returns:
      The video/audio file as an octet-stream.
    """
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "No JSON body"}), 400

    url     = body.get("url", "").strip()
    quality = body.get("quality", "720p").strip()
    fmt     = body.get("format", "video").strip()   # "video" or "mp3"

    if not url:
        return jsonify({"error": "No URL provided"}), 400
    if not is_valid_youtube_url(url):
        return jsonify({"error": "Invalid YouTube URL"}), 400

    if fmt == "mp3":
        quality = "mp3"

    if quality not in FORMAT_MAP:
        return jsonify({"error": f"Unknown quality: {quality}. Use one of {list(FORMAT_MAP.keys())}"}), 400

    file_id   = uuid.uuid4().hex
    out_tmpl  = os.path.join(TEMP_DIR, f"ytvid_{file_id}.%(ext)s")

    # Build yt-dlp options
    ydl_opts = {
        "format":               FORMAT_MAP[quality],
        "outtmpl":              out_tmpl,
        "merge_output_format":  "mp4",
        "quiet":                True,
        "no_warnings":          True,
        "concurrent_fragment_downloads": 4,
        "retries":              10,
        "fragment_retries":     10,
        "noplaylist":           True,   # only download single video, not playlist
    }

    if quality == "mp3":
        ydl_opts["postprocessors"] = [
            {
                "key":              "FFmpegExtractAudio",
                "preferredcodec":   "mp3",
                "preferredquality": "192",   # bump to 320 for Pro
            },
            {
                "key": "FFmpegMetadata",  # embed title/artist metadata
            },
        ]
        ydl_opts.pop("merge_output_format", None)

    log.info(f"Downloading [{quality}]: {url}")

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info      = ydl.extract_info(url, download=True)
            # Resolve actual output filename
            out_file  = ydl.prepare_filename(info)

            # If merged to mp4, the extension might have changed
            if quality != "mp3" and not os.path.exists(out_file):
                out_file = out_file.rsplit(".", 1)[0] + ".mp4"

            # For mp3, yt-dlp changes the extension after post-processing
            if quality == "mp3":
                out_file = out_file.rsplit(".", 1)[0] + ".mp3"

    except yt_dlp.utils.DownloadError as e:
        log.error(f"yt-dlp download error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        log.exception("Unexpected download error")
        return jsonify({"error": "Download failed"}), 500

    if not os.path.exists(out_file):
        log.error(f"Output file not found: {out_file}")
        return jsonify({"error": "Output file not found after download"}), 500

    # Determine MIME type and download filename
    if quality == "mp3":
        mimetype       = "audio/mpeg"
        dl_ext         = "mp3"
    else:
        mimetype       = "video/mp4"
        dl_ext         = "mp4"

    safe_title = re.sub(r"[^\w\s\-]", "", info.get("title", "video"))[:80]
    dl_filename = f"{safe_title}_{quality}.{dl_ext}"

    # Delete the temp file AFTER the response is sent
    @after_this_request
    def cleanup(response):
        clean_temp_file(out_file)
        return response

    log.info(f"Sending file: {out_file} as {dl_filename}")

    return send_file(
        out_file,
        mimetype=mimetype,
        as_attachment=True,
        download_name=dl_filename,
    )


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    log.info("Starting YtVid backend on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)

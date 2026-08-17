#!/usr/bin/env python3
"""
Local-AI Hardware Value & Model Fit Dashboard Launcher.

Starts a lightweight local HTTP server and automatically opens the interactive dashboard in your browser.
"""

import http.server
import socketserver
import webbrowser
import os
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DASHBOARD_DIR = ROOT / "dashboard"
DATA_DIR = ROOT / "07_DATA"

PORT = 8000

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        # Redirect root to /dashboard/index.html
        if self.path in ("/", "/index.html"):
            self.send_response(302)
            self.send_header("Location", "/dashboard/index.html")
            self.end_headers()
            return

        # API Endpoints
        if self.path == "/api/devices":
            devices_path = DATA_DIR / "devices.json"
            if devices_path.exists():
                with open(devices_path, "r", encoding="utf-8") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data.encode("utf-8"))
                return

        if self.path == "/api/models":
            models_path = DATA_DIR / "models_artificial_analysis.json"
            if models_path.exists():
                with open(models_path, "r", encoding="utf-8") as f:
                    data = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(data.encode("utf-8"))
                return

        return super().do_GET()


def main():
    os.chdir(ROOT)
    url = f"http://localhost:{PORT}/dashboard/index.html"
    print("=" * 70)
    print(">> LOCAL-AI HARDWARE VALUE & ARTIFICIAL ANALYSIS MODEL FIT SUITE")
    print("=" * 70)
    print(f"Serving dashboard at: {url}")
    print("Press Ctrl+C to stop the server.\n")

    webbrowser.open(url)

    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), DashboardHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()

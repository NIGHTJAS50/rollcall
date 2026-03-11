"use client";

import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onScan: (token: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScan, onClose }: QRScannerProps) {
  const isRunningRef = useRef(false);
  const scannerRef = useRef<{ stop: () => Promise<void> } | null>(null);
  const [error, setError] = useState("");
  const containerId = "qr-scanner-container";

  useEffect(() => {
    let mounted = true;

    import("html5-qrcode").then(({ Html5Qrcode }) => {
      if (!mounted) return;

      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText: string) => {
            // Extract token from URL if QR encodes a full URL
            let token = decodedText;
            try {
              const url = new URL(decodedText);
              const t = url.searchParams.get("token");
              if (t) token = t;
            } catch {
              // Not a URL — use raw text as token
            }
            isRunningRef.current = false;
            scanner.stop().catch(() => {});
            onScan(token);
          },
          () => {} // ignore per-frame errors
        )
        .then(() => {
          isRunningRef.current = true;
        })
        .catch((err: Error) => {
          if (mounted) setError(String(err));
        });
    });

    return () => {
      mounted = false;
      if (scannerRef.current && isRunningRef.current) {
        isRunningRef.current = false;
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-lg">📷</span>
            <h3 className="font-semibold text-slate-800">Scan QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Scanner */}
        <div className="p-4">
          <div
            id={containerId}
            className="rounded-xl overflow-hidden min-h-64 bg-slate-100"
          />
          {error ? (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-red-600 text-sm font-medium">Camera access denied</p>
              <p className="text-red-400 text-xs mt-1">
                Please allow camera access in your browser, then try again.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center mt-3">
              Point your camera at the QR code displayed by your lecturer.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
import { Suspense } from "react";
import ScanClient from "./ScanClient";

export default function ScanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <span className="text-3xl">📱</span>
            </div>
            <h2 className="text-lg font-semibold text-slate-800">Loading...</h2>
          </div>
        </div>
      }
    >
      <ScanClient />
    </Suspense>
  );
}
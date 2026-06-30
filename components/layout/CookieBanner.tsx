"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";

export const CookieBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(true);
  const pathname = usePathname();

  if (!showBanner || pathname.startsWith("/admin") || pathname.startsWith("/user") || pathname.startsWith("/login")) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-cream-dark shadow-[0_-4px_20px_rgba(0,0,0,0.05)] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slideUp">
      <div className="text-sm text-text-dark/90 leading-relaxed max-w-4xl">
        We use cookies on our website to see how you interact with it. By accepting, you agree to our use of such cookies.{" "}
        <a href="#" className="underline text-deep-teal font-medium hover:text-teal-dark">Privacy Policy</a>
      </div>
      
      <div className="flex items-center gap-3 self-end md:self-auto">
        <button 
          onClick={() => setShowBanner(false)}
          className="text-xs font-semibold text-text-muted hover:text-text-dark underline transition-colors px-3 py-2"
        >
          Settings
        </button>
        <button 
          onClick={() => setShowBanner(false)}
          className="text-xs font-semibold border border-text-dark/35 px-4 py-2 rounded hover:bg-cream-dark transition-all"
        >
          Decline All
        </button>
        <button 
          onClick={() => setShowBanner(false)}
          className="text-xs font-bold bg-black text-white px-5 py-2.5 rounded hover:bg-zinc-800 transition-all shadow-sm"
        >
          Accept
        </button>
        
        <button 
          onClick={() => setShowBanner(false)}
          className="p-1 text-text-muted hover:text-text-dark transition-colors shrink-0 ml-1"
          aria-label="Close Warning"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
export default CookieBanner;

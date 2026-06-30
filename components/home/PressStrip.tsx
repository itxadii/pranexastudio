import React from "react";

export const PressStrip: React.FC = () => {
  return (
    <section className="w-full bg-[#FAF8F5] py-12 border-b border-cream-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        
        {/* Logo: The Quint */}
        <div className="flex items-center gap-1.5 font-serif font-bold text-xl tracking-tight text-text-dark">
          <span className="w-5 h-5 bg-[#FFCC00] rounded-sm transform rotate-12 flex items-center justify-center text-[10px] text-black font-sans">Q</span>
          <span>the quint</span>
        </div>

        {/* Logo: Mid-Day */}
        <div className="font-sans font-extrabold text-2xl tracking-tighter text-blue-900 italic">
          mid<span className="text-[#E31E24]">-</span>day
        </div>

        {/* Logo: The Indian Express */}
        <div className="flex flex-col items-center leading-none">
          <span className="font-serif italic text-[10px] tracking-widest uppercase">Journalism of Courage</span>
          <span className="font-serif font-black text-lg tracking-wide uppercase mt-0.5">The Indian Express</span>
        </div>

        {/* Logo: Indian Express Indi */}
        <div className="font-serif font-black text-2xl tracking-tight uppercase border-l-4 border-black pl-2">
          INDI
        </div>

      </div>
    </section>
  );
};
export default PressStrip;

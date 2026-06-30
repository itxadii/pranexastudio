import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AtHomePage() {
  const library = [
    { title: "Morning Energizing Vinyasa", level: "Intermediate", duration: "45 Mins", image: "/images/event_shakti.png" },
    { title: "Calming Pranayama Practices", level: "All Levels", duration: "20 Mins", image: "/images/ira_story.png" },
    { title: "Deep Restorative Yin Stretch", level: "Beginner Friendly", duration: "60 Mins", image: "/images/event_yin.png" },
    { title: "Guided Meditation for Anxiety", level: "All Levels", duration: "15 Mins", image: "/images/event_shakti.png" }
  ];

  return (
    <div className="bg-[#FAF8F5] py-16 lg:py-24 animate-fadeIn flex-grow">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-rose">Learn From Anywhere</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-deep-teal mt-3 mb-6">
            At Home with Ira
          </h1>
          <div className="w-24 h-[1.5px] bg-deep-teal mx-auto mb-6"></div>
          <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Practice at your own pace. Access our complete library of high-definition pre-recorded yoga classes, pranayama guidance, and meditation courses led by Ira Trivedi.
          </p>
        </div>

        {/* Catalog intro */}
        <div className="bg-deep-teal text-white rounded-2xl p-8 lg:p-12 mb-20 shadow-md flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-4 max-w-lg">
            <span className="text-xs uppercase tracking-widest text-logo-gold font-semibold">Unlimited Access</span>
            <h2 className="font-serif text-3xl font-bold">Yog Love Online Membership</h2>
            <p className="text-warm-cream/80 text-sm leading-relaxed font-light">
              Get unlimited 24/7 access to over 150+ video sessions, monthly live QA workshops with Ira, and curated structured study paths for a small monthly contribution.
            </p>
          </div>
          <div className="shrink-0 space-y-3 text-center">
            <span className="text-2xl font-bold block text-logo-gold">$19 / month</span>
            <Link href="/contact">
              <Button variant="white">Start 7-day Free Trial</Button>
            </Link>
          </div>
        </div>

        {/* Video grid */}
        <h2 className="font-serif text-3xl font-bold text-deep-teal text-center mb-10">Popular On-Demand Videos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {library.map((video, idx) => (
            <div key={idx} className="bg-white border border-cream-dark rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between">
              <div className="relative h-44 w-full overflow-hidden">
                <Image 
                  src={video.image} 
                  alt={video.title} 
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {/* Play Icon */}
                  <span className="w-12 h-12 bg-white/90 text-deep-teal rounded-full flex items-center justify-center text-xl shadow">&#9654;</span>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                <h4 className="font-bold text-text-dark text-[15px] leading-snug group-hover:text-deep-teal transition-colors">{video.title}</h4>
                <div className="flex justify-between items-center text-xs text-text-muted font-medium border-t border-cream-dark/50 pt-2.5">
                  <span>{video.level}</span>
                  <span>{video.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function RetreatsPage() {
  const retreats = [
    {
      title: "Goa Wellness & Beach Retreat",
      date: "October 12 - October 18, 2026",
      location: "South Goa, Beachfront Resort",
      desc: "Immerse yourself in yoga, meditation, sound healing, and Ayurvedic therapies right on the sandy shores of South Goa. Experience daily morning Vinyasa flows and evening restorative sessions guided by Ira Trivedi.",
      image: "/images/ira_story.png",
      price: "$1,499 / person"
    },
    {
      title: "Himalayan Yoga & Meditation Escape",
      date: "December 04 - December 10, 2026",
      location: "Rishikesh, Foothills of the Himalayas",
      desc: "Reconnect with your inner self in the spiritual capital of the world. This intensive retreat offers classical Hatha practice, pranayama by the Ganges river, and guided silent treks in nature.",
      image: "/images/event_shakti.png",
      price: "$1,650 / person"
    }
  ];

  return (
    <div className="bg-[#FAF8F5] py-16 lg:py-24 animate-fadeIn flex-grow">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-rose">Wellness Travel</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-deep-teal mt-3 mb-6">
            Yoga Retreats
          </h1>
          <div className="w-24 h-[1.5px] bg-deep-teal mx-auto mb-6"></div>
          <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Step away from the distractions of daily life. Join our immersive yoga retreats designed to rest, restore, and inspire.
          </p>
        </div>

        {/* List of Retreats */}
        <div className="space-y-16 lg:space-y-24">
          {retreats.map((retreat, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div 
                key={idx} 
                className={`grid grid-cols-1 lg:grid-cols-12 gap-12 items-center border-b border-cream-dark/60 pb-16 lg:pb-24 last:border-b-0`}
              >
                {/* Image Column */}
                <div className={`relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden shadow-md lg:col-span-6 ${
                  isEven ? "lg:order-1" : "lg:order-2"
                }`}>
                  <Image 
                    src={retreat.image} 
                    alt={retreat.title} 
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/15 to-transparent"></div>
                </div>

                {/* Text Content Column */}
                <div className={`space-y-6 lg:col-span-6 ${
                  isEven ? "lg:order-2" : "lg:order-1"
                }`}>
                  <span className="text-xs uppercase tracking-wider text-terracotta-rose font-bold block">{retreat.date}</span>
                  <h2 className="font-serif text-3xl lg:text-4xl font-bold text-deep-teal leading-tight">{retreat.title}</h2>
                  <p className="font-medium text-text-dark text-sm tracking-wide uppercase flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-terracotta-rose">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {retreat.location}
                  </p>
                  <p className="text-text-muted text-[16px] leading-relaxed font-light">
                    {retreat.desc}
                  </p>
                  <div className="pt-4 flex items-center justify-between gap-6 flex-wrap">
                    <div>
                      <span className="text-[11px] text-text-muted block uppercase tracking-wider font-semibold">Package Price</span>
                      <span className="text-xl font-bold text-deep-teal">{retreat.price}</span>
                    </div>
                    <Link href="/contact">
                      <Button variant="secondary">Inquire / Book</Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

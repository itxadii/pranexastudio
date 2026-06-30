import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";

export const EventsSection: React.FC = () => {
  const events = [
    {
      title: "SHAKTI Breathwork with IRA TRIVEDI",
      dateInfo: "Sun, 05 Jul | Yoglove Studio, Shah House",
      image: "/images/event_shakti.png",
      alt: "SHAKTI Breathwork session"
    },
    {
      title: "Yin Yoga Teacher Training Course",
      dateInfo: "Sat, 25 Jul | Zoom",
      image: "/images/event_yin.png",
      alt: "Yin Yoga pose in studio"
    }
  ];

  return (
    <section className="w-full bg-deep-teal py-20 lg:py-32 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col items-center">
        
        <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight text-center relative mb-16">
          Upcoming Events
          <span className="block w-24 h-[1px] bg-white/40 mx-auto mt-4"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 w-full max-w-6xl">
          {events.map((event, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              <div className="relative h-64 lg:h-80 overflow-hidden w-full">
                <Image 
                  src={event.image} 
                  alt={event.alt} 
                  fill 
                  className="object-cover transition-transform duration-500 group-hover:scale-102"
                />
              </div>
              <div className="p-8 bg-warm-cream text-text-dark text-center flex-1 flex flex-col justify-center items-center">
                <h3 className="font-sans text-xl lg:text-2xl font-bold tracking-tight text-text-dark/90 leading-tight">
                  {event.title}
                </h3>
                <p className="mt-3 text-text-muted text-sm tracking-wider font-semibold">
                  {event.dateInfo}
                </p>
                <Link href="/contact" className="mt-6">
                  <Button variant="secondary" size="sm">
                    Register Now
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
export default EventsSection;

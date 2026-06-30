import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/Button";

export const StorySection: React.FC = () => {
  return (
    <section id="about" className="w-full bg-[#FAF8F5] py-20 lg:py-32 border-b border-cream-dark scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column: Image */}
        <div className="relative h-[380px] sm:h-[480px] lg:h-[580px] rounded-2xl overflow-hidden shadow-md group">
          <Image 
            src="/images/ira_story.png" 
            alt="Ira Trivedi meditating on beach" 
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/10 to-transparent"></div>
        </div>

        {/* Right Column: Story text */}
        <div className="space-y-8">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-rose">Our Philosophy</span>
          <div className="relative pb-2 inline-block">
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-deep-teal leading-tight">
              Our story
            </h2>
            <div className="w-16 h-[2px] bg-deep-teal mt-3"></div>
          </div>
          
          <div className="space-y-6 text-text-muted text-[17px] leading-relaxed font-light">
            <p className="font-medium text-text-dark text-[18px]">
              Yoglove is dedicated to delivering comprehensive wellness services to individuals and companies worldwide.
            </p>
            <p>
              Our offerings encompass both online and offline yoga programming and education, all led by the esteemed Ira Trivedi, a prominent figure in the yoga and wellness community in India.
            </p>
            <p>
              Founded by Ira Trivedi, a best-selling author and Yoga Acharya, Yoglove is built on a foundation of extensive expertise and passion. We believe that yoga is not just an exercise, but a path to deep mental, physical, and spiritual connection.
            </p>
          </div>
          <div className="pt-4">
            <Link href="/about">
              <Button variant="secondary">Read Full Story</Button>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
export default StorySection;

import React from "react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-[#FAF8F5] py-16 lg:py-24 animate-fadeIn flex-grow">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Breadcrumb / Title */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-rose">Who We Are</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-deep-teal mt-3 mb-6">
            Our story
          </h1>
          <div className="w-24 h-[1.5px] bg-deep-teal mx-auto"></div>
        </div>

        {/* Hero image for the about page */}
        <div className="relative h-[300px] sm:h-[450px] rounded-2xl overflow-hidden shadow-md mb-16">
          <Image 
            src="/images/ira_story.png" 
            alt="Ira Trivedi meditating on a beach" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/20 to-transparent"></div>
        </div>

        {/* Body content */}
        <div className="prose prose-lg max-w-none text-text-muted space-y-8 leading-relaxed font-light text-[17px]">
          
          <p className="font-medium text-text-dark text-xl leading-relaxed">
            Yoglove is dedicated to delivering comprehensive wellness services to individuals and companies worldwide. Founded by Ira Trivedi, our goal is to share the ancient wisdom of yoga in a modern, accessible context.
          </p>

          <p>
            Our offerings encompass both online and offline yoga programming and education, all led by the esteemed Ira Trivedi, a prominent figure in the yoga and wellness community in India. We aim to guide individuals towards balanced lifestyles, enhanced productivity, and profound self-knowledge.
          </p>

          <blockquote className="border-l-4 border-terracotta-rose pl-6 my-10 italic text-text-dark font-serif text-2xl font-light">
            &ldquo;Yoga is not about self-improvement; it is about self-acceptance. It is a path that leads us back to our true nature of peace and harmony.&rdquo;
            <span className="block text-sm font-sans font-semibold tracking-wider text-terracotta-rose uppercase mt-3 not-italic">— Ira Trivedi, Founder</span>
          </blockquote>

          <h2 className="font-serif text-3xl font-bold text-deep-teal pt-6">About Ira Trivedi</h2>
          <p>
            Ira Trivedi is a best-selling author, columnist, and Yoga Acharya. She is a graduate of Wellesley College and holds an MBA from Columbia Business School. Ira is also the recipient of several national and international awards for her writings and her work in wellness.
          </p>
          <p>
            With over a decade of teaching experience, Ira has led major yoga gatherings worldwide, including the prestigious International Day of Yoga programs in India and abroad. Her approach blends traditional alignment principles with fluid, breath-based flows suitable for all experience levels.
          </p>

          <h2 className="font-serif text-3xl font-bold text-deep-teal pt-6">Our Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
            <div className="bg-cream-dark/30 p-6 rounded-lg border border-cream-dark">
              <h3 className="font-sans font-bold text-text-dark text-lg mb-2">Authenticity</h3>
              <p className="text-sm">We honor the original roots of classical Hatha and Vinyasa systems without adding unnecessary gimmicks.</p>
            </div>
            <div className="bg-cream-dark/30 p-6 rounded-lg border border-cream-dark">
              <h3 className="font-sans font-bold text-text-dark text-lg mb-2">Inclusivity</h3>
              <p className="text-sm">Yoga is for everybody, regardless of age, body type, flexibility, or physical limitations.</p>
            </div>
            <div className="bg-cream-dark/30 p-6 rounded-lg border border-cream-dark">
              <h3 className="font-sans font-bold text-text-dark text-lg mb-2">Community</h3>
              <p className="text-sm">We believe wellness is shared. We nurture an open, warm, and supportive global community of practitioners.</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

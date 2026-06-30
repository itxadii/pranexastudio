import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function AcademyPage() {
  const courses = [
    {
      title: "200-Hour Teacher Training Course (TTC)",
      duration: "4 Weeks | Intensive",
      credentials: "Yoga Alliance Certified",
      desc: "Our flagship program designed to give you a solid foundation in yoga history, philosophy, anatomy, and sequencing. Perfect for aspiring teachers or deep practitioners.",
      price: "$1,200"
    },
    {
      title: "300-Hour Advanced Yoga Teacher Training",
      duration: "6 Weeks | Advanced",
      credentials: "Yoga Alliance Certified",
      desc: "Take your teaching to the next level. This course focuses on advanced sequencing, therapeutic adjustments, philosophy of the Upanishads, and building a professional brand.",
      price: "$1,800"
    },
    {
      title: "Breathwork & Meditation Certification",
      duration: "10 Days | Specialization",
      credentials: "Yog Love Academy Diploma",
      desc: "Dive deep into the science of Pranayama. Learn breath control techniques (Shakti Breathwork) to calm the nervous system and lead public meditation sessions.",
      price: "$450"
    }
  ];

  return (
    <div className="bg-[#FAF8F5] py-16 lg:py-24 animate-fadeIn flex-grow">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-rose">Certified Education</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-deep-teal mt-3 mb-6">
            Yoga Academy
          </h1>
          <div className="w-24 h-[1.5px] bg-deep-teal mx-auto mb-6"></div>
          <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Become a certified teacher or deepen your personal practice under the direct mentorship of Ira Trivedi and our team of senior Yoga Acharyas.
          </p>
        </div>

        {/* Highlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-deep-teal text-white rounded-2xl p-8 lg:p-12 mb-20 shadow-md">
          <div className="relative h-64 lg:h-96 rounded-xl overflow-hidden shadow-inner">
            <Image 
              src="/images/event_yin.png" 
              alt="Yin yoga training" 
              fill
              className="object-cover"
            />
          </div>
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-logo-gold font-semibold">Global Standards</span>
            <h2 className="font-serif text-3xl lg:text-4xl font-bold leading-tight">Yoga Alliance USA Registry</h2>
            <p className="text-warm-cream/80 text-[16px] leading-relaxed font-light">
              Yog Love Academy is a Registered Yoga School (RYS) with the Yoga Alliance. Upon successful completion of our 200-Hour or 300-Hour Teacher Training programs, you will receive a internationally recognized credential enabling you to teach yoga anywhere in the world.
            </p>
            <ul className="space-y-3 text-sm text-warm-cream/90 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-logo-gold">✓</span> Comprehensive Anatomy & Physiology
              </li>
              <li className="flex items-center gap-2">
                <span className="text-logo-gold">✓</span> Sanskrit Terminology & Scriptural Studies
              </li>
              <li className="flex items-center gap-2">
                <span className="text-logo-gold">✓</span> Teaching Methodology & Business Ethics
              </li>
            </ul>
          </div>
        </div>

        {/* Courses Section */}
        <h2 className="font-serif text-3xl lg:text-4xl font-bold text-deep-teal text-center mb-12">Our Programs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, idx) => (
            <div key={idx} className="bg-white border border-cream-dark rounded-xl p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider text-terracotta-rose font-bold block">{course.duration}</span>
                <h3 className="font-serif text-2xl font-bold text-text-dark leading-snug">{course.title}</h3>
                <span className="inline-block bg-cream-dark/40 text-[11px] px-3 py-1 rounded text-text-muted font-semibold tracking-wider uppercase">{course.credentials}</span>
                <p className="text-text-muted text-sm leading-relaxed font-light pt-2">{course.desc}</p>
              </div>
              <div className="pt-8 border-t border-cream-dark/50 mt-6 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-text-muted block uppercase tracking-wider font-semibold">Tution Fees</span>
                  <span className="text-xl font-bold text-deep-teal">{course.price}</span>
                </div>
                <Link href="/contact">
                  <Button variant="secondary" size="sm">Enroll Now</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function StudioPage() {
  const classes = [
    { time: "07:00 AM - 08:15 AM", name: "Traditional Hatha Flow", level: "All Levels", teacher: "Senior Instructor" },
    { time: "08:30 AM - 09:30 AM", name: "Dynamic Vinyasa", level: "Intermediate", teacher: "Ira Trivedi" },
    { time: "11:00 AM - 12:00 PM", name: "Pranayama & Meditation", level: "All Levels", teacher: "Ira Trivedi" },
    { time: "05:30 PM - 06:45 PM", name: "Yin Yoga & Deep Stretch", level: "Beginner Friendly", teacher: "Senior Instructor" },
    { time: "07:00 PM - 08:00 PM", name: "Ashtanga Primary Series", level: "Advanced", teacher: "Senior Instructor" }
  ];

  return (
    <div className="bg-[#FAF8F5] py-16 lg:py-24 animate-fadeIn flex-grow">
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-rose">Our Physical Sanctuary</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-deep-teal mt-3 mb-6">
            Mumbai Studio
          </h1>
          <div className="w-24 h-[1.5px] bg-deep-teal mx-auto mb-6"></div>
          <p className="text-text-muted max-w-2xl mx-auto text-lg leading-relaxed font-light">
            Practice in our beautiful, state-of-the-art sea-side studio located in the heart of Mumbai, offering a serene escape from the bustling city.
          </p>
        </div>

        {/* Studio Image & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div className="relative h-[350px] sm:h-[450px] rounded-2xl overflow-hidden shadow-md">
            <Image 
              src="/images/event_shakti.png" 
              alt="Yog Love Mumbai Studio interior view" 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/10 to-transparent"></div>
          </div>
          <div className="space-y-6">
            <h2 className="font-serif text-3xl font-bold text-deep-teal leading-tight">Sea-Side Serenity</h2>
            <p className="text-text-muted text-[16px] leading-relaxed font-light">
              Yog Love Studio is situated on the waterfront in Mumbai, designed specifically to capture natural light and sea breezes. The space features organic wooden flooring, acoustic insulation, and an ambient lighting system created to support deep states of relaxation.
            </p>
            <div className="space-y-4 pt-2">
              <div className="flex gap-3">
                <span className="text-terracotta-rose font-bold">✓</span>
                <div>
                  <h4 className="font-bold text-text-dark text-[15px]">Fully Equipped</h4>
                  <p className="text-xs text-text-muted">Premium yoga mats, organic cotton blocks, straps, and clean changing rooms are provided.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-terracotta-rose font-bold">✓</span>
                <div>
                  <h4 className="font-bold text-text-dark text-[15px]">Stunning Sea View</h4>
                  <p className="text-xs text-text-muted">Overlooks the Arabian Sea, allowing you to watch the sunset during evening class meditation.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white border border-cream-dark rounded-2xl p-8 lg:p-12 shadow-sm mb-20">
          <h2 className="font-serif text-3xl font-bold text-deep-teal text-center mb-8">Daily Class Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-cream-dark text-xs uppercase tracking-wider text-text-muted font-bold">
                  <th className="py-4">Time Slot</th>
                  <th className="py-4">Class Details</th>
                  <th className="py-4">Level</th>
                  <th className="py-4">Instructor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark/50 text-[15px] font-medium text-text-dark/95">
                {classes.map((cls, idx) => (
                  <tr key={idx} className="hover:bg-warm-cream/30 transition-colors">
                    <td className="py-5 font-mono text-sm text-text-muted">{cls.time}</td>
                    <td className="py-5 font-semibold text-deep-teal">{cls.name}</td>
                    <td className="py-5 text-sm">{cls.level}</td>
                    <td className="py-5 text-sm">{cls.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Address and CTA */}
        <div className="bg-deep-teal text-white rounded-2xl p-8 lg:p-12 text-center space-y-6 max-w-3xl mx-auto shadow-md">
          <h3 className="font-serif text-3xl font-bold">Visit the Studio</h3>
          <p className="text-warm-cream/80 max-w-md mx-auto text-sm leading-relaxed">
            Shah House, 4th Floor, Netaji Subhash Chandra Bose Rd, Marine Drive, Mumbai, Maharashtra 400020
          </p>
          <div className="pt-2">
            <Link href="/contact">
              <Button variant="white">Book a Trial Class</Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

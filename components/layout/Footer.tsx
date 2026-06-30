"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export const Footer: React.FC = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname.startsWith("/user") || pathname.startsWith("/login")) {
    return null;
  }

  return (
    <footer className="bg-warm-cream border-t border-cream-dark py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 items-start">
        
        {/* Logo & Contact Pill Column */}
        <div className="lg:col-span-2 flex flex-col gap-6 items-start">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-logo-gold rounded-full flex items-center justify-center shadow-inner overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="Yog Love Logo" 
                fill 
                className="object-cover p-0.5"
              />
            </div>
            <span className="font-serif font-bold text-xl tracking-wide text-deep-teal">Yog Love</span>
          </div>
          
          <p className="text-text-muted text-sm max-w-sm leading-relaxed">
            Spreading harmony, health, and holistic yoga knowledge. Join our world-class academy and start your journey of wellness.
          </p>

          <Link 
            href="/contact" 
            className="flex items-center gap-3 bg-deep-teal hover:bg-teal-dark text-white pl-3 pr-6 py-2.5 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 shadow-sm"
          >
            <div className="w-7 h-7 bg-logo-gold rounded-full flex items-center justify-center overflow-hidden">
              <Image 
                src="/images/logo.png" 
                alt="Contact Icon" 
                width={20} 
                height={20}
                className="object-cover"
              />
            </div>
            Contact Us
          </Link>
        </div>

        {/* Links Column 1: Academy */}
        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-terracotta-rose">Academy</h4>
          <ul className="space-y-2.5 text-[15px] font-medium text-text-dark/80">
            <li><Link href="/academy" className="hover:text-deep-teal transition-colors">Teacher Training</Link></li>
            <li><Link href="/academy" className="hover:text-deep-teal transition-colors">Foundation Courses</Link></li>
            <li><Link href="/academy" className="hover:text-deep-teal transition-colors">Meditation & Pranayama</Link></li>
            <li><Link href="/academy" className="hover:text-deep-teal transition-colors">Advanced Workshops</Link></li>
          </ul>
        </div>

        {/* Links Column 2: Retreats */}
        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-terracotta-rose">Retreats</h4>
          <ul className="space-y-2.5 text-[15px] font-medium text-text-dark/80">
            <li><Link href="/retreats" className="hover:text-deep-teal transition-colors">Goa Beach Retreat</Link></li>
            <li><Link href="/retreats" className="hover:text-deep-teal transition-colors">Himalayan Yoga Escape</Link></li>
            <li><Link href="/retreats" className="hover:text-deep-teal transition-colors">Weekend Wellness</Link></li>
            <li><Link href="/retreats" className="hover:text-deep-teal transition-colors">Custom Group Trips</Link></li>
          </ul>
        </div>

        {/* Links Column 3: Contact Info */}
        <div className="space-y-4">
          <h4 className="font-sans font-bold text-xs uppercase tracking-[0.2em] text-terracotta-rose">Contact</h4>
          <ul className="space-y-2.5 text-[14px] text-text-muted leading-relaxed">
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-deep-teal shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>Yoglove Studio, Shah House, Mumbai, India</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-deep-teal shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.14-4.117-6.94-6.94l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-deep-teal shrink-0">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25H4.5A2.25 2.25 0 0 1 2.25 17.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5H4.5a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
              <span>info@yoglove.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Copyright strip */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-cream-dark flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-text-muted">
        <p>© {new Date().getFullYear()} Yog Love. All Rights Reserved. Designed for premium yoga experiences.</p>
        <div className="flex gap-6">
          <Link href="/about" className="hover:text-deep-teal transition-colors">Privacy Policy</Link>
          <Link href="/about" className="hover:text-deep-teal transition-colors">Terms of Service</Link>
          <Link href="/about" className="hover:text-deep-teal transition-colors">Cookie Settings</Link>
        </div>
      </div>
    </footer>
  );
};
export default Footer;

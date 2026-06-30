import React from "react";
import ContactForm from "@/components/home/ContactForm";

export default function ContactPage() {
  return (
    <div className="bg-[#FAF8F5] py-16 lg:py-24 animate-fadeIn flex-grow">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Title / Description */}
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-terracotta-rose">Get In Touch</span>
          <h1 className="font-serif text-5xl lg:text-6xl font-bold text-deep-teal mt-3 mb-6">
            Contact Us
          </h1>
          <div className="w-24 h-[1.5px] bg-deep-teal mx-auto mb-6"></div>
          <p className="text-text-muted max-w-xl mx-auto text-[16px] leading-relaxed font-light">
            Have questions about our certification courses, retreats, or studio membership plans? Send us a message and our team will support you.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-cream-dark rounded-2xl p-8 lg:p-12 shadow-sm mb-16">
          <ContactForm minimal={true} />
        </div>

        {/* Secondary Contact Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left text-sm leading-relaxed text-text-muted">
          <div className="bg-cream-dark/20 p-6 rounded-xl border border-cream-dark/50 space-y-2">
            <h4 className="font-bold text-text-dark">Email Inquiries</h4>
            <p>General: info@yoglove.com</p>
            <p>Academy: academy@yoglove.com</p>
          </div>
          <div className="bg-cream-dark/20 p-6 rounded-xl border border-cream-dark/50 space-y-2">
            <h4 className="font-bold text-text-dark">Phone Numbers</h4>
            <p>Main Studio: +91 98765 43210</p>
            <p>TTC Helpline: +91 98765 01234</p>
          </div>
          <div className="bg-cream-dark/20 p-6 rounded-xl border border-cream-dark/50 space-y-2">
            <h4 className="font-bold text-text-dark">Studio Hours</h4>
            <p>Mon - Fri: 06:30 AM - 08:30 PM</p>
            <p>Sat - Sun: 07:30 AM - 06:00 PM</p>
          </div>
        </div>

      </div>
    </div>
  );
}

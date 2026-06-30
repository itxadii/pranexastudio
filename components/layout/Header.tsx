"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "../ui/Button";

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide header on portal and login pages
  if (
    pathname.startsWith("/admin") || 
    pathname.startsWith("/trainer") || 
    pathname.startsWith("/customer") || 
    pathname.startsWith("/login")
  ) {
    return null;
  }

  // Simplified navigation showing only Pricing and About Us
  const navLinks = [
    { label: "Pricing", href: "/#pricing" },
    { label: "About Us", href: "/about" }
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-50 bg-warm-cream/90 backdrop-blur-md border-b border-cream-dark transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-12 h-12 bg-logo-gold rounded-full flex items-center justify-center shadow-sm overflow-hidden transition-transform group-hover:scale-105 duration-300">
            <Image 
              src="/images/logo.png" 
              alt="Yog Love Logo" 
              fill 
              className="object-cover p-1"
              priority
            />
          </div>
          <span className="font-serif font-bold text-2xl tracking-wide text-deep-teal">Yog Love</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-8 font-medium text-[15px] text-text-dark/95">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href}
              className={`hover-underline-animation py-2 transition-colors hover:text-deep-teal ${
                isActive(link.href) ? "text-deep-teal font-semibold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User Log In */}
        <div className="hidden lg:block">
          <Link href="/login">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Log In
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-text-dark hover:text-deep-teal transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-cream-dark bg-warm-cream py-6 px-8 flex flex-col gap-6 shadow-inner animate-fadeIn">
          <nav className="flex flex-col gap-4 font-medium text-lg">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`py-1 hover:text-deep-teal ${isActive(link.href) ? "text-deep-teal font-semibold" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
            <Button variant="outline" className="w-full justify-center flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              Log In
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
};
export default Header;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function HomePage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const needsList = [
    {
      title: "Yoga for Flexibility & Strength",
      description: "Build lean muscle, increase mobility, and improve joint health with targeted posture sequences.",
      icon: "🧘‍♀️"
    },
    {
      title: "Yoga for Pain Relief",
      description: "Ease back pain, neck tension, shoulder stiffness, and joint aches naturally through therapeutic yoga.",
      icon: "🌱"
    },
    {
      title: "Yoga for Stress, Anxiety & Meditation",
      description: "Find your quiet center with guided breathing, calming meditation, and restorative mindful movement.",
      icon: "✨"
    },
    {
      title: "Prenatal & Postnatal Yoga",
      description: "Safe, supportive practices to support pregnancy, pelvic health, fertility, and postpartum strength.",
      icon: "👶"
    },
    {
      title: "Yoga for Weight Loss & Metabolism",
      description: "Active, energizing practices designed to build heat, improve circulation, and build core stability.",
      icon: "🔥"
    },
    {
      title: "Yoga for Seniors & Mobility",
      description: "Gentle chair-assisted options and sequence flows to preserve balance, coordination, and vitality.",
      icon: "☀️"
    }
  ];

  const teachers = [
    {
      name: "Zaeem",
      role: "PhD in Yogic Science & Fitness Coach",
      specialty: "Strength & Flexibility",
      rating: "4.9",
      reviews: "1,174 reviews",
      bio: "Focuses on posture alignments, bio-mechanics, and deep strength sequences."
    },
    {
      name: "Meenu B",
      role: "Certified Nutritionist & Wellness Coach",
      specialty: "Nutrition & Flow",
      rating: "4.9",
      reviews: "82 reviews",
      bio: "Helps you align mind, body, and nutrition for holistic health goals."
    },
    {
      name: "Sujit",
      role: "Masters in Yoga & Asana Champion",
      specialty: "Strength & Endurance",
      rating: "4.9",
      reviews: "1,676 reviews",
      bio: "Inspires you to challenge limits safely with focus, breathwork, and deep stretches."
    },
    {
      name: "Dr. Kaviya",
      role: "Therapeutic Yoga Coach & Naturopath",
      specialty: "Hormonal Health",
      rating: "4.9",
      reviews: "84 reviews",
      bio: "Specializes in endocrine balance, stress management, and medical yoga therapy."
    },
    {
      name: "Supriya",
      role: "Mind-Body Wellness Coach",
      specialty: "Stress Relief & Nidra",
      rating: "4.9",
      reviews: "67 reviews",
      bio: "Guides you through peaceful sequences and yoga nidra to calm active minds."
    },
    {
      name: "Sunny",
      role: "Muscle & Joint Pain Specialist",
      specialty: "Pain Relief Therapy",
      rating: "4.7",
      reviews: "8 reviews",
      bio: "Gentle recovery stretches tailored to alleviate shoulder, hip, and back stiffness."
    }
  ];

  const faqs = [
    {
      q: "Can the teacher see me well enough over Zoom/Google Meet?",
      a: "Yes, absolutely! Our expert instructors are trained to audit postures, camera placements, and skeletal angles. By joining with your camera on, your teacher can guide your adjustments, alignment, and breathing live, just like an in-person class."
    },
    {
      q: "How do I join my free online yoga class?",
      a: "Simply click 'Book a free session' below to sign up. Once registered, you will receive your live stream link via email. Just click the link when it's class time to connect instantly."
    },
    {
      q: "Are online yoga classes suitable for beginners?",
      a: "Yes! In fact, they are perfect for beginners. You practice from the comfort and privacy of your home with zero pressure or judgment. Our trainers customize poses to match your flexibility levels."
    },
    {
      q: "What equipment do I need for online yoga sessions?",
      a: "All you need is a yoga mat and an internet-connected device (laptop, tablet, or phone) with a camera. Optional blocks or a strap can be helpful, but household items like pillows or a towel work great too."
    },
    {
      q: "How are live online classes different from pre-recorded videos?",
      a: "Pre-recorded videos cannot see you. In our live classes, you get real-time corrections, posture assessments, and answers to your questions, which prevents injury and ensures a consistent practice."
    },
    {
      q: "Why choose Pranexa Studio over hiring a teacher directly?",
      a: "We pre-screen and verify certified expert instructors, handle scheduling, automate Google Meet/Zoom links, and manage subscription extensions. If your teacher is ever on leave, you can seamlessly book a substitute without interrupting your routine."
    }
  ];

  return (
    <div className="flex flex-col w-full text-text-dark bg-[#FCFAF7] font-sans antialiased">
      
      {/* 1. Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-warm-cream/30 via-white to-warm-cream/10 pt-20 pb-12 overflow-hidden border-b border-cream-dark/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-deep-teal/10 border border-deep-teal/20 text-deep-teal text-xs font-bold uppercase tracking-wider">
              ✨ Rooted in Authentic Indian Yoga Traditions
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-text-dark leading-[1.1] tracking-tight">
              Online Yoga Classes with Expert <span className="text-deep-teal">Indian Teachers</span> — Live!
            </h1>
            <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-2xl">
              1-on-1 personalized programs and small group sessions tailored to your physical goals. Practice live with real-time posture adjustments and breathing guidance. Available 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link 
                href="/login"
                className="px-8 py-4 rounded-full bg-logo-gold hover:bg-logo-gold/90 text-text-dark font-bold text-center transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 text-sm"
              >
                Book a Free Session
              </Link>
              <Link 
                href="/contact"
                className="px-8 py-4 rounded-full border border-text-dark/20 text-text-dark hover:bg-cream-dark/30 font-bold text-center transition-all text-sm"
              >
                Contact Support
              </Link>
            </div>
            <p className="text-xs text-text-muted/80 flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-green-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
              No credit card required to start
            </p>
          </div>

          <div className="lg:col-span-5 relative flex justify-center w-full">
            {/* Visual card */}
            <div className="relative w-full max-w-[400px] aspect-[4/5] bg-white rounded-3xl p-3 border border-cream-dark shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden flex flex-col">
              <div className="relative flex-grow rounded-2xl overflow-hidden bg-warm-cream/20">
                <Image
                  src="/images/ira_story.png"
                  alt="Yoga Instructor Live Session"
                  fill
                  sizes="400px"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text-dark/80 via-text-dark/10 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-white/90 shadow-xs flex items-center justify-center font-bold text-deep-teal text-sm">
                    🧘
                  </div>
                  <Badge variant="success" className="font-bold shadow-xs">Live Now</Badge>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-logo-gold block">Master Trainer Live Session</span>
                  <h3 className="font-serif text-lg font-bold leading-tight">Ira — Posture & Alignment</h3>
                  <div className="flex items-center gap-2 text-[10px] text-white/80 pt-0.5">
                    <span className="font-semibold text-white">Trainer ID: #1092</span>
                    <span>•</span>
                    <span>60 mins Live</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Press Strip */}
      <section className="bg-white border-b border-cream-dark/30 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-6">As Featured & Recommended In</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-60 grayscale">
            <span className="font-serif font-black text-lg sm:text-xl">Men's Health</span>
            <span className="font-sans font-bold text-lg sm:text-xl tracking-tight">Woman's World</span>
            <span className="font-serif italic font-bold text-lg sm:text-xl">well+good</span>
            <span className="font-serif font-black text-lg sm:text-xl uppercase">Women's Health</span>
            <span className="font-sans font-black text-lg sm:text-xl tracking-widest">LA YOGA</span>
            <span className="font-sans font-black text-lg sm:text-xl lowercase">yahoo! life</span>
          </div>
        </div>
      </section>

      {/* 3. Testimonial Quotes Section */}
      <section className="py-20 bg-warm-cream/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark">See What It’s Like When Your Teacher Sees You</h2>
            <p className="text-sm text-text-muted max-w-2xl mx-auto">Read honest feedback from members who practice 1-on-1 with our trainers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <Card className="bg-white border border-cream-dark shadow-xs p-8 relative rounded-2xl">
              <span className="text-4xl text-deep-teal/20 font-serif absolute top-4 left-4">“</span>
              <div className="space-y-4 pt-4">
                <p className="text-sm sm:text-base text-text-dark leading-relaxed font-semibold italic">
                  "Amazing teacher. She assessed my flexibility and strength in each body part, helped me focus on the right areas, and safely adjusted my posture. I felt completely relaxed and refreshed after the stretches."
                </p>
                <div className="border-t border-cream-dark/50 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-deep-teal/10 flex items-center justify-center font-bold text-deep-teal text-sm">A</div>
                  <div>
                    <h5 className="font-bold text-sm text-text-dark">Anusha</h5>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Age 35, Student</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white border border-cream-dark shadow-xs p-8 relative rounded-2xl">
              <span className="text-4xl text-deep-teal/20 font-serif absolute top-4 left-4">“</span>
              <div className="space-y-4 pt-4">
                <p className="text-sm sm:text-base text-text-dark leading-relaxed font-semibold italic">
                  "I feel my coach is right there in the room with me. She can see when I take a breath, she can see when my alignment is not 100% correct, just as if she were here to physically adjust me."
                </p>
                <div className="border-t border-cream-dark/50 pt-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-deep-teal/10 flex items-center justify-center font-bold text-deep-teal text-sm">R</div>
                  <div>
                    <h5 className="font-bold text-sm text-text-dark">Rachel</h5>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Age 48, Student</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. For Your Unique Needs */}
      <section className="py-20 bg-white border-t border-b border-cream-dark/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark">For Your Unique Health Goals</h2>
            <p className="text-sm text-text-muted max-w-2xl mx-auto">Explore classes focused on specific health and wellness outcomes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {needsList.map((item, idx) => (
              <div 
                key={idx}
                className="p-8 border border-cream-dark rounded-2xl bg-white text-left hover:border-deep-teal/30 hover:shadow-md transition-all space-y-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-warm-cream/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-text-dark">{item.title}</h3>
                <p className="text-xs text-text-muted leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 1-on-1 vs Group classes */}
      <section className="py-20 bg-warm-cream/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* 1-on-1 card */}
          <div className="bg-white border border-cream-dark rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-6 bg-warm-cream/10 border border-cream-dark">
                <Image
                  src="/images/event_shakti.png"
                  alt="1-on-1 Private Coaching Session"
                  fill
                  sizes="500px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-logo-gold">Personal Attention</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-text-dark">1-on-1 Personal Coaching</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Our 1-on-1 sessions aren’t about judgment - they’re about support. Your teacher meets you where you are, helps you move safely, and celebrates every small win.
                </p>
                <ul className="space-y-2.5 pt-2">
                  {["No crowd, no judgment - just you and your teacher", "Gentle, guided sessions built just for you", "Ask questions freely - it's your time", "Connect live over Zoom or Google Meet"].map((li, idx) => (
                    <li key={idx} className="text-xs text-text-dark flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-deep-teal shrink-0" />
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-6">
              <Link 
                href="/login"
                className="w-full sm:w-auto inline-block px-8 py-3 rounded-full bg-deep-teal hover:bg-deep-teal/95 text-white text-xs font-bold text-center shadow-md transition-all"
              >
                Book a Free 1-on-1 Session
              </Link>
            </div>
          </div>

          {/* Group Classes card */}
          <div className="bg-white border border-cream-dark rounded-3xl p-8 sm:p-10 space-y-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="relative w-full h-52 rounded-2xl overflow-hidden mb-6 bg-warm-cream/10 border border-cream-dark">
                <Image
                  src="/images/event_yin.png"
                  alt="Live Group Yoga Practice"
                  fill
                  sizes="500px"
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-logo-gold">Community practice</span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-text-dark">Live Group Classes</h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Practice in interactive classes with other members of our worldwide yoga community. Learn together, build consistency, and stay inspired.
                </p>
                <ul className="space-y-2.5 pt-2">
                  {["Small groups for real connections", "Classes for every health goal and style", "Expert teachers guiding you every step", "Structured motivation and accountability"].map((li, idx) => (
                    <li key={idx} className="text-xs text-text-dark flex items-center gap-2 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-deep-teal shrink-0" />
                      {li}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="pt-6">
              <Link 
                href="/login"
                className="w-full sm:w-auto inline-block px-8 py-3 rounded-full bg-deep-teal hover:bg-deep-teal/95 text-white text-xs font-bold text-center shadow-md transition-all"
              >
                Join Live Group Classes
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Professional Trainers Grid */}
      <section className="py-20 bg-white border-t border-b border-cream-dark/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark">Learn Live from Certified Teachers</h2>
            <p className="text-sm text-text-muted max-w-2xl mx-auto">Rooted in original yoga traditions, our teachers are certified experts you can trust.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {teachers.map((t, idx) => (
              <div 
                key={idx}
                className="p-6 border border-cream-dark rounded-2xl bg-white text-left hover:border-logo-gold/30 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-text-dark">{t.name}</h4>
                      <span className="text-[10px] text-text-muted font-bold block">{t.role}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md text-[11px] font-bold text-yellow-700">
                      ★ {t.rating}
                    </div>
                  </div>
                  <p className="text-xs text-text-dark font-semibold">Specialty: {t.specialty}</p>
                  <p className="text-xs text-text-muted leading-relaxed pt-1">"{t.bio}"</p>
                </div>
                <div className="text-[10px] text-text-muted font-semibold pt-2 border-t border-cream-dark/30">
                  {t.reviews}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Comparison Table */}
      <section id="pricing" className="py-20 bg-warm-cream/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 text-center space-y-12">
          <div className="space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark">Online Yoga Classes vs. Local Studios</h2>
            <p className="text-sm text-text-muted max-w-2xl mx-auto">Understand the value differences of learning live from home.</p>
          </div>

          <div className="max-w-3xl mx-auto border border-cream-dark rounded-2xl bg-white overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-warm-cream/20 border-b border-cream-dark/50">
                <TableRow>
                  <TableHead className="font-bold text-text-dark">Feature</TableHead>
                  <TableHead className="font-bold text-deep-teal">Pranexa Studio</TableHead>
                  <TableHead className="font-bold text-text-muted">Local Yoga Studio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-cream-dark/40">
                <TableRow>
                  <TableCell className="font-semibold text-text-dark text-xs sm:text-sm">Location</TableCell>
                  <TableCell className="text-deep-teal font-semibold text-xs sm:text-sm">Your Home (Privacy & Comfort)</TableCell>
                  <TableCell className="text-text-muted text-xs sm:text-sm">Gym or Public Studio</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-text-dark text-xs sm:text-sm">Class Size</TableCell>
                  <TableCell className="text-deep-teal font-semibold text-xs sm:text-sm">Small Interactive Groups</TableCell>
                  <TableCell className="text-text-muted text-xs sm:text-sm">Large Crowded Groups</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-text-dark text-xs sm:text-sm">1-on-1 Coaching</TableCell>
                  <TableCell className="text-deep-teal font-semibold text-xs sm:text-sm">Available & Affordable</TableCell>
                  <TableCell className="text-text-muted text-xs sm:text-sm">Rare or Expensive</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-text-dark text-xs sm:text-sm">Schedule Flexibility</TableCell>
                  <TableCell className="text-deep-teal font-semibold text-xs sm:text-sm">Classes available 24/7</TableCell>
                  <TableCell className="text-text-muted text-xs sm:text-sm">Fixed, limited daily hours</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-text-dark text-xs sm:text-sm">Commute Time</TableCell>
                  <TableCell className="text-deep-teal font-semibold text-xs sm:text-sm">0 minutes</TableCell>
                  <TableCell className="text-text-muted text-xs sm:text-sm">30-45 minutes commute</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold text-text-dark text-xs sm:text-sm">Pricing value</TableCell>
                  <TableCell className="text-deep-teal font-semibold text-xs sm:text-sm">Competitive subscription tiers</TableCell>
                  <TableCell className="text-text-muted text-xs sm:text-sm">Premium high-cost charges</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="py-20 bg-white border-t border-cream-dark/20">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-dark">Frequently Asked Questions</h2>
            <p className="text-sm text-text-muted">Answers to common inquiries about our classes and platforms.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="border border-cream-dark rounded-xl overflow-hidden bg-[#FCFAF7] transition-all"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-text-dark hover:bg-cream-dark/20 transition-all flex justify-between items-center"
                >
                  <span>{faq.q}</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth="2.5" 
                    stroke="currentColor" 
                    className={`w-4 h-4 text-deep-teal transition-transform duration-300 ${activeFaq === idx ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {activeFaq === idx && (
                  <div className="p-5 border-t border-cream-dark/40 bg-white text-xs sm:text-sm text-text-muted leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Final Call to Action */}
      <section className="py-20 bg-gradient-to-br from-deep-teal via-deep-teal/95 to-teal-950 text-white border-t border-cream-dark/20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full relative z-10">
          <div className="lg:col-span-7 space-y-6 text-left">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black leading-tight text-white">
              Start Your Practice Routine Now
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">
              Join thousands of practitioners who have found strength, calm, and consistency through live yoga practice with certified teachers.
            </p>
            <div className="pt-2">
              <Link 
                href="/login" 
                className="inline-block px-10 py-4 bg-logo-gold hover:bg-logo-gold/90 text-text-dark font-black rounded-full shadow-lg transition-transform hover:-translate-y-0.5 text-sm"
              >
                Book a Free Live Session
              </Link>
            </div>
            <p className="text-xs text-white/60">No credit card required. Free account creation.</p>
          </div>

          <div className="lg:col-span-5 relative w-full flex justify-center">
            <div className="relative w-full max-w-[400px] aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/images/event_yin.png"
                alt="Online Live Practice Session"
                fill
                sizes="400px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-teal/80 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

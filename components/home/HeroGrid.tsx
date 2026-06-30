import React from "react";
import Link from "next/link";
import { Button } from "../ui/Button";

export const HeroGrid: React.FC = () => {
  const cards = [
    {
      title: "Yoga Academy",
      desc: "Certified teacher training programs and courses guided by Ira Trivedi.",
      href: "/academy",
      bgClass: "bg-warm-cream border-b md:border-b-0 md:border-r border-cream-dark",
      textClass: "text-deep-teal",
      descClass: "text-text-muted",
      btnVariant: "primary" as const
    },
    {
      title: "Retreats",
      desc: "Yoga retreats with Ira Trivedi in India's most exquisite locations.",
      href: "/retreats",
      bgClass: "bg-deep-teal border-b md:border-b-0 xl:border-r border-teal-dark",
      textClass: "text-white",
      descClass: "text-warm-cream/80",
      btnVariant: "primary" as const
    },
    {
      title: "Our Mumbai Studio",
      desc: "Our beautiful, state of the art sea-side studio offers events and workshops with Ira Trivedi.",
      href: "/studio",
      bgClass: "bg-warm-cream border-b md:border-r border-cream-dark",
      textClass: "text-deep-teal",
      descClass: "text-text-muted",
      btnVariant: "primary" as const
    },
    {
      title: "Pre recorded classes",
      desc: "Pre recorded classes by Ira Trivedi and team.",
      href: "/athome",
      bgClass: "bg-deep-teal",
      textClass: "text-white",
      descClass: "text-warm-cream/80",
      btnVariant: "primary" as const
    }
  ];

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 min-h-[500px]">
        {cards.map((card, idx) => (
          <div 
            key={idx} 
            className={`${card.bgClass} p-12 lg:p-16 flex flex-col justify-between items-center text-center group hover:bg-opacity-95 transition-all duration-500`}
          >
            <div className="space-y-6 max-w-sm mt-8">
              <h2 className="font-serif text-4xl lg:text-5xl font-bold tracking-tight leading-tight transition-transform group-hover:scale-102 duration-300">
                <span className={card.textClass}>{card.title}</span>
              </h2>
              <p className={`${card.descClass} text-[17px] leading-relaxed`}>
                {card.desc}
              </p>
            </div>
            <Link href={card.href} className="mt-12">
              <Button 
                variant={card.btnVariant} 
                className="transform group-hover:translate-y-[-2px]"
              >
                More info
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
export default HeroGrid;

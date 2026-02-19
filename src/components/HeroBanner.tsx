import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-main.jpg";
import { useRef, useEffect } from 'react';

export default function HeroBanner({ title, subtitle }: { title?: string; subtitle?: string }) {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const buttonsRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const t = titleRef.current;
    const s = subtitleRef.current;
    const b = buttonsRef.current;
    const svg = svgRef.current;

    if (t) {
      setTimeout(() => {
        t.classList.add('animate-slide-in-left');
        t.classList.remove('opacity-0');
      }, 200);
    }
    if (s) {
      setTimeout(() => {
        s.classList.add('animate-slide-in-right');
        s.classList.remove('opacity-0');
      }, 400);
    }
    if (b) {
      setTimeout(() => {
        b.classList.add('animate-slide-in-up');
        b.classList.remove('opacity-0');
      }, 600);
    }

    // Trigger SVG path animation and set delay
    if (svg) {
      const p = svg.querySelector('path');
      if (p) {
        (p as SVGPathElement).style.animationDelay = '250ms';
        // force reflow to ensure animation starts
        void p.getBoundingClientRect();
      }
    }
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="space-y-6">
            <h1 ref={titleRef} className="text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl opacity-0" id="hero-title">
              {title || (
                <>Votre carrière commence ici avec <span className="text-secondary">Emploi+</span></>
              )}
            </h1>
            <p ref={subtitleRef} className="text-lg text-primary-foreground/90 md:text-xl opacity-0" id="hero-subtitle">
              {subtitle || "La plateforme de référence pour connecter les talents et les entreprises en République du Congo et dans la sous-région."}
            </p>
            <div ref={buttonsRef} className="flex flex-col gap-3 sm:flex-row opacity-0" id="hero-buttons">
              <Button size="lg" asChild className="bg-secondary hover:bg-secondary/90">
                <Link to="/services">
                  voir les offres
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground text-foreground hover:bg-primary-foreground/10">
                <Link to="/emplois">trouver un emploi</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl shadow-strong relative">
              <img
                src={heroImage}
                alt="Professionnels collaborant"
                className="h-full w-full object-cover"
              />
              {/* animated border overlay: SVG path starts at top-right and draws clockwise */}
              <svg
                ref={svgRef}
                className="hero-border-svg absolute inset-0 pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Path starts at top-right (100,0) then goes down, left, up, back to start to trace clockwise */}
                <path d="M100 0 L100 100 L0 100 L0 0 L100 0" pathLength="400" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { LandingNav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Logos } from "@/components/landing/Logos";
import { Features } from "@/components/landing/Features";
import { Demo } from "@/components/landing/Demo";
import { Testimonials } from "@/components/landing/Testimonials";
import { FAQ } from "@/components/landing/FAQ";
import { CTA } from "@/components/landing/CTA";
import { LandingFooter } from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <div className="absolute inset-0 app-grid pointer-events-none" />
      <LandingNav />
      <Hero />
      <Logos />
      <Features />
      <Demo />
      <Testimonials />
      <FAQ />
      <CTA />
      <LandingFooter />
    </main>
  );
}

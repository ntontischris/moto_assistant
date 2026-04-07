import { Hero } from "@/components/landing/hero";
import { ModeSelector } from "@/components/landing/mode-selector";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Hero />
      <ModeSelector />
      <p className="mt-12 text-xs text-[var(--gray-500)]">
        ΕΜΠΙΣΤΕΥΤΙΚΟ — MotoMarket © 2026
      </p>
    </div>
  );
}

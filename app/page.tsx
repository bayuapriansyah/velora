import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { Solution } from "@/components/landing/solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Architecture } from "@/components/landing/architecture";
import { Features } from "@/components/landing/features";
import { DemoPreview } from "@/components/landing/demo-preview";
import { Faq } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Architecture />
      <Features />
      <DemoPreview />
      <Faq />
      <Footer />
    </main>
  );
}

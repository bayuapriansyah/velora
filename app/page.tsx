import { Nav } from "@/components/landing/nav";
import { Hero } from "@/components/landing/hero";
import { Footer } from "@/components/landing/footer";
import { LandingMotionConfig } from "@/components/landing/motion-config";
import { LandingSections } from "@/components/landing/landing-sections";

export default function LandingPage() {
  return (
    <LandingMotionConfig>
      <main>
        <Nav />
        <Hero />
        <LandingSections />
        <Footer />
      </main>
    </LandingMotionConfig>
  );
}

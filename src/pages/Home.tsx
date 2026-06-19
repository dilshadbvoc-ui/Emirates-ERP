import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AIAssistant from "@/components/AIAssistant";
import Hero from "@/sections/Hero";
import Stats from "@/sections/Stats";
import HowItWorks from "@/sections/HowItWorks";
import Services from "@/sections/Services";
import CTABanner from "@/sections/CTABanner";
import Contact from "@/sections/Contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Services />
      <CTABanner />
      <Contact />
      <Footer />
      <AIAssistant />
    </div>
  );
}

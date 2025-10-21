import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Languages } from "@/components/Languages";
import { Integrations } from "@/components/Integrations";
import { Pricing } from "@/components/Pricing";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <Languages />
      <Integrations />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;

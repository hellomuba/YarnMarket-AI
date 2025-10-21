import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Globe } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center animate-fade-in-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-card border border-border mb-8">
            <MessageSquare size={16} className="text-primary" />
            <span className="text-sm font-medium">Multilingual AI-Powered Conversations</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Transform Your Retail
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              With Smart Conversations
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            The ultimate multilingual conversational platform for retail and e-commerce. 
            Engage customers in their language, automate support, and drive sales with 
            AI-powered chat experiences.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity text-lg px-8 py-6 shadow-glow group">
              Start Free Trial
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-2">
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="p-6 rounded-2xl bg-gradient-card border border-border backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Globe className="text-primary" size={24} />
              </div>
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-sm text-muted-foreground">Languages Supported</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-card border border-border backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime Guarantee</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-card border border-border backdrop-blur-sm">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm text-muted-foreground">AI-Powered Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

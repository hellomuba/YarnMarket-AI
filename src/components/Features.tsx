import { MessageCircle, Zap, Shield, TrendingUp, Users, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: MessageCircle,
    title: "Intelligent Conversations",
    description: "AI-powered chatbots that understand context and provide human-like interactions in any language."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Real-time responses with sub-second latency. Keep your customers engaged without waiting."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with GDPR, SOC2, and industry standards."
  },
  {
    icon: TrendingUp,
    title: "Sales Analytics",
    description: "Deep insights into customer behavior, conversion rates, and revenue optimization."
  },
  {
    icon: Users,
    title: "Customer Engagement",
    description: "Personalized experiences that increase satisfaction and build lasting relationships."
  },
  {
    icon: Bot,
    title: "Auto-Learning AI",
    description: "Continuously improves from every interaction to deliver better results over time."
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Scale Your Retail Business
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to transform how you engage with customers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-8 hover:shadow-glow transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border backdrop-blur-sm animate-scale-in group cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

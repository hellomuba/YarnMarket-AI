import {
  MessageSquare,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Headphones,
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Omnichannel Inbox",
    description:
      "Manage all customer conversations from WhatsApp, Instagram, Facebook, and website chat in one unified inbox.",
  },
  {
    icon: Globe,
    title: "5 Languages",
    description:
      "Communicate with customers in their native language. Automatic translation and language detection powered by AI.",
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description:
      "AI-powered chatbots handle common queries instantly, reducing response time from hours to seconds.",
  },
  {
    icon: Shield,
    title: "Smart Product Recommendations",
    description:
      "AI suggests relevant products based on customer conversations, increasing average order value by up to 30%.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Track conversation metrics, customer satisfaction, sales conversions, and team performance in real-time.",
  },
  {
    icon: Headphones,
    title: "Live Chat Handoff",
    description:
      "Seamlessly transfer from AI to human agents when needed. Keep context and conversation history intact.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="block bg-gradient-primary bg-clip-text text-transparent pb-2">
              Scale Customer Support
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            From small businesses to enterprise retailers, our platform grows
            with you
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
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

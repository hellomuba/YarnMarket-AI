import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "N19,500",
    period: "/month",
    description: "Perfect for small businesses getting started",
    features: [
      "Up to 1,000 conversations/month",
      "2 team members",
      "Email & chat support",
      "Basic analytics",
      "WhatsApp & web chat",
      "100+ languages",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    price: "N55,000",
    period: "/month",
    description: "For growing businesses with higher volume",
    features: [
      "Up to 10,000 conversations/month",
      "10 team members",
      "Priority support",
      "Advanced analytics & reports",
      "All messaging channels",
      "Custom AI training",
      "API access",
      "Shopify & WooCommerce integration",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations",
    features: [
      "Unlimited conversations",
      "Unlimited team members",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
      "Advanced security & compliance",
      "White-label options",
      "Custom AI models",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, Transparent
            <span className="block bg-gradient-primary bg-clip-text text-transparent pb-4">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Start free, scale as you grow. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-8 relative overflow-hidden transition-all duration-300 animate-fade-in ${
                plan.popular
                  ? "border-2 border-primary shadow-glow scale-105 lg:scale-110 bg-gradient-card"
                  : "border-border bg-card hover:shadow-card"
              }`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </div>

              <Button
                className={`w-full mb-8 ${
                  plan.popular
                    ? "bg-gradient-primary hover:opacity-90"
                    : "bg-primary hover:bg-primary/90"
                }`}
                size="lg"
              >
                {plan.cta}
              </Button>

              <ul className="space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check
                      className="text-primary flex-shrink-0 mt-0.5"
                      size={20}
                    />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center text-muted-foreground">
          <p>All plans include 14-day free trial • No credit card required</p>
        </div>
      </div>
    </section>
  );
};

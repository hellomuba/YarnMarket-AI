import { Card } from "@/components/ui/card";
import { ShoppingCart, Webhook, Database, Mail, CreditCard, Package } from "lucide-react";

const integrations = [
  {
    icon: ShoppingCart,
    name: "Shopify",
    description: "Seamless integration with your Shopify store"
  },
  {
    icon: Package,
    name: "WooCommerce",
    description: "Connect your WooCommerce platform"
  },
  {
    icon: CreditCard,
    name: "Stripe",
    description: "Payment processing made simple"
  },
  {
    icon: Mail,
    name: "Mailchimp",
    description: "Email marketing automation"
  },
  {
    icon: Database,
    name: "Salesforce",
    description: "CRM integration for better insights"
  },
  {
    icon: Webhook,
    name: "Custom APIs",
    description: "Connect any service via webhooks"
  }
];

export const Integrations = () => {
  return (
    <section id="integrations" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Integrates With
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Your Favorite Tools
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Connect ConvoRetail with your existing tech stack in minutes. 
            No complex setup required.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {integrations.map((integration, index) => (
            <Card 
              key={index}
              className="p-6 bg-card border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-1 cursor-pointer group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <integration.icon className="text-white" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold mb-1">{integration.name}</h3>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Need a custom integration?
          </p>
          <a href="#" className="text-primary hover:underline font-medium">
            Contact our team →
          </a>
        </div>
      </div>
    </section>
  );
};

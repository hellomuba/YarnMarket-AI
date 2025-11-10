import { Globe, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const languageRegions = [
  {
    region: "European Languages",
    languages: ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Polish", "Russian"]
  },
  {
    region: "Asian Languages",
    languages: ["Chinese (Simplified & Traditional)", "Japanese", "Korean", "Thai", "Vietnamese", "Indonesian", "Hindi", "Arabic"]
  },
  {
    region: "And Many More",
    languages: ["Turkish", "Hebrew", "Greek", "Swedish", "Danish", "Norwegian", "Finnish", "Czech", "Hungarian"]
  }
];

export const Languages = () => {
  return (
    <section id="languages" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-card border border-border mb-6">
            <Globe size={16} className="text-primary" />
            <span className="text-sm font-medium">Global Communication</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Speak Your Customers'
            <span className="block bg-gradient-primary bg-clip-text text-transparent">
              Language, Anywhere
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Break down language barriers and connect with customers worldwide. 
            Our AI automatically detects and responds in 100+ languages.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {languageRegions.map((region, index) => (
            <Card 
              key={index}
              className="p-8 bg-gradient-card border-border backdrop-blur-sm hover:shadow-card transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-center">{region.region}</h3>
              <ul className="space-y-3">
                {region.languages.map((language, langIndex) => (
                  <li key={langIndex} className="flex items-center gap-3 text-muted-foreground">
                    <CheckCircle className="text-primary flex-shrink-0" size={18} />
                    <span>{language}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-lg mb-6">
            100+ languages supported — from major markets to emerging regions, we've got you covered
          </p>
        </div>
      </div>
    </section>
  );
};

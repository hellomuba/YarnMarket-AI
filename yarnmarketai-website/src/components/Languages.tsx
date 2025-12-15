import { Globe, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const languageRegions = [
  {
    region: "Primary Language",
    languages: ["English"],
  },
  {
    region: "Nigerian Languages",
    languages: ["Pidgin", "Yoruba", "Hausa", "Igbo"],
  },
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
            <span className="block bg-gradient-primary bg-clip-text text-transparent pb-2">
              Language, Anywhere
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12">
            Break down language barriers and connect with customers across
            Nigeria. Our AI automatically detects and responds in English and
            major Nigerian languages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {languageRegions.map((region, index) => (
            <Card
              key={index}
              className="p-8 bg-gradient-card border-border backdrop-blur-sm hover:shadow-card transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <h3 className="text-2xl font-semibold mb-6 text-center">
                {region.region}
              </h3>
              <ul className="space-y-3">
                {region.languages.map((language, langIndex) => (
                  <li
                    key={langIndex}
                    className="flex items-center gap-3 text-muted-foreground"
                  >
                    <CheckCircle
                      className="text-primary flex-shrink-0"
                      size={18}
                    />
                    <span>{language}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground text-lg mb-6">
            5 languages supported — covering English, Pidgin and Nigeria's most
            widely spoken languages
          </p>
        </div>
      </div>
    </section>
  );
};

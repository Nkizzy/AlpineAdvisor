import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mountain, Award, Target, ArrowRight, CheckSquare, FileText, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  // Get base path and ensure it's properly formatted
  const basePath = import.meta.env.BASE_URL || '/';
  
  // Helper to construct image paths for public assets
  // Public assets in Vite are always served from root, regardless of basePath
  const imagePath = (path: string) => {
    // Remove leading slash from path if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Always return absolute path from root for public assets
    return `/${cleanPath}`;
  };
  
  // Get the hero image path - use direct absolute path for reliability
  const heroImagePath = '/images/Landscape.JPG';
  
  // Debug: log the path (remove in production if needed)
  console.log('Hero image path:', heroImagePath);

  const features = [
    {
      icon: Target,
      title: "Personalized Matching",
      description: "Answer a few questions and get gear recommendations tailored to your exact needs",
    },
    {
      icon: Mountain,
      title: "Tailors to All Skier Types",
      description: "From beginners to experts, our system adapts to match your unique skiing style and preferences",
    },
    {
      icon: Award,
      title: "All Skill Levels",
      description: "Whether you're a beginner or expert, find the perfect equipment for your journey",
    },
  ];

  const howItWorks = [
    {
      step: 1,
      icon: CheckSquare,
      title: "Select Your Gear",
      description: "Choose what you're looking for: skis, ski boots, snowboards, or snowboard boots",
    },
    {
      step: 2,
      icon: FileText,
      title: "Fill Out the Quiz",
      description: "Answer a quick set of questions about your skill level, riding style, and preferences",
    },
    {
      step: 3,
      icon: Sparkles,
      title: "Get Your Matches",
      description: "Receive detailed recommendations about the type of gear that's right for you",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-gray-900"
          style={{ 
            backgroundImage: `url('${heroImagePath}')`, 
            backgroundPosition: "center 60%",
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
          }}
        >
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(to bottom, transparent 0%, transparent 60%, rgba(255,255,255,0.3) 80%, hsl(var(--background)) 100%)" }} />
        </div>
        
        {/* Snow Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
          {Array.from({ length: 50 }).map((_, i) => {
            // Random horizontal position
            const left = `${Math.random() * 100}%`;
            // Random duration between 8-15 seconds for varied speeds
            const duration = `${8 + Math.random() * 7}s`;
            // Use negative delay to start animation partway through, making snow visible immediately
            const delay = `-${Math.random() * 8}s`;
            // Random horizontal drift amount
            const driftAmount = (Math.random() - 0.5) * 40; // -20px to +20px
            // Random size
            const size = `${0.4 + Math.random() * 0.8}em`;
            // Random opacity for subtlety
            const opacity = 0.3 + Math.random() * 0.3; // 0.3 to 0.6
            
            return (
              <div
                key={i}
                className="snowflake"
                style={{
                  left,
                  animation: `snowfall-random ${duration} ${delay} infinite linear`,
                  fontSize: size,
                  opacity: opacity,
                  '--drift': `${driftAmount}px`,
                  '--opacity': opacity.toString(),
                } as React.CSSProperties & { '--drift': string; '--opacity': string }}
              />
            );
          })}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 lg:px-12 animate-fade-in w-full">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center justify-items-center md:justify-items-start">
            {/* Left Half - Title */}
            <div className="text-center md:text-left">
              <h1 className="text-white font-bold drop-shadow-2xl leading-tight">
                <div className="text-4xl md:text-6xl lg:text-[5.25rem] mb-2 md:mb-3">
                  YOU DONT
                </div>
                <div className="text-2xl md:text-4xl lg:text-[3.375rem] mb-6 md:mb-8">
                  CHOOSE YOUR GEAR
                </div>
                <div className="text-2xl md:text-4xl lg:text-[3.375rem] mb-2 md:mb-3">
                  YOUR GEAR
                </div>
                <div className="text-5xl md:text-7xl lg:text-[7rem]">
                  CHOOSES YOU
                </div>
              </h1>
            </div>
            
            {/* Right Half - Subtitle and Button */}
            <div className="flex flex-col justify-center items-center text-center">
              <p className="text-lg md:text-xl lg:text-2xl mb-10 text-white/95 drop-shadow-lg font-light tracking-wide max-w-md">
                Get matched with your perfect skis, snowboard, or boots, matched to your riding style
              </p>
              <button
                onClick={() => navigate("/quiz")}
                className="quiz-button"
              >
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="why-use" className="py-24 px-4 bg-gradient-subtle">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            Why Use AlpineAdvisor?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Condensed features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-hero">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right side - Skis image */}
            <div className="relative animate-fade-in max-w-sm mx-auto">
              <div className="relative rounded-lg overflow-hidden shadow-medium aspect-[3/4]">
                <img
                  src={imagePath('images/skis.jpeg')}
                  alt="Skis"
                  className="w-full h-full object-cover object-[center_65%]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-foreground">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div
                key={index}
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-gradient-hero rounded-full blur-md opacity-30" />
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-hero shadow-medium">
                      <item.icon className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {item.description}
                  </p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/20 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 shadow-medium bg-gradient-subtle">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to Find Your Gear?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Our quick 5-question quiz will help you discover the perfect equipment for your next adventure on the mountain
            </p>
            <Button
              onClick={() => navigate("/quiz")}
              size="lg"
              className="text-lg px-8 py-6 bg-gradient-hero hover:opacity-90 transition-opacity"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 AlpineAdvisor. Find your perfect snow equipment.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

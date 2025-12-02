import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, Loader2, ChevronDown, ChevronUp } from "lucide-react";

type QuizAnswers = {
  skillLevel: string;
  terrain: string[];
  skiingStyle: string;
  gender: string;
  budget: string;
};

interface SkiRecommendation {
  Ski_ID: number;
  Brand: string;
  Model: string;
  Year: number;
  Gender: string;
  Waist_Width: number;
  MSRP: number;
  Image_URL: string | null;
  Match_Score: number;
}

// Generate dynamic description based on ski properties and user preferences
const generateRationale = (ski: SkiRecommendation, answers: QuizAnswers): string => {
  const parts: string[] = [];
  const waistWidth = ski.Waist_Width;
  const terrain = answers.terrain || [];
  const skiingStyle = answers.skiingStyle;
  const isPark = terrain.includes('park');
  
  // Waist width descriptions
  if (waistWidth < 80) {
    parts.push(`The narrow ${waistWidth}mm waist creates powerful edge grip, allowing you to carve tight, precise turns on groomed runs.`);
  } else if (waistWidth >= 100) {
    parts.push(`The wide ${waistWidth}mm base provides exceptional float, allowing the ski to stay on top of deep snow rather than sinking in.`);
  } else if (waistWidth >= 85 && waistWidth < 100) {
    parts.push(`The ${waistWidth}mm waist strikes an ideal balance, providing enough width for off-piste float while maintaining on-piste performance.`);
  }
  
  // Terrain-based descriptions
  if (terrain.includes('on-piste') || terrain.includes('all-mountain')) {
    if (waistWidth < 90 && skiingStyle === 'powerful-fast') {
      parts.push(`The stiff flex profile returns energy back into the ski, giving you maximum power and stability through hard turns.`);
    }
  }
  
  if (terrain.includes('powder')) {
    if (waistWidth >= 90) {
      parts.push(`The wide platform and soft flex allow the ski to pivot easily in deep snow, making it effortless to navigate through powder.`);
    }
  }
  
  if (isPark) {
    if (skiingStyle === 'quick-playful') {
      parts.push(`The soft, playful flex creates a forgiving ski that's perfect for jibbing and smooth landings.`);
      parts.push(`The buttery construction absorbs impacts and provides a poppy feel, reducing fatigue during long park sessions.`);
    } else if (skiingStyle === 'powerful-fast') {
      parts.push(`The stiff flex profile provides stability and pop for big air, giving you confidence on large jumps.`);
    }
  }
  
  // Style-based descriptions
  if (skiingStyle === 'powerful-fast' && !isPark) {
    parts.push(`Built for speed and power, this ski maintains composure at high velocities and rewards aggressive, committed skiing.`);
  } else if (skiingStyle === 'quick-playful' && !isPark) {
    parts.push(`The playful nature makes this ski incredibly fun and easy to flick around, perfect for quick, snappy turns.`);
  } else if (skiingStyle === 'easy-forgiving') {
    parts.push(`The forgiving flex profile makes this ski approachable and easy to control, helping you build confidence and improve your technique.`);
  }
  
  // Fallback if no specific descriptions were generated
  if (parts.length === 0) {
    parts.push(`This ski matches ${ski.Match_Score} of your preferences, making it a great fit for your skiing style.`);
  }
  
  return parts.join(' ');
};

// Transform API response to display format
const transformRecommendation = (ski: SkiRecommendation, answers: QuizAnswers) => {
  const features: string[] = [];
  
  // Add waist width
  features.push(`${ski.Waist_Width}mm waist`);
  
  // Add year
  features.push(`${ski.Year} model`);
  
  // Add gender if relevant
  if (ski.Gender) {
    features.push(ski.Gender);
  }
  
  return {
    id: ski.Ski_ID,
    name: `${ski.Brand} ${ski.Model}`,
    category: "Ski",
    price: `$${ski.MSRP.toFixed(2)}`,
    features,
    match: Math.min(100, Math.round((ski.Match_Score / 7) * 100)), // Scale match score to percentage
    imageUrl: "/images/exampleski.webp",
    rationale: generateRationale(ski, answers),
  };
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers as QuizAnswers;
  const [recommendations, setRecommendations] = useState<ReturnType<typeof transformRecommendation>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!answers) {
      navigate("/");
      return;
    }

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cloudflare Pages Functions are served at /api/* automatically
        // In development, this will only work with wrangler pages dev
        const apiUrl = '/api/recommendations';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(answers),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        
        // Check for error in response
        if (data.error) {
          console.error('API Error:', data.error, data.details);
          setError(`Failed to load recommendations: ${data.error}${data.details ? ` (${data.details})` : ''}`);
          return;
        }
        
        const transformed = (data.recommendations || []).map((ski: SkiRecommendation) => 
          transformRecommendation(ski, answers)
        );
        setRecommendations(transformed);
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed to load recommendations: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [answers, navigate]);

  const toggleCard = (index: number) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!answers) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Finding your perfect skis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-subtle py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate("/quiz")} variant="outline">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Your Perfect Match
          </h1>
          <p className="text-xl text-muted-foreground">
            Based on your preferences, here are our top recommendations
          </p>
        </div>

        {recommendations.length === 0 && (
          <Card className="mb-8 p-6 bg-gradient-subtle border-2 border-primary/20 animate-fade-in">
            <h2 className="text-xl font-bold mb-3 text-foreground">
              No Recommendations Found
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We couldn't find any skis matching your preferences. Try adjusting your answers and take the quiz again.
            </p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {recommendations.map((rec, index) => {
            const isExpanded = expandedCards.has(index);
            return (
              <Card
                key={index}
                className="p-6 shadow-medium hover:shadow-soft transition-all animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground">{rec.name}</h3>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-primary">{rec.price}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="font-semibold text-accent">{rec.match}%</span> match
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <>
                    <div className="flex items-center mb-4">
                      <Badge className="bg-gradient-accent">{rec.category}</Badge>
                    </div>

                    {rec.imageUrl && (
                      <div className="mb-4">
                        <img 
                          src={rec.imageUrl} 
                          alt={rec.name}
                          className="w-full h-48 object-cover rounded-lg bg-muted"
                          onError={(e) => {
                            console.error('Image failed to load:', rec.imageUrl);
                            // Show placeholder instead of hiding
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {rec.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {rec.rationale && (
                      <div className="mb-6 p-4 bg-accent/5 rounded-lg border border-accent/20">
                        <p className="text-sm text-foreground leading-relaxed">
                          <span className="font-semibold">Why this works for you: </span>
                          {rec.rationale}
                        </p>
                      </div>
                    )}
                  </>
                )}

                <Button 
                  className="w-full bg-gradient-hero"
                  onClick={() => toggleCard(index)}
                >
                  {isExpanded ? (
                    <>
                      Hide Details
                      <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show Details
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        <Card className="p-8 bg-card text-center">
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            Want to try different options?
          </h3>
          <p className="text-muted-foreground mb-6">
            Take the quiz again to explore more recommendations
          </p>
          <Button
            onClick={() => navigate("/quiz")}
            variant="outline"
            size="lg"
          >
            Retake Quiz
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Results;

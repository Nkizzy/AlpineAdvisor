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

// Transform API response to display format
const transformRecommendation = (ski: SkiRecommendation) => {
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
    imageUrl: ski.Image_URL,
    rationale: `This ski matches ${ski.Match_Score} of your preferences, making it a great fit for your skiing style.`,
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
        
        const transformed = (data.recommendations || []).map(transformRecommendation);
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
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            // Hide image if it fails to load
                            (e.target as HTMLImageElement).style.display = 'none';
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

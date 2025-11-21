import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check } from "lucide-react";

type QuizAnswers = {
  gearType: string;
  skillLevel: string;
  ridingStyle: string;
  terrain: string;
  budget: string;
};

// Helper function to determine ski characteristics based on answers
const getSkiCharacteristics = (answers: QuizAnswers) => {
  const { ridingStyle, terrain, skillLevel } = answers;
  
  let width = "medium"; // 85-95mm
  let stiffness = "medium";
  let description = "";
  
  // Racing/carving → narrow, stiff
  if (ridingStyle === "racing") {
    width = "narrow"; // 65-75mm
    stiffness = "stiff";
    description = "Narrow, stiff skis for maximum edge grip and precision at high speeds";
  }
  // Powder → wide, playful
  else if (terrain === "powder" || terrain === "backcountry") {
    width = "wide"; // 100-115mm+
    stiffness = "medium-soft";
    description = "Wider, more playful skis that float in deep snow and handle variable conditions";
  }
  // Freestyle → medium width, softer
  else if (ridingStyle === "freestyle") {
    width = "medium";
    stiffness = "soft";
    description = "Medium width, softer flex for park tricks and playful riding";
  }
  // All-mountain → versatile
  else if (ridingStyle === "all-mountain") {
    width = "medium"; // 85-95mm
    stiffness = "medium";
    description = "Versatile medium-width skis that perform well across all terrain";
  }
  // Freeride → wider, stiffer
  else if (ridingStyle === "freeride") {
    width = "wide"; // 95-105mm
    stiffness = "stiff";
    description = "Wider, stiffer skis for aggressive off-piste and big mountain riding";
  }
  
  // Skill level adjustments
  if (skillLevel === "beginner") {
    stiffness = "soft";
    description += " with softer flex for easier turn initiation";
  } else if (skillLevel === "expert") {
    if (stiffness === "medium") stiffness = "stiff";
    description += " with responsive performance for advanced techniques";
  }
  
  return { width, stiffness, description };
};

// Helper function to determine boot characteristics
const getBootCharacteristics = (answers: QuizAnswers, isSkiBoot: boolean) => {
  const { ridingStyle, terrain, skillLevel } = answers;
  
  let flex = "medium";
  let fit = "medium";
  let description = "";
  
  if (isSkiBoot) {
    // Racing → stiff flex, performance fit
    if (ridingStyle === "racing") {
      flex = "stiff"; // 120-130
      fit = "performance";
      description = "Stiff flex (120-130) with performance fit for maximum power transfer and precision";
    }
    // Powder/freeride → medium-stiff, comfortable fit
    else if (terrain === "powder" || ridingStyle === "freeride") {
      flex = "medium-stiff"; // 100-110
      fit = "comfortable";
      description = "Medium-stiff flex (100-110) with comfortable fit for all-day performance";
    }
    // Freestyle → softer, comfortable
    else if (ridingStyle === "freestyle") {
      flex = "soft"; // 80-90
      fit = "comfortable";
      description = "Softer flex (80-90) with comfortable fit for playful riding";
    }
    // All-mountain → medium
    else {
      flex = "medium"; // 90-100
      fit = "medium";
      description = "Medium flex (90-100) with balanced fit for versatile performance";
    }
    
    // Skill level adjustments
    if (skillLevel === "beginner") {
      flex = "soft"; // 70-80
      description = "Softer flex (70-80) for easier control and comfort while learning";
    } else if (skillLevel === "expert") {
      if (flex === "medium") flex = "stiff";
      description += " with high-performance characteristics";
    }
  } else {
    // Snowboard boots
    if (ridingStyle === "racing" || terrain === "backcountry") {
      flex = "stiff";
      description = "Stiff flex for maximum response and support at high speeds";
    } else if (ridingStyle === "freestyle") {
      flex = "soft";
      description = "Softer flex for comfort and flexibility in the park";
    } else {
      flex = "medium";
      description = "Medium flex for versatile all-mountain performance";
    }
    
    if (skillLevel === "beginner") {
      flex = "soft";
      description = "Softer flex for easier control and comfort";
    }
  }
  
  return { flex, fit, description };
};

// Mock recommendations based on answers
const getRecommendations = (answers: QuizAnswers) => {
  const recommendations: Array<{
    name: string;
    category: string;
    price: string;
    features: string[];
    match: number;
    rationale?: string;
  }> = [];
  
  if (answers.gearType === "ski") {
    const { width, stiffness, description } = getSkiCharacteristics(answers);
    
    // Racing skis
    if (answers.ridingStyle === "racing") {
      recommendations.push({
        name: "Head Worldcup Rebels i.Speed",
        category: "Racing Ski",
        price: answers.budget === "pro" ? "$1,199" : "$899",
        features: ["Narrow 68mm waist", "Stiff construction", "Race-tuned performance", "Maximum edge grip"],
        match: 96,
        rationale: description,
      });
      recommendations.push({
        name: "Rossignol Hero Elite",
        category: "Carving Ski",
        price: "$749",
        features: ["70mm waist", "Titanal construction", "Excellent on groomers", "Precise turn initiation"],
        match: 93,
        rationale: description,
      });
    }
    // Powder skis
    else if (answers.terrain === "powder" || answers.terrain === "backcountry") {
      recommendations.push({
        name: "K2 Mindbender 108Ti",
        category: "Powder Ski",
        price: "$899",
        features: ["108mm waist", "Playful flex", "Excellent float", "All-terrain capability"],
        match: 95,
        rationale: description,
      });
      recommendations.push({
        name: "Blizzard Rustler 11",
        category: "Freeride Ski",
        price: "$849",
        features: ["112mm waist", "Progressive flex", "Deep snow specialist", "Versatile in variable conditions"],
        match: 92,
        rationale: description,
      });
    }
    // Freestyle skis
    else if (answers.ridingStyle === "freestyle") {
      recommendations.push({
        name: "Armada ARV 96",
        category: "Freestyle Ski",
        price: "$649",
        features: ["96mm waist", "Soft flex", "Twin tip design", "Park and all-mountain"],
        match: 94,
        rationale: description,
      });
      recommendations.push({
        name: "Line Blend",
        category: "Park Ski",
        price: "$549",
        features: ["92mm waist", "Playful flex", "Durable construction", "Great for tricks"],
        match: 91,
        rationale: description,
      });
    }
    // All-mountain (default)
    else {
      recommendations.push({
        name: "K2 Mindbender 99Ti",
        category: "All-Mountain Ski",
        price: "$799",
        features: ["99mm waist", "Versatile performance", "Titanal construction", "All-terrain design"],
        match: 95,
        rationale: description,
      });
      recommendations.push({
        name: "Rossignol Experience 88",
        category: "All-Mountain Ski",
        price: "$650",
        features: ["88mm waist", "Stable on groomers", "Easy turn initiation", "Great for progression"],
        match: 88,
        rationale: description,
      });
    }
  } else if (answers.gearType === "snowboard") {
    const { flex, description } = getBootCharacteristics(answers, false);
    
    if (answers.ridingStyle === "freestyle") {
      recommendations.push({
        name: "Burton Custom",
        category: "All-Mountain Snowboard",
        price: "$629",
        features: ["Twin shape", "Medium flex", "Legendary performance", "Versatile design"],
        match: 94,
        rationale: description,
      });
      recommendations.push({
        name: "Capita DOA",
        category: "Freestyle Snowboard",
        price: "$549",
        features: ["Park and all-mountain", "Poppy and playful", "Durable construction", "Twin tip"],
        match: 90,
        rationale: description,
      });
    } else if (answers.terrain === "powder" || answers.ridingStyle === "freeride") {
      recommendations.push({
        name: "Jones Flagship",
        category: "Freeride Snowboard",
        price: "$699",
        features: ["Directional shape", "Stiff flex", "Powder optimized", "Big mountain performance"],
        match: 93,
        rationale: description,
      });
      recommendations.push({
        name: "Lib Tech Orca",
        category: "Powder Snowboard",
        price: "$649",
        features: ["Wide platform", "Surfy feel", "Excellent float", "All-mountain capable"],
        match: 91,
        rationale: description,
      });
    } else {
      recommendations.push({
        name: "Burton Custom",
        category: "All-Mountain Snowboard",
        price: "$629",
        features: ["Twin shape", "Medium flex", "Legendary performance", "Versatile design"],
        match: 94,
        rationale: description,
      });
      recommendations.push({
        name: "Capita DOA",
        category: "All-Mountain Snowboard",
        price: "$549",
        features: ["Park and all-mountain", "Poppy and playful", "Durable construction"],
        match: 90,
        rationale: description,
      });
    }
  } else if (answers.gearType === "ski-boots") {
    const { flex, fit, description } = getBootCharacteristics(answers, true);
    
    if (answers.ridingStyle === "racing") {
      recommendations.push({
        name: "Tecnica Mach1 130",
        category: "Racing Ski Boots",
        price: "$749",
        features: ["130 flex", "Performance fit", "Racing-inspired design", "Maximum responsiveness"],
        match: 96,
        rationale: description,
      });
      recommendations.push({
        name: "Lange RS 130",
        category: "Performance Ski Boots",
        price: "$699",
        features: ["130 flex", "Precise fit", "Excellent power transfer", "Custom shell technology"],
        match: 93,
        rationale: description,
      });
    } else if (answers.terrain === "powder" || answers.ridingStyle === "freeride") {
      recommendations.push({
        name: "Salomon S/Pro 120",
        category: "Freeride Ski Boots",
        price: "$699",
        features: ["110 flex", "Comfortable fit", "Excellent power transfer", "All-day comfort"],
        match: 94,
        rationale: description,
      });
      recommendations.push({
        name: "Atomic Hawx Ultra 110",
        category: "All-Mountain Ski Boots",
        price: "$649",
        features: ["110 flex", "Comfortable fit", "Versatile performance", "Heat-moldable"],
        match: 91,
        rationale: description,
      });
    } else if (answers.ridingStyle === "freestyle") {
      recommendations.push({
        name: "Full Tilt Classic",
        category: "Freestyle Ski Boots",
        price: "$599",
        features: ["90 flex", "Comfortable fit", "Soft flex", "Park performance"],
        match: 92,
        rationale: description,
      });
      recommendations.push({
        name: "K2 BFC 90",
        category: "Park Ski Boots",
        price: "$549",
        features: ["90 flex", "Comfortable fit", "Playful flex", "Great for tricks"],
        match: 89,
        rationale: description,
      });
    } else {
      recommendations.push({
        name: "Salomon S/Pro 100",
        category: "All-Mountain Ski Boots",
        price: "$649",
        features: ["100 flex", "Balanced fit", "Versatile performance", "Custom shell technology"],
        match: 92,
        rationale: description,
      });
      recommendations.push({
        name: "Rossignol Alltrack 100",
        category: "All-Mountain Ski Boots",
        price: "$599",
        features: ["100 flex", "Comfortable fit", "Easy to use", "Great for progression"],
        match: 88,
        rationale: description,
      });
    }
  } else if (answers.gearType === "snowboard-boots") {
    const { flex, description } = getBootCharacteristics(answers, false);
    
    if (answers.ridingStyle === "freestyle") {
      recommendations.push({
        name: "Burton Ion",
        category: "Freestyle Snowboard Boots",
        price: "$449",
        features: ["Soft flex", "Superior support", "Heat-moldable liner", "Comfortable"],
        match: 92,
        rationale: description,
      });
      recommendations.push({
        name: "Vans Hi-Standard",
        category: "Park Snowboard Boots",
        price: "$399",
        features: ["Soft flex", "Comfortable fit", "Durable construction", "Great for tricks"],
        match: 89,
        rationale: description,
      });
    } else if (answers.ridingStyle === "racing" || answers.terrain === "backcountry") {
      recommendations.push({
        name: "Burton Driver X",
        category: "Performance Snowboard Boots",
        price: "$549",
        features: ["Stiff flex", "Maximum support", "Responsive", "Heat-moldable"],
        match: 94,
        rationale: description,
      });
      recommendations.push({
        name: "ThirtyTwo TM-2",
        category: "Freeride Snowboard Boots",
        price: "$499",
        features: ["Stiff flex", "Excellent support", "Durable", "All-mountain performance"],
        match: 91,
        rationale: description,
      });
    } else {
      recommendations.push({
        name: "Burton Ion",
        category: "All-Mountain Snowboard Boots",
        price: "$449",
        features: ["Medium flex", "Superior support", "Heat-moldable liner", "Responsive"],
        match: 89,
        rationale: description,
      });
      recommendations.push({
        name: "Vans Hi-Standard",
        category: "All-Mountain Snowboard Boots",
        price: "$399",
        features: ["Medium flex", "Comfortable fit", "Durable construction", "Great for all-day riding"],
        match: 87,
        rationale: description,
      });
    }
  }

  return recommendations;
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const answers = location.state?.answers as QuizAnswers;

  if (!answers) {
    navigate("/");
    return null;
  }

  const recommendations = getRecommendations(answers);
  
  // Get summary characteristics
  let summaryText = "";
  if (answers.gearType === "ski") {
    const { description } = getSkiCharacteristics(answers);
    summaryText = description;
  } else if (answers.gearType === "ski-boots" || answers.gearType === "snowboard-boots") {
    const { description } = getBootCharacteristics(answers, answers.gearType === "ski-boots");
    summaryText = description;
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

        {summaryText && (
          <Card className="mb-8 p-6 bg-gradient-subtle border-2 border-primary/20 animate-fade-in">
            <h2 className="text-xl font-bold mb-3 text-foreground">
              Recommended Characteristics
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {summaryText}
            </p>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {recommendations.map((rec, index) => (
            <Card
              key={index}
              className="p-6 shadow-medium hover:shadow-soft transition-all animate-slide-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="mb-2 bg-gradient-accent">{rec.category}</Badge>
                  <h3 className="text-2xl font-bold text-foreground">{rec.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">{rec.price}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="font-semibold text-accent">{rec.match}%</span> match
                  </div>
                </div>
              </div>

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

              <Button className="w-full bg-gradient-hero">
                View Details
              </Button>
            </Card>
          ))}
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

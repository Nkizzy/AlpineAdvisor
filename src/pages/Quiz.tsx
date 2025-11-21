import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

type QuizAnswers = {
  gearType: string;
  skillLevel: string;
  ridingStyle: string;
  terrain: string;
  budget: string;
};

const questions = [
  {
    id: "gearType",
    question: "What type of gear are you looking for?",
    options: [
      { value: "ski", label: "Skis", description: "Traditional alpine skiing", enabled: true },
      { value: "snowboard", label: "Snowboard", description: "Ride sideways down the mountain", enabled: false },
      { value: "ski-boots", label: "Ski Boots", description: "Boots designed for skiing", enabled: false },
      { value: "snowboard-boots", label: "Snowboard Boots", description: "Boots designed for snowboarding", enabled: false },
    ],
  },
  {
    id: "skillLevel",
    question: "What's your skill level?",
    options: [
      { value: "beginner", label: "Beginner", description: "New to the sport or learning basics" },
      { value: "intermediate", label: "Intermediate", description: "Comfortable on most runs" },
      { value: "advanced", label: "Advanced", description: "Confident on all terrain" },
      { value: "expert", label: "Expert", description: "Professional level skills" },
    ],
  },
  {
    id: "ridingStyle",
    question: "What's your riding style?",
    options: [
      { value: "all-mountain", label: "All-Mountain", description: "Versatile, ride everything" },
      { value: "freestyle", label: "Freestyle", description: "Parks, jumps, and tricks" },
      { value: "freeride", label: "Freeride", description: "Off-piste and powder" },
      { value: "racing", label: "Racing", description: "Speed and carving" },
    ],
  },
  {
    id: "terrain",
    question: "What terrain do you prefer?",
    options: [
      { value: "groomed", label: "Groomed Runs", description: "Smooth, maintained trails" },
      { value: "powder", label: "Powder", description: "Deep, fresh snow" },
      { value: "park", label: "Terrain Park", description: "Features and jumps" },
      { value: "backcountry", label: "Backcountry", description: "Unmarked territory" },
    ],
  },
  {
    id: "budget",
    question: "What's your budget range?",
    options: [
      { value: "budget", label: "$200-$400", description: "Entry-level options" },
      { value: "mid", label: "$400-$700", description: "Quality mid-range gear" },
      { value: "premium", label: "$700-$1000", description: "High-performance equipment" },
      { value: "pro", label: "$1000+", description: "Professional grade" },
    ],
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});

  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentQuestion.id as keyof QuizAnswers];
  const isLastQuestion = currentStep === questions.length - 1;
  // Progress advances when Next is clicked, reaches 100% when last question is answered
  const progress = isLastQuestion && currentAnswer 
    ? 100 
    : (currentStep / questions.length) * 100;

  const handleAnswer = (value: string) => {
    // Prevent selecting disabled options
    const option = currentQuestion.options.find(opt => opt.value === value);
    if (option && option.enabled === false) {
      return;
    }
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/results", { state: { answers } });
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigate("/");
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = !!currentAnswer;

  return (
    <div className="min-h-screen bg-gradient-subtle pt-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">
              Question {currentStep + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 shadow-medium animate-fade-in">
          <h2 className="text-3xl font-bold mb-8 text-foreground">
            {currentQuestion.question}
          </h2>

          <RadioGroup
            value={currentAnswer}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {currentQuestion.options.map((option) => {
              const isEnabled = option.enabled !== false;
              return (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={`
                    flex items-start space-x-3 p-4 rounded-lg border-2 transition-all
                    ${isEnabled 
                      ? "border-border hover:border-primary cursor-pointer hover:shadow-soft has-[:checked]:border-primary has-[:checked]:bg-primary/5" 
                      : "border-border/50 bg-muted/50 cursor-not-allowed opacity-60"
                    }
                  `}
                >
                  <RadioGroupItem 
                    value={option.value} 
                    id={option.value} 
                    className="mt-1" 
                    disabled={!isEnabled}
                  />
                  <div className="flex-1">
                    <div className={`font-semibold ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                      {option.label}
                    </div>
                    <div className={`text-sm ${isEnabled ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                      {option.description}
                    </div>
                  </div>
                </Label>
              );
            })}
          </RadioGroup>

          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {currentStep === 0 ? "Back to Home" : "Previous"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="bg-gradient-hero"
            >
              {currentStep === questions.length - 1 ? "See Results" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

type QuizAnswers = {
  skillLevel: string;
  terrain: string[]; // Multi-select array
  skiingStyle: string;
  gender: string;
  budget: string;
};

const questions = [
  {
    id: "skillLevel",
    question: "What trail types do you typically ski?",
    isMultiSelect: false,
    options: [
      { value: "greens", label: "Greens", description: "Beginner trails - learning the basics" },
      { value: "blues", label: "Blues", description: "Intermediate trails - comfortable on most runs" },
      { value: "blacks", label: "Blacks", description: "Advanced trails - challenging terrain" },
      { value: "double-blacks", label: "Double-Blacks", description: "Expert trails - most difficult terrain" },
    ],
  },
  {
    id: "terrain",
    question: "Where do you plan to ski? (Select all that apply)",
    isMultiSelect: true,
    options: [
      { value: "all-mountain", label: "All-Mountain", description: "Versatile skiing across all terrain types" },
      { value: "on-piste", label: "On-Piste / Groomed", description: "Mostly groomed runs and maintained trails" },
      { value: "powder", label: "Powder / Off-Piste", description: "Deep snow, ungroomed terrain, and backcountry" },
      { value: "park", label: "Park / Freestyle", description: "Terrain park, jumps, rails, and freestyle tricks" },
    ],
  },
  {
    id: "skiingStyle",
    question: "What's your skiing style?",
    isMultiSelect: false,
    options: [
      { 
        value: "powerful-fast", 
        label: "Powerful & Fast", 
        description: "Aggressive turns, high speeds, maximum edge grip",
        parkDescription: "I'm focused on large jumps and the halfpipe. I need a stiff, stable ski for high-speed takeoffs and solid landings."
      },
      { 
        value: "quick-playful", 
        label: "Quick & Playful", 
        description: "Lively, responsive turns with good maneuverability",
        parkDescription: "I'm focused on jibs, rails, and ground tricks. I want a softer, 'buttery' ski for presses, spins, and quick pivots."
      },
      { 
        value: "easy-forgiving", 
        label: "Easy & Forgiving", 
        description: "Smooth, gentle turns that are easy to initiate",
        parkDescription: "I want a versatile, all-around ski. Something that's fun on side-hits, forgiving in the park, and can still carve the rest of the mountain."
      },
    ],
  },
  {
    id: "gender",
    question: "What gender are you shopping for?",
    isMultiSelect: false,
    options: [
      { value: "mens-unisex", label: "Men's/Unisex", description: "Men's or unisex ski models" },
      { value: "womens", label: "Women's", description: "Women's specific ski models" },
    ],
  },
  {
    id: "budget",
    question: "What's your budget range? (Optional)",
    isMultiSelect: false,
    options: [
      { value: "under-500", label: "Under $500", description: "Budget-friendly options" },
      { value: "500-750", label: "$500 - $750", description: "Mid-range quality" },
      { value: "750-plus", label: "$750+", description: "Premium and high-end" },
      { value: "no-preference", label: "No Preference", description: "Show me all options" },
    ],
  },
];

const Quiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    terrain: [], // Initialize as empty array for multi-select
  });

  const currentQuestion = questions[currentStep];
  const currentAnswer = answers[currentQuestion.id as keyof QuizAnswers];
  const isLastQuestion = currentStep === questions.length - 1;
  
  // Check if park is selected for dynamic descriptions
  const isParkSelected = (answers.terrain as string[] || []).includes("park");
  
  // Progress calculation
  const progress = isLastQuestion && currentAnswer 
    ? 100 
    : (currentStep / questions.length) * 100;

  const handleAnswer = (value: string) => {
    // Prevent selecting disabled options
    const option = currentQuestion.options.find(opt => opt.value === value);
    if (option && option.enabled === false) {
      return;
    }
    
    // Handle multi-select for terrain question
    if (currentQuestion.id === "terrain" && currentQuestion.isMultiSelect) {
      const currentTerrain = (answers.terrain || []) as string[];
      const newTerrain = currentTerrain.includes(value)
        ? currentTerrain.filter(v => v !== value) // Toggle off
        : [...currentTerrain, value]; // Toggle on
      setAnswers({ ...answers, terrain: newTerrain });
    } else {
      // Single select for other questions
      setAnswers({ ...answers, [currentQuestion.id]: value });
    }
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

  // For multi-select questions, check if at least one option is selected
  // For single-select questions, check if an answer exists
  const canProceed = currentQuestion.isMultiSelect
    ? (answers.terrain as string[] || []).length > 0
    : !!currentAnswer;

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
            {currentQuestion.question.includes("(Select all that apply)") ? (
              <>
                {currentQuestion.question.replace(" (Select all that apply)", "")}
                <span className="text-lg text-muted-foreground font-normal ml-2">
                  (Select all that apply)
                </span>
              </>
            ) : (
              currentQuestion.question
            )}
          </h2>

          {currentQuestion.isMultiSelect ? (
            // Multi-select checkboxes for Question 2
            <div className="space-y-4">
              {currentQuestion.options.map((option) => {
                const isEnabled = option.enabled !== false;
                const isChecked = (answers.terrain as string[] || []).includes(option.value);
                return (
                  <Label
                    key={option.value}
                    htmlFor={option.value}
                    className={`
                      flex items-start space-x-3 p-4 rounded-lg border-2 transition-all
                      ${isEnabled 
                        ? "border-border hover:border-primary cursor-pointer hover:shadow-soft" 
                        : "border-border/50 bg-muted/50 cursor-not-allowed opacity-60"
                      }
                      ${isChecked && isEnabled ? "border-primary bg-primary/5" : ""}
                    `}
                  >
                    <Checkbox 
                      id={option.value}
                      checked={isChecked}
                      onCheckedChange={() => handleAnswer(option.value)}
                      disabled={!isEnabled}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className={`font-semibold ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                        {option.label}
                      </div>
                      <div className={`text-sm ${isEnabled ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                        {currentQuestion.id === "skiingStyle" && isParkSelected && (option as any).parkDescription
                          ? (option as any).parkDescription
                          : option.description}
                      </div>
                    </div>
                  </Label>
                );
              })}
            </div>
          ) : (
            // Single-select radio buttons for other questions
            <RadioGroup
              value={currentAnswer as string}
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
                        {currentQuestion.id === "skiingStyle" && isParkSelected && (option as any).parkDescription
                          ? (option as any).parkDescription
                          : option.description}
                      </div>
                    </div>
                  </Label>
                );
              })}
            </RadioGroup>
          )}

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
              {isLastQuestion ? "See Results" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;

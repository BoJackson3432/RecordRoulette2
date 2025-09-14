import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Disc, Clock, Trophy, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();

  const completeOnboardingMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/me/onboarding"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      onClose();
    },
  });

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to RecordRoulette!",
      description: "Discover your next favorite album through the magic of daily discovery.",
      content: "RecordRoulette transforms music discovery into a precious daily ritual. Instead of endless scrolling, you get one carefully curated album each day."
    },
    {
      icon: Clock,
      title: "Why Daily Limits?",
      description: "One album per day makes each discovery special and meaningful.",
      content: "Daily limits encourage deeper listening and prevent decision fatigue. When you know this is your one daily discovery, you're more likely to give it a real chance."
    },
    {
      icon: Disc,
      title: "Choose Your Mode",
      description: "Six discovery modes tailored to your musical journey.",
      content: "From My Music rediscovers your saved songs. For You uses AI to suggest personalized recommendations. New Artists introduces fresh sounds you haven't heard. Russian Roulette gives completely random popular albums. Mood Discovery matches your current energy, and Time-Based picks perfect albums for your moment."
    },
    {
      icon: Trophy,
      title: "Build Your Legacy",
      description: "Earn achievements and build streaks as you explore music.",
      content: "Consistency is rewarded! Build daily streaks, explore new genres, and unlock achievements that celebrate your musical journey. Every day counts."
    }
  ];

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeOnboardingMutation.mutate();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeOnboardingMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Disc className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <motion.div
              className="bg-primary h-1 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-6 text-center"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <StepIcon className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {currentStepData.title}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-4">
              {currentStepData.description}
            </p>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStepData.content}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="text-muted-foreground"
            data-testid="button-previous-onboarding"
          >
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={completeOnboardingMutation.isPending}
            className="bg-primary hover:bg-primary/90"
            data-testid="button-next-onboarding"
          >
            {completeOnboardingMutation.isPending 
              ? "Starting..." 
              : isLastStep 
                ? "Get Started!" 
                : "Next"
            }
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
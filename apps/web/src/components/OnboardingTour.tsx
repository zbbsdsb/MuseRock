import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, PenTool, Sparkles, BookOpen, X, ChevronRight, ChevronLeft } from 'lucide-react';

const TOUR_STEPS = [
  {
    id: 'welcome',
    icon: Compass,
    title: 'Welcome to MuseRock',
    subtitle: 'Your Creative Companion',
    description: 'A structured creative loop designed for writers. MuseRock guides you through four distinct stages, each serving a unique purpose in the creative process.',
    highlight: null,
  },
  {
    id: 'prime',
    icon: Compass,
    title: 'Prime: Define Your Intent',
    subtitle: 'Stage 1 of 4',
    description: 'Start by clarifying what you want to create. Define your creative intent, set constraints, and gather references. This stage prepares your mind for focused work.',
    highlight: 'stage-prime',
  },
  {
    id: 'cloister',
    icon: PenTool,
    title: 'The Cloister: Deep Focus',
    subtitle: 'Stage 2 of 4',
    description: 'Enter a distraction-free writing environment. AI stays silent here. Just you and your words. Write freely without judgment.',
    highlight: 'stage-cloister',
  },
  {
    id: 'divergence',
    icon: Sparkles,
    title: 'Divergence: Explore Ideas',
    subtitle: 'Stage 3 of 4',
    description: 'Step back and let MuseRock AI generate contrasting directions. Explore unexpected paths, challenge assumptions, and discover new possibilities.',
    highlight: 'stage-divergence',
  },
  {
    id: 'reflection',
    icon: BookOpen,
    title: 'Reflection: Capture Insights',
    subtitle: 'Stage 4 of 4',
    description: 'Close your creative loop. Answer three questions: What progressed? What did you abandon? What will you explore next?',
    highlight: 'stage-reflection',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;
  const Icon = step.icon;

  useEffect(() => {
    localStorage.setItem('muserock_tour_started', new Date().toISOString());
  }, []);

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem('muserock_tour_completed', new Date().toISOString());
      setIsVisible(false);
      setTimeout(onComplete, 300);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('muserock_tour_skipped', new Date().toISOString());
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="relative w-full max-w-lg mx-4 bg-brand-paper border border-brand-black shadow-[32px_32px_0px_0px_rgba(26,26,26,0.15)]"
        >
          <div className="p-12">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-brand-black flex items-center justify-center">
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] font-black text-brand-black/30">
                    {step.subtitle}
                  </p>
                  <h2 className="text-2xl font-serif italic font-light">{step.title}</h2>
                </div>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 text-brand-black/30 hover:text-brand-black transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-brand-black/60 font-serif leading-relaxed mb-10">
              {step.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {TOUR_STEPS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentStep
                        ? 'bg-brand-black w-6'
                        : index < currentStep
                        ? 'bg-brand-black/40'
                        : 'bg-brand-border'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-3">
                {!isFirstStep && (
                  <button
                    onClick={handlePrevious}
                    className="px-4 py-2 text-brand-black/40 hover:text-brand-black transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-brand-black text-white rounded-full text-[10px] uppercase tracking-widest font-black hover:opacity-90 transition-all flex items-center gap-2"
                >
                  {isLastStep ? 'Start Creating' : 'Next'}
                  {!isLastStep && <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-border">
            <motion.div
              className="h-full bg-brand-black"
              initial={{ width: `${(currentStep / TOUR_STEPS.length) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function useOnboardingTour() {
  const hasCompletedTour = localStorage.getItem('muserock_tour_completed');
  const hasSkippedTour = localStorage.getItem('muserock_tour_skipped');
  const hasVisited = localStorage.getItem('muserock_visited');

  const shouldShowTour = !hasCompletedTour && !hasSkippedTour && hasVisited === 'true';

  return {
    shouldShowTour,
    markTourCompleted: () => localStorage.setItem('muserock_tour_completed', new Date().toISOString()),
    markTourSkipped: () => localStorage.setItem('muserock_tour_skipped', new Date().toISOString()),
  };
}

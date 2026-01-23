import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Slide1Struggle from './onboarding/Slide1Struggle';
import Slide2Solution from './onboarding/Slide2Solution';

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState<1 | 2>(1);

  const handleSlide1Complete = () => {
    setCurrentSlide(2);
  };

  const handleSlide2Complete = () => {
    // Auto-advance to signup after slide 2
    onComplete();
  };

  return (
    <div className="size-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        {currentSlide === 1 && (
          <Slide1Struggle key="slide1" onComplete={handleSlide1Complete} />
        )}
        {currentSlide === 2 && (
          <Slide2Solution key="slide2" onComplete={handleSlide2Complete} />
        )}
      </AnimatePresence>
    </div>
  );
}
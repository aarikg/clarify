"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";

interface EquationExplorerProps {
    steps: string[];
}

export default function EquationExplorer({ steps }: EquationExplorerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        synthRef.current = window.speechSynthesis;
    }, []);

    const speakStep = (index: number) => {
        if (!synthRef.current) return;

        synthRef.current.cancel(); // Stop current speech
        const utterance = new SpeechSynthesisUtterance(steps[index]);
        utterance.rate = 1.0;
        synthRef.current.speak(utterance);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (currentIndex < steps.length - 1) {
                setCurrentIndex(prev => prev + 1);
                speakStep(currentIndex + 1);
            }
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (currentIndex > 0) {
                setCurrentIndex(prev => prev - 1);
                speakStep(currentIndex - 1);
            }
        }
    };

    const goToStep = (index: number) => {
        setCurrentIndex(index);
        speakStep(index);
    };

    if (!steps || steps.length === 0) return null;

    return (
        <div
            ref={containerRef}
            className="glass-panel rounded-[2rem] p-8 border border-white/10 relative overflow-hidden group focus-visible:ring-4 focus-visible:ring-[var(--color-primary)] outline-none"
            tabIndex={0}
            onKeyDown={handleKeyDown}
            aria-label="Interactive Equation Explorer. Use arrow keys to step through the math."
        >
            <div className="absolute top-0 right-0 p-4 opacity-50 flex items-center gap-2 text-sm text-gray-400">
                <MousePointerClick size={16} />
                <span>Click to focus, then use <kbd className="bg-white/10 rounded px-1">←</kbd> <kbd className="bg-white/10 rounded px-1">→</kbd> to explore</span>
            </div>

            <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6 uppercase tracking-wider px-2">
                Interactive Explorer
            </h3>

            <div className="flex flex-col items-center justify-center min-h-[150px] space-y-8">
                {/* Main Display */}
                <div
                    className="text-4xl md:text-5xl font-bold text-center text-white min-h-[80px] flex items-center justify-center animate-in fade-in duration-300"
                    key={currentIndex} // Force re-render for animation on change
                    aria-live="polite"
                >
                    {steps[currentIndex]}
                </div>

                {/* Progress Indicators & Controls */}
                <div className="flex items-center gap-6 w-full max-w-md mx-auto">
                    <button
                        onClick={() => goToStep(Math.max(0, currentIndex - 1))}
                        disabled={currentIndex === 0}
                        className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        aria-label="Previous step"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <div className="flex-1 flex justify-center gap-2">
                        {steps.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goToStep(idx)}
                                aria-label={`Go to step ${idx + 1}`}
                                aria-current={idx === currentIndex ? "step" : undefined}
                                className={`h-3 rounded-full transition-all duration-300 ${idx === currentIndex
                                        ? "w-8 bg-[var(--color-primary)] shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                        : "w-3 bg-white/20 hover:bg-white/40"
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={() => goToStep(Math.min(steps.length - 1, currentIndex + 1))}
                        disabled={currentIndex === steps.length - 1}
                        className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                        aria-label="Next step"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>
            </div>
        </div>
    );
}

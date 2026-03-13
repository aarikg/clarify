"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

interface HeaderProps {
    isHelpOpen?: boolean;
    setIsHelpOpen?: (isOpen: boolean) => void;
}

export default function Header({ isHelpOpen: propIsHelpOpen, setIsHelpOpen: propSetIsHelpOpen }: HeaderProps = {}) {
    const [localIsHelpOpen, setLocalIsHelpOpen] = useState(false);

    const isHelpOpen = propIsHelpOpen !== undefined ? propIsHelpOpen : localIsHelpOpen;
    const setIsHelpOpen = (val: boolean | ((prev: boolean) => boolean)) => {
        const nextVal = typeof val === 'function' ? val(isHelpOpen) : val;
        if (propSetIsHelpOpen) propSetIsHelpOpen(nextVal);
        else setLocalIsHelpOpen(nextVal);
    };
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus management for modal
    useEffect(() => {
        if (isHelpOpen && closeButtonRef.current) {
            closeButtonRef.current.focus();
        }
    }, [isHelpOpen]);

    const toggleHelp = () => setIsHelpOpen((prev) => !prev);

    // Close modal on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isHelpOpen) {
                setIsHelpOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isHelpOpen]);

    return (
        <>
            <header className="fixed top-0 w-full z-40 glass flex items-center justify-between px-8 py-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-yellow-200 shadow-[0_0_15px_rgba(234,179,8,0.4)]" aria-hidden="true"></div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">Clarify</h1>
                </div>

                <button
                    onClick={toggleHelp}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white font-medium text-lg rounded-full hover:bg-white/20 transition-all border border-white/10 hover:border-white/30"
                    aria-label="Open help instructions"
                    aria-haspopup="dialog"
                    aria-expanded={isHelpOpen}
                >
                    <HelpCircle size={20} />
                    Help
                </button>
            </header>

            {/* Modern Modal */}
            {isHelpOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="help-title"
                >
                    <div className="bg-[#111] border border-white/10 shadow-2xl p-10 max-w-2xl w-full rounded-3xl relative flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start">
                            <h2 id="help-title" className="text-4xl font-bold bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">How to Use Clarify</h2>
                            <button
                                ref={closeButtonRef}
                                onClick={() => setIsHelpOpen(false)}
                                className="w-10 h-10 flex items-center justify-center bg-white/5 text-white rounded-full hover:bg-white/15 transition-colors"
                                aria-label="Close help instructions"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6 text-xl text-gray-300 leading-relaxed font-light">
                            <p>Welcome to Clarify – transforming complex STEM materials into accessible audio.</p>
                            <ul className="list-none space-y-4">
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                                    <span><strong>Scanner:</strong> Upload images of math equations or graphs. Clarify extracts the data, offers interactive exploration, and reads it aloud seamlessly.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                                    <span><strong>Live Captions:</strong> Activate your microphone to transcribe fast-paced STEM lectures into beautifully formatted, real-time LaTeX displays.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">3</div>
                                    <span><strong>Code Reader:</strong> Paste raw, punctuation-heavy programming scripts to hear a clean, human-friendly breakdown of what the logic actually does.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-sm">4</div>
                                    <span><strong>Sonify Data:</strong> Input mathematical functions (e.g., y=x^2) or describe data trends to literally "hear" their shapes sweep left-to-right.</span>
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={() => setIsHelpOpen(false)}
                            className="mt-4 w-full py-4 rounded-xl bg-[var(--color-primary)] text-black font-bold text-xl hover:scale-[1.02] transition-transform"
                        >
                            Got it
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

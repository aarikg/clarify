"use client";

import { useState, useRef, useEffect } from "react";
import { HelpCircle, X } from "lucide-react";

export default function Header() {
    const [isHelpOpen, setIsHelpOpen] = useState(false);
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
            <header className="flex items-center justify-between p-6 border-b-4 border-white">
                <h1 className="text-3xl font-bold tracking-tight">STEM Access Interpreter</h1>

                <button
                    onClick={toggleHelp}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-black font-bold text-xl rounded-md hover:scale-105 transition-transform"
                    aria-label="Open help instructions"
                    aria-haspopup="dialog"
                    aria-expanded={isHelpOpen}
                >
                    <HelpCircle size={28} />
                    Help
                </button>
            </header>

            {/* Basic Modal */}
            {isHelpOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="help-title"
                >
                    <div className="bg-black border-4 border-[var(--color-primary)] p-8 max-w-2xl w-full rounded-xl relative flex flex-col gap-6">
                        <div className="flex justify-between items-start">
                            <h2 id="help-title" className="text-4xl font-bold text-[var(--color-primary)]">How to Use</h2>
                            <button
                                ref={closeButtonRef}
                                onClick={() => setIsHelpOpen(false)}
                                className="p-2 bg-white text-black rounded-md hover:bg-gray-200"
                                aria-label="Close help instructions"
                            >
                                <X size={32} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xl leading-relaxed">
                            <p>Welcome to the STEM Access Interpreter.</p>
                            <ul className="list-disc pl-8 space-y-2">
                                <li><strong>Upload a Document:</strong> Use the massive dropzone area to drag and drop a PDF or image of your STEM material. You can also use the buttons to select a file manually, use your camera, or paste from your clipboard.</li>
                                <li><strong>Processing:</strong> Wait a few seconds while the AI extracts the math and text.</li>
                                <li><strong>Review Results:</strong> Once processed, you will see a summary, a button to listen to the audio description of the math, and the raw text output.</li>
                            </ul>
                            <p>All interactive elements are fully keyboard navigable via the Tab key.</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

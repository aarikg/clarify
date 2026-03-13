"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";

// Types for SpeechRecognition API
interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
}

export default function LiveCaptionsView() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [latexMath, setLatexMath] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Use any because SpeechRecognition is not fully typed in standard TS yet for cross-browser
    const recognitionRef = useRef<any>(null);
    const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Initialize SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setError("Your browser does not support Live Speech Recognition. Please use Chrome or Edge.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true; // Keep listening
        recognition.interimResults = true; // Show results while speaking
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let currentTranscript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                currentTranscript += event.results[i][0].transcript;
            }

            // Only update live raw text if it's substantial, 
            // wait for the final pause to send to Gemini
            setTranscript(currentTranscript);

            if (event.results[event.results.length - 1].isFinal) {
                // User paused speaking. Send this final chunk to Gemini
                processSpeechToLatex(currentTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                setError("Microphone access denied. Please allow permissions.");
            } else if (event.error !== 'aborted') {
                // Silence aborted errors which happen on manual stop
                setError(`Error: ${event.error}`);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            // Auto-restart if we didn't manually stop it (continuous listening workaround)
            if (isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    // Might throw if already started
                }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Sync state for auto-restart mechanism
    useEffect(() => {
        if (isListening && recognitionRef.current) {
            try {
                // If the connection drops silently, this ensures it restarts
                if (!recognitionRef.current.started) {
                    recognitionRef.current.start();
                }
            } catch (e) { }
        }
    }, [isListening]);


    const processSpeechToLatex = async (text: string) => {
        if (!text.trim()) return;

        setIsProcessing(true);
        try {
            const response = await fetch("/api/caption", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) throw new Error("Failed to process math");

            const data = await response.json();

            // Append or replace. For a live class, appending the last few sentences is best
            setLatexMath((prev) => {
                // Keep the last 5 equations to avoid massive scrolling natively, but ensure they stack
                const prevEqs = prev ? prev.split("\n\n") : [];
                if (prevEqs.length > 3) prevEqs.shift(); // remove oldest
                return [...prevEqs, data.latex].join("\n\n");
            });

        } catch (err) {
            console.error("Gemini Transcription Error:", err);
            // Don't show critical UI error for a missed phrase, just log it
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleListening = () => {
        if (error && error.includes("not support")) return;

        if (isListening) {
            setIsListening(false);
            if (recognitionRef.current) recognitionRef.current.stop();
        } else {
            setIsListening(true);
            setTranscript("Listening...");
            setLatexMath(""); // Clear previous session
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                } catch (e) {
                    // Catch race conditions where it's already "starting"
                }
            }
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">

            <div className="text-center mb-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">Live Math Captions</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Transform messy spoken mathematics into perfectly formatted notation on the fly.
                    Ideal for deaf or hard-of-hearing students in fast-paced STEM lectures.
                </p>
            </div>

            {error && (
                <div className="glass-panel p-4 rounded-xl border border-red-500/30 flex items-center gap-4 text-red-400 w-full animate-in zoom-in-95">
                    <AlertCircle size={24} />
                    <p>{error}</p>
                </div>
            )}

            {/* Main Microphone Button */}
            <div className="flex flex-col items-center justify-center py-8">
                <button
                    onClick={toggleListening}
                    disabled={!!error && error.includes("not support")}
                    className={`group relative flex items-center justify-center p-12 rounded-full transition-all duration-500 ${isListening
                            ? "bg-red-500 text-white shadow-[0_0_100px_rgba(239,68,68,0.6)] scale-[0.95]"
                            : "bg-[var(--color-primary)] text-black shadow-[0_0_60px_rgba(234,179,8,0.3)] hover:scale-105"
                        }`}
                    aria-label={isListening ? "Stop live captioning" : "Start live captioning"}
                >
                    {isListening && <div className="absolute inset-0 border-4 border-red-500 rounded-full animate-ping opacity-50"></div>}
                    {isListening ? <MicOff size={64} className="relative z-10" /> : <Mic size={64} className="relative z-10" />}
                </button>
                <p className="mt-6 text-xl font-bold text-gray-300">
                    {isListening ? "Listening natively..." : "Tap to start capturing lecture"}
                </p>
            </div>

            {/* Display Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-4">

                {/* Raw Speech (Subtitles) */}
                <div className="glass-panel p-8 rounded-[2rem] border border-white/10 flex flex-col h-[400px]">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                        <h3 className="text-gray-400 font-bold tracking-wider uppercase">Raw Spoken Subtitles</h3>
                        {isListening && <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>}
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar relative">
                        {transcript ? (
                            <p className="text-3xl font-medium leading-relaxed text-gray-200">
                                "{transcript}"
                            </p>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 italic">
                                Awaiting speech...
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Formatted LaTeX */}
                <div className="glass-panel p-8 rounded-[2rem] border border-[var(--color-primary)]/30 flex flex-col h-[400px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-50"></div>
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4 relative z-10">
                        <h3 className="text-[var(--color-primary)] font-bold tracking-wider uppercase flex items-center gap-3">
                            AI Formatted Notation
                            {isProcessing && <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>}
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 bg-black/40 rounded-xl p-6">
                        {latexMath ? (
                            <div className="flex flex-col gap-8 justify-end min-h-full">
                                {latexMath.split("\n\n").map((eq, i) => (
                                    <div key={i} className="animate-in slide-in-from-bottom-4 fade-in duration-500 text-3xl sm:text-4xl text-white">
                                        <BlockMath math={eq} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600 italic text-center px-8">
                                AI will instantly translate messy spoken math jargon into clean equations here.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

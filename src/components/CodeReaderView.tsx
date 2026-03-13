"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, FileCode2, Square, Wand2 } from "lucide-react";

export default function CodeReaderView() {
    const [code, setCode] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ semantic_summary: string, logic_breakdown: string[] } | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const synthRef = useRef<SpeechSynthesis | null>(null);

    useEffect(() => {
        synthRef.current = window.speechSynthesis;
        return () => {
            if (synthRef.current && synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        };
    }, []);

    const handleAnalyze = async () => {
        if (!code.trim()) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const response = await fetch("/api/code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) throw new Error("Processing failed");

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Code analysis error:", err);
            alert("Failed to analyze code block. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleAudio = () => {
        if (!synthRef.current || !result) return;

        if (isPlaying) {
            synthRef.current.cancel();
            setIsPlaying(false);
        } else {
            synthRef.current.cancel();

            // Build full utterance text
            const fullText = result.semantic_summary + ". " + result.logic_breakdown.join(". ");
            const utterance = new SpeechSynthesisUtterance(fullText);

            utterance.onend = () => setIsPlaying(false);
            utterance.onerror = () => setIsPlaying(false);

            synthRef.current.speak(utterance);
            setIsPlaying(true);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">

            <div className="text-center mb-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">Code Semantic Reader</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    A screen reader built for code logic. Paste raw syntax and listen to a crystal clear, audio-friendly breakdown of what the code actually does, skipping the punctuation.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-4">

                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <div className="glass-panel rounded-[2rem] border border-white/10 p-6 flex-1 min-h-[500px] flex flex-col relative focus-within:border-[var(--color-primary)]/50 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-[var(--color-primary)] font-bold uppercase tracking-wider">
                            <FileCode2 size={20} />
                            Code Input
                        </div>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Paste your nasty, bracket-filled code block here..."
                            className="w-full flex-1 bg-transparent text-gray-300 font-mono resize-none focus:outline-none placeholder-gray-600"
                            aria-label="Paste code block here"
                        />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={!code.trim() || isProcessing}
                        className="group relative flex items-center justify-center gap-3 py-5 px-10 bg-[var(--color-primary)] text-black rounded-full font-bold text-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isProcessing ? (
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Wand2 size={24} />
                        )}
                        {isProcessing ? "Analyzing Logic..." : "Generate AI Summary"}
                    </button>
                </div>

                {/* Output Area */}
                <div className="glass-panel p-8 rounded-[2rem] border border-[var(--color-primary)]/30 flex flex-col min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-50"></div>

                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <Volume2 size={64} className="mb-4 text-[var(--color-primary)] opacity-50" />
                            <p className="text-xl font-medium text-gray-300">Awaiting Code Block</p>
                            <p className="text-gray-500 mt-2 max-w-sm">The semantic logic breakdown and audio controls will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in-95">
                            <div className="flex flex-col gap-6 pr-2">
                                <div>
                                    <h3 className="text-gray-400 font-bold tracking-wider uppercase mb-3">Semantic Overview</h3>
                                    <p className="text-2xl font-medium text-white leading-relaxed">
                                        {result.semantic_summary}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-gray-400 font-bold tracking-wider uppercase mb-4">Logic Flow</h3>
                                    <ul className="space-y-4">
                                        {result.logic_breakdown.map((step, i) => (
                                            <li key={i} className="text-gray-300 flex items-start gap-4">
                                                <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-gray-400 flex-shrink-0 mt-1">{i + 1}</span>
                                                <span className="text-lg leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button
                                onClick={toggleAudio}
                                className={`mt-auto w-full shrink-0 py-6 flex items-center justify-center gap-4 rounded-2xl font-black text-2xl transition-all duration-300 ${isPlaying
                                    ? "bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)]"
                                    : "bg-white/10 border border-white/20 text-white hover:bg-white/20"
                                    }`}
                                aria-label={isPlaying ? "Stop code reader audio" : "Play code reader audio"}
                            >
                                {isPlaying ? <Square size={28} className="animate-pulse" /> : <Volume2 size={28} />}
                                {isPlaying ? "Stop Reading" : "Read Logic Breakdown"}
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

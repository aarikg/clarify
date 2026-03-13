"use client";

import { useState } from "react";
import { Activity, Play, Square, Wand2 } from "lucide-react";
import GraphSonifier from "./GraphSonifier";

export default function SonificationPlaygroundView() {
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<{ data_points: { x: string; y: number }[]; summary: string } | null>(null);

    const handleAnalyze = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);
        setResult(null);

        try {
            const response = await fetch("/api/sonify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ input }),
            });

            if (!response.ok) throw new Error("Processing failed");

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error("Sonification error:", err);
            alert("Failed to generate audio data. Try a simpler description.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">

            <div className="text-center mb-4">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">Data Sonification Playground</h2>
                <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                    Type a mathematical function (e.g. "y = sin(x)") or describe a data trend,
                    and listen to its shape using the Web Audio API.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full mt-4">

                {/* Input Area */}
                <div className="flex flex-col gap-4">
                    <div className="glass-panel rounded-[2rem] border border-white/10 p-6 flex-1 min-h-[400px] flex flex-col relative focus-within:border-[var(--color-primary)]/50 transition-colors">
                        <div className="flex items-center gap-3 mb-4 text-[var(--color-primary)] font-bold uppercase tracking-wider">
                            <Activity size={20} />
                            Math / Data Input
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='Try something like:&#10;"y = -x^2"&#10;&#10;or...&#10;&#10;"Stock market data that slowly rises, drops sharply, and bounces back."'
                            className="w-full flex-1 bg-transparent text-gray-300 font-mono resize-none focus:outline-none placeholder-gray-600 text-lg leading-relaxed"
                            aria-label="Enter math function or data trend description"
                        />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={!input.trim() || isProcessing}
                        className="group relative flex items-center justify-center gap-3 py-5 px-10 bg-[var(--color-primary)] text-black rounded-full font-bold text-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isProcessing ? (
                            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <Wand2 size={24} />
                        )}
                        {isProcessing ? "Generating Audio Map..." : "Sonify Data"}
                    </button>
                </div>

                {/* Output Area */}
                <div className="glass-panel p-8 rounded-[2rem] border border-[var(--color-primary)]/30 flex flex-col min-h-[400px] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-50"></div>

                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                            <Activity size={64} className="mb-4 text-[var(--color-primary)] opacity-50" />
                            <p className="text-xl font-medium text-gray-300">Awaiting Math Input</p>
                            <p className="text-gray-500 mt-2 max-w-sm">The audio player and AI summary will appear here.</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-6 animate-in fade-in zoom-in-95 justify-between">
                            <div className="pr-2">
                                <h3 className="text-[var(--color-primary)] font-bold tracking-wider uppercase mb-3">AI Visual Summary</h3>
                                <p className="text-2xl font-medium text-white leading-relaxed">
                                    {result.summary}
                                </p>
                            </div>

                            {/* Render the core Graph Sonifier component we built earlier */}
                            <div className="mt-auto w-full shrink-0 pt-2 border-t border-white/10">
                                <h3 className="text-gray-400 font-bold tracking-wider uppercase mb-3 px-2">Data Sonifier</h3>
                                <GraphSonifier data={result.data_points as any} />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

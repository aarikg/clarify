"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Square, RefreshCcw } from "lucide-react";
import { OutputData } from "@/lib/types";
import EquationExplorer from "./EquationExplorer";
import GraphSonifier from "./GraphSonifier";
import ExportMenu from "./ExportMenu";
import { saveScanToLibrary, deleteScan } from "@/lib/storage";
import { Bookmark, BookmarkCheck, BookmarkMinus } from "lucide-react";

interface OutputViewProps {
    data: OutputData;
    previewUrl: string;
    onReset: () => void;
}

export default function OutputView({ data, previewUrl, onReset }: OutputViewProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(!!(data as any).id);
    const [hoverSaved, setHoverSaved] = useState(false);

    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        setIsSaved(!!(data as any).id);
        setHoverSaved(false);
    }, [data]);


    useEffect(() => {
        synthRef.current = window.speechSynthesis;

        // Set up the utterance
        const utterance = new SpeechSynthesisUtterance(data.audio_optimized_text);
        // Use an assertive rate and simple voice if possible, defaults to OS default
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);

        utteranceRef.current = utterance;

        return () => {
            if (synthRef.current && synthRef.current.speaking) {
                synthRef.current.cancel();
            }
        };
    }, [data.audio_optimized_text]);

    const toggleAudio = () => {
        if (!synthRef.current || !utteranceRef.current) return;

        if (isPlaying) {
            synthRef.current.cancel();
            setIsPlaying(false);
        } else {
            synthRef.current.cancel(); // cancel any pending speech
            synthRef.current.speak(utteranceRef.current);
            setIsPlaying(true);
        }
    };

    const handleSave = async () => {
        if (isSaved && (data as any).id) {
            try {
                deleteScan((data as any).id);
                setIsSaved(false);
                setHoverSaved(false);
                delete (data as any).id;
            } catch (error) {
                console.error("Failed to delete from library:", error);
            }
            return;
        }

        try {
            setIsSaving(true);
            const title = `Scan - ${new Date().toLocaleDateString()}`;
            const newId = saveScanToLibrary(data, title);
            (data as any).id = newId;
            setIsSaved(true);
            setHoverSaved(false);
        } catch (error) {
            console.error("Failed to save to library:", error);
            alert("Failed to save scan to Library.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full flex flex-col xl:flex-row gap-10 p-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Left Column: Reference Image */}
            <div className="w-full xl:w-1/3 flex flex-col gap-6">
                <div className="glass-panel rounded-[2.5rem] overflow-hidden flex items-center justify-center p-8 aspect-auto xl:aspect-[3/4] hover:shadow-[0_20px_60px_rgba(255,255,255,0.05)] transition-shadow duration-500 relative group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
                    <img
                        src={previewUrl}
                        alt="Thumbnail of uploaded document"
                        className="max-w-full h-auto max-h-[60vh] object-contain drop-shadow-2xl rounded-xl group-hover:scale-[1.03] transition-transform duration-500"
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={onReset}
                        className="flex items-center justify-center gap-3 py-6 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-[2rem] font-bold text-2xl transition-all hover:scale-[1.02]"
                        aria-label="Scan another document"
                    >
                        <RefreshCcw size={28} />
                        Scan Another
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        onMouseEnter={() => setHoverSaved(true)}
                        onMouseLeave={() => setHoverSaved(false)}
                        className={`flex items-center justify-center gap-3 py-4 px-4 border rounded-[2rem] font-bold text-xl transition-all ${isSaved
                            ? hoverSaved ? "bg-red-500/20 text-red-400 border-red-500/50" : "bg-green-500/20 text-green-400 border-green-500/50"
                            : "bg-transparent hover:bg-white/5 border-white/10 text-gray-300 hover:text-white"
                            }`}
                        aria-label={isSaved ? "Remove from Library" : "Save to Library"}
                    >
                        {isSaving ? (
                            <div className="w-6 h-6 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        ) : isSaved ? (
                            hoverSaved ? <BookmarkMinus size={24} /> : <BookmarkCheck size={24} />
                        ) : (
                            <Bookmark size={24} />
                        )}
                        {isSaving ? "Saving..." : isSaved ? (hoverSaved ? "Unsave" : "Saved to Library!") : "Save to Library"}
                    </button>
                </div>
            </div>

            {/* Right Column: Data & Interactivity */}
            <div className="w-full xl:w-2/3 flex flex-col gap-8">

                {/* Global Audio Description */}
                <section aria-label="Audio Player" className="w-full">
                    <button
                        onClick={toggleAudio}
                        className={`group relative w-full py-12 px-8 flex items-center justify-center gap-6 rounded-[2.5rem] font-black text-4xl sm:text-5xl transition-all duration-300 overflow-hidden ${isPlaying
                            ? "bg-red-500 text-white shadow-[0_0_80px_rgba(239,68,68,0.5)] scale-[0.98]"
                            : "bg-[var(--color-primary)] text-black shadow-[0_0_60px_rgba(234,179,8,0.2)] hover:scale-[1.02]"
                            }`}
                        aria-label={isPlaying ? "Stop audio description" : "Play audio description"}
                        aria-live="polite"
                    >
                        {/* Glow effect */}
                        {!isPlaying && <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>}

                        {isPlaying ? <Square size={56} fill="currentColor" className="relative z-10 animate-pulse" /> : <Play size={56} fill="currentColor" className="relative z-10" />}
                        <span className="relative z-10">{isPlaying ? "Stop Audio" : "Play Audio Description"}</span>
                    </button>
                </section>

                <div className="grid grid-cols-1 gap-8">

                    {/* Advanced View: Conditional Sonification */}
                    {data.data_points && data.data_points.length > 0 && (
                        <GraphSonifier data={data.data_points} />
                    )}

                    {/* Advanced View: Conditional Interactive Explorer */}
                    {data.interactive_steps && data.interactive_steps.length > 0 && (
                        <EquationExplorer steps={data.interactive_steps} />
                    )}

                    {/* Summary Card with Export Options */}
                    <section aria-labelledby="summary-heading" className="glass-panel p-10 rounded-[2.5rem] border border-white/10 relative overflow-visible">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-primary)] to-transparent opacity-50"></div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 relative z-20">
                            <h2 id="summary-heading" className="text-2xl font-bold text-gray-400 uppercase tracking-wider">Summary</h2>
                            <ExportMenu braille={data.nemeth_braille} mathml={data.mathml} />
                        </div>
                        <p className="text-3xl leading-relaxed text-white font-medium">{data.summary}</p>
                    </section>

                    {/* macOS Terminal Output */}
                    <section aria-labelledby="raw-data-heading">
                        <h2 id="raw-data-heading" className="text-2xl font-bold text-[var(--color-primary)] mb-6 uppercase tracking-wider px-2">Raw Extracted Data</h2>
                        <div className="glass-panel border border-white/10 rounded-[2rem] overflow-hidden">
                            <div className="bg-[#1e1e1e] w-full macos-window-dots border-b border-black"></div>
                            <pre
                                className="text-lg font-mono bg-black/60 p-8 overflow-x-auto whitespace-pre-wrap select-all text-gray-300"
                                aria-label="Raw latex code output"
                                tabIndex={0}
                            >
                                {data.raw_latex}
                            </pre>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

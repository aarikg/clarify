"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Square, Activity } from "lucide-react";

interface DataPoint {
    x: number;
    y: number;
}

interface GraphSonifierProps {
    data: DataPoint[];
}

export default function GraphSonifier({ data }: GraphSonifierProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null); // For animation timing

    // UI Progress State
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Initialize AudioContext only on client side
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        return () => {
            stopSonification();
            if (audioCtxRef.current?.state !== "closed") {
                audioCtxRef.current?.close();
            }
        };
    }, []);

    const playSonification = () => {
        if (!audioCtxRef.current || data.length === 0) return;

        // Ensure context is running (browsers block it until user interaction)
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }

        stopSonification(); // Reset any existing playback
        setIsPlaying(true);
        setProgress(0);

        const ctx = audioCtxRef.current;
        const totalDuration = 3.0; // 3 seconds total sweep time
        const timePerPoint = totalDuration / data.length;

        // Create nodes
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Configure Nodes
        osc.type = "sine"; // Smooth beep

        // Find min/max Y to map to frequencies (e.g., 200Hz to 800Hz)
        const yValues = data.map(d => d.y);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        const rangeY = maxY - minY === 0 ? 1 : maxY - minY; // avoid div by 0

        const minFreq = 200;
        const maxFreq = 800;

        // Schedule frequency changes
        const startTime = ctx.currentTime + 0.1; // Small buffer
        osc.frequency.setValueAtTime(
            minFreq + ((data[0].y - minY) / rangeY) * (maxFreq - minFreq),
            startTime
        );

        data.forEach((point, index) => {
            if (index === 0) return;
            const freq = minFreq + ((point.y - minY) / rangeY) * (maxFreq - minFreq);
            // Linear ramp to next point for smooth "sweeping" sound connecting the dots
            osc.frequency.linearRampToValueAtTime(freq, startTime + (index * timePerPoint));
        });

        // Envelope (Fade in and Out to prevent popping)
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime); // Max volume 0.3
        gain.gain.setValueAtTime(0.3, startTime + totalDuration - 0.1);
        gain.gain.linearRampToValueAtTime(0, startTime + totalDuration);

        // Connect and start
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + totalDuration);

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;

        // UI Animation Sync
        const updateProgress = () => {
            setProgress(prev => {
                if (prev >= 100) return 100;
                return prev + (100 / (totalDuration * 60)); // ~60fps
            });
            timeoutRef.current = setTimeout(updateProgress, 1000 / 60);
        };
        updateProgress();

        // Handle end
        osc.onended = () => {
            setIsPlaying(false);
            setProgress(0);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    };

    const stopSonification = () => {
        if (oscillatorRef.current) {
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
            } catch (e) { /* ignore already stopped */ }
        }
        if (gainNodeRef.current) {
            gainNodeRef.current.disconnect();
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setIsPlaying(false);
        setProgress(0);
    };

    if (!data || data.length === 0) return null;

    return (
        <div className="glass-panel p-8 rounded-[2rem] border border-white/10 relative overflow-hidden group">
            <h3 className="text-2xl font-bold text-[var(--color-primary)] mb-6 uppercase tracking-wider px-2 flex items-center gap-3">
                <Activity size={24} className="animate-pulse" />
                Data Sonification
            </h3>

            <p className="text-gray-400 text-lg mb-8 px-2 max-w-2xl">
                This document contains a graph. Listen to the shape of the data curve using your browser&apos;s Web Audio synthesizer. High pitches equal higher values.
            </p>

            <div className="flex flex-col md:flex-row items-center gap-6">
                <button
                    onClick={isPlaying ? stopSonification : playSonification}
                    className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isPlaying
                            ? "bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)] scale-95"
                            : "bg-[var(--color-primary)] text-black shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:scale-105"
                        }`}
                    aria-label={isPlaying ? "Stop graph sonification" : "Play graph sonification"}
                >
                    {isPlaying ? <Square size={32} fill="currentColor" className="animate-pulse" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                </button>

                {/* Progress Bar Display */}
                <div className="flex-1 w-full bg-black/40 h-8 rounded-full overflow-hidden relative border border-white/10">
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--color-primary)]/50 to-[var(--color-primary)] transition-all duration-75 ease-linear"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Visualizer effect (static dots for representation) */}
                    <div className="absolute inset-0 flex items-end justify-between px-4 pb-1 opacity-30">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-white rounded-t-sm"
                                style={{ height: `${Math.random() * 80 + 20}%` }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

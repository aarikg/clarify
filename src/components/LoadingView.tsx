"use client";

import { Loader2 } from "lucide-react";

export default function LoadingView() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center space-y-10 animate-in fade-in duration-500">
            <div
                aria-live="assertive"
                className="sr-only"
            >
                analyzing document. extracting math and graphs. please wait.
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-[var(--color-primary)]/20 blur-2xl rounded-full"></div>
                <Loader2
                    className="w-24 h-24 sm:w-32 sm:h-32 animate-spin text-[var(--color-primary)] relative z-10"
                    aria-hidden="true"
                    strokeWidth={1.5}
                />
            </div>

            <div className="space-y-4">
                <p className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent" aria-hidden="true">
                    Analyzing Document
                </p>
                <p className="text-xl text-gray-400 font-light">Extracting text, math, and structures...</p>
            </div>
        </div>
    );
}

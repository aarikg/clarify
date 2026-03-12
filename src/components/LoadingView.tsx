"use client";

import { Loader2 } from "lucide-react";

export default function LoadingView() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full text-center space-y-8">
            <div
                aria-live="assertive"
                className="sr-only"
            >
                analyzing document. extracting math and graphs. please wait.
            </div>

            <Loader2
                className="w-32 h-32 animate-spin text-[var(--color-primary)]"
                aria-hidden="true"
            />

            <p className="text-4xl font-bold tracking-wide" aria-hidden="true">
                Processing Document...
            </p>
        </div>
    );
}

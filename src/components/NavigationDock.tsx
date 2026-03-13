"use client";

import { Home, ScanText, Library, FileCode2, Mic, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export type TabType = "home" | "scan" | "library" | "code_reader" | "live_captions" | "sonify";

interface NavigationDockProps {
    currentTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function NavigationDock({ currentTab, onTabChange }: NavigationDockProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Slight delay to animate in after initial load
    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(t);
    }, []);

    const tabs: { id: TabType, label: string, icon: any }[] = [
        { id: "home", label: "Home", icon: Home },
        { id: "scan", label: "Scanner", icon: ScanText },
        { id: "live_captions", label: "Live Captions", icon: Mic },
        { id: "code_reader", label: "Code Reader", icon: FileCode2 },
        { id: "sonify", label: "Sonify Data", icon: Activity },
        { id: "library", label: "Library", icon: Library },
    ];

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-16 duration-700 ease-out">
            <div className="glass shadow-2xl rounded-full p-2 flex items-center gap-2 border border-white/20">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`relative flex items-center justify-center px-6 py-3 rounded-full transition-all duration-300 ${isActive
                                ? "text-black font-bold scale-105"
                                : "text-gray-400 hover:text-white hover:bg-white/10"
                                }`}
                            aria-label={`Navigate to ${tab.label}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {/* Active Tab Background Pill */}
                            {isActive && (
                                <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full -z-10 shadow-[0_0_20px_rgba(234,179,8,0.4)]"></div>
                            )}

                            <div className="flex items-center gap-2">
                                <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                {/* Label is hidden on very small screens unless active to save space */}
                                <span className={`text-sm tracking-wide ${isActive ? "block" : "hidden sm:block"}`}>
                                    {tab.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

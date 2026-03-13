"use client";

import { useEffect, useState } from "react";
import { getSavedScans, SavedScan, deleteScan } from "@/lib/storage";
import { Trash2, BookOpen, Clock, FileText } from "lucide-react";
import { OutputData } from "@/lib/types";

interface LibraryViewProps {
    onLoadScan: (data: OutputData) => void;
}

export default function LibraryView({ onLoadScan }: LibraryViewProps) {
    const [scans, setScans] = useState<SavedScan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only run on client
        const data = getSavedScans();
        setScans(data);
        setIsLoading(false);
    }, []);

    const handleDelete = (e: React.MouseEvent, scanId: string | undefined) => {
        e.stopPropagation(); // Prevent loading the scan
        if (!scanId || !confirm("Are you sure you want to delete this scan?")) return;

        try {
            deleteScan(scanId);
            setScans(scans.filter(s => s.id !== scanId));
        } catch (error) {
            alert("Failed to delete scan.");
        }
    };

    if (isLoading) {
        return (
            <div className="w-full flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-t-transparent border-[var(--color-primary)] rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-12 px-4">
                <div>
                    <h2 className="text-4xl font-black text-white mb-2">Your Library</h2>
                    <p className="text-gray-400">All your saved scans on this device</p>
                </div>
                <div className="glass-panel px-6 py-3 rounded-full border border-white/10 flex items-center gap-3 mt-4 sm:mt-0">
                    <FileText size={20} className="text-[var(--color-primary)]" />
                    <span className="font-bold text-lg">{scans.length} Scans Saved</span>
                </div>
            </div>

            {scans.length === 0 ? (
                <div className="w-full p-16 glass-panel rounded-[3rem] border border-white/10 text-center border-dashed">
                    <p className="text-2xl text-gray-500 font-medium">Your library is currently empty.</p>
                    <p className="text-gray-600 mt-2">Scan a new document and click "Save to Library".</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {scans.map((scan) => (
                        <div
                            key={scan.id}
                            onClick={() => onLoadScan(scan)}
                            className="group glass-panel p-8 rounded-[2rem] border border-white/10 hover:border-[var(--color-primary)]/50 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col"
                            tabIndex={0}
                            role="button"
                            aria-label={`Load saved scan: ${scan.title}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                {scan.base64Image ? (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/20 border border-white/5 flex-shrink-0">
                                        <img src={scan.base64Image} alt="Thumbnail preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                ) : (
                                    <div className="p-3 bg-white/5 rounded-xl text-[var(--color-primary)]">
                                        <BookOpen size={24} />
                                    </div>
                                )}
                                <button
                                    onClick={(e) => handleDelete(e, scan.id)}
                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-white/5 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                    aria-label="Delete scan"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-white mb-3 line-clamp-1">{scan.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">
                                {scan.summary}
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto pt-6 border-t border-white/5">
                                <Clock size={14} />
                                {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Recently saved'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, Camera, Clipboard } from "lucide-react";

interface UploadViewProps {
    onFileSelect: (file: File | Blob) => void;
}

export default function UploadView({ onFileSelect }: UploadViewProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                onFileSelect(e.dataTransfer.files[0]);
            }
        },
        [onFileSelect]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
        }
    };

    const handlePaste = useCallback(
        async () => {
            try {
                const items = await navigator.clipboard.read();
                for (const item of items) {
                    const imageTypes = item.types.filter((type) => type.startsWith("image/"));
                    if (imageTypes.length > 0) {
                        const blob = await item.getType(imageTypes[0]);
                        onFileSelect(blob);
                        return;
                    }
                }
                alert("No image found on clipboard.");
            } catch (err) {
                console.error("Paste failed", err);
                alert("Unable to read clipboard. Please ensure permissions are granted.");
            }
        },
        [onFileSelect]
    );

    const handleCamera = async () => {
        if (fileInputRef.current) {
            fileInputRef.current.setAttribute("capture", "environment");
            fileInputRef.current.click();
            setTimeout(() => fileInputRef.current?.removeAttribute("capture"), 1000);
        }
    };

    return (
        <div className="w-full flex flex-col items-center justify-center p-4 min-h-[80vh]">

            <div className="text-center mb-10 space-y-4">
                <h3 className="text-4xl font-bold">Start Clarifying</h3>
                <p className="text-xl text-gray-400">Drop a file below to begin analysis.</p>
            </div>

            <div
                className={`w-full max-w-5xl aspect-[21/9] min-h-[400px] border-[3px] rounded-[3rem] flex flex-col items-center justify-center text-center p-12 transition-all duration-300 relative overflow-hidden group ${isDragging
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.02] shadow-[0_0_50px_rgba(234,179,8,0.2)]"
                    : "border-white/20 glass-panel hover:border-white/40 hover:bg-white/[0.02]"
                    }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                role="region"
                aria-label="File upload dropzone"
            >
                {/* Subtle gradient glow inside the box when dragging */}
                <div className={`absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/5 to-transparent opacity-0 transition-opacity duration-500 ${isDragging ? 'opacity-100' : ''}`} pointer-events-none></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className={`p-6 rounded-full mb-8 transition-colors duration-300 ${isDragging ? "bg-[var(--color-primary)]/20 text-[var(--color-primary)]" : "bg-white/5 text-gray-300 group-hover:bg-white/10"}`}>
                        <UploadCloud size={64} aria-hidden="true" />
                    </div>

                    <h2 className="text-3xl font-bold mb-12 text-gray-200">Drag and drop document here</h2>

                    <div className="flex flex-col md:flex-row gap-6 w-full justify-center">
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            aria-label="File input"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 max-w-[240px] flex items-center justify-center gap-3 py-5 px-6 bg-white text-black rounded-2xl font-bold text-xl hover:scale-105 hover:bg-gray-200 transition-all border border-transparent focus:ring-4 focus:ring-white/50 focus:outline-none"
                            aria-label="Upload Image or PDF from computer"
                        >
                            <UploadCloud size={24} />
                            <span>Browse Files</span>
                        </button>

                        <button
                            onClick={handleCamera}
                            className="flex-1 max-w-[240px] flex items-center justify-center gap-3 py-5 px-6 glass text-white rounded-2xl font-bold text-xl hover:bg-white/10 hover:scale-105 transition-all focus:ring-4 focus:ring-white/50 focus:outline-none"
                            aria-label="Use camera to take a photo"
                        >
                            <Camera size={24} />
                            <span>Camera</span>
                        </button>

                        <button
                            onClick={handlePaste}
                            className="flex-1 max-w-[240px] flex items-center justify-center gap-3 py-5 px-6 glass text-white rounded-2xl font-bold text-xl hover:bg-white/10 hover:scale-105 transition-all focus:ring-4 focus:ring-white/50 focus:outline-none"
                            aria-label="Paste image from clipboard"
                        >
                            <Clipboard size={24} />
                            <span>Paste</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

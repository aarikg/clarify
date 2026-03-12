"use client";

import { useState } from "react";
import Header from "@/components/Header";
import UploadView from "@/components/UploadView";
import LoadingView from "@/components/LoadingView";
import OutputView from "@/components/OutputView";
import { processDocument } from "@/lib/mockApi";
import { AppState, OutputData } from "@/lib/types";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputData, setOutputData] = useState<OutputData | null>(null);

  const handleFileSubmit = async (file: File | Blob) => {
    // Generate preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setAppState("loading");

    try {
      // Simulate API Call
      const result = await processDocument(file);
      setOutputData(result);
      setAppState("success");
    } catch (error) {
      console.error(error);
      setAppState("error");
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setOutputData(null);
    setAppState("upload");
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-7xl mx-auto">
        {appState === "upload" && <UploadView onFileSubmit={handleFileSubmit} />}
        {appState === "loading" && <LoadingView />}
        {appState === "success" && outputData && previewUrl && (
          <OutputView
            data={outputData}
            previewUrl={previewUrl}
            onReset={handleReset}
          />
        )}
        {appState === "error" && (
          <div className="text-center space-y-4">
            <h2 className="text-3xl text-red-500 font-bold">Error Processing Document</h2>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-[var(--color-primary)] text-black font-bold rounded-md"
            >
              Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import Header from "@/components/Header";
import UploadView from "@/components/UploadView";
import LoadingView from "@/components/LoadingView";
import OutputView from "@/components/OutputView";
import LibraryView from "@/components/LibraryView";
import NavigationDock from "@/components/NavigationDock";
import LiveCaptionsView from "@/components/LiveCaptionsView";
import CodeReaderView from "@/components/CodeReaderView";
import SonificationPlaygroundView from "@/components/SonificationPlaygroundView";
import { AppState, OutputData } from "@/lib/types";
import { processDocument } from "@/lib/mockApi";
import { ArrowDown } from "lucide-react";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<"home" | "scan" | "live_captions" | "code_reader" | "sonify" | "library">("home");

  // OCR/Processing State (only relevant when tab is 'scan')
  const [appState, setAppState] = useState<AppState>("upload");
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | undefined>(undefined);
  const [outputData, setOutputData] = useState<OutputData | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const resizeAndEncodeImage = (file: File | Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.6));
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileProcess = async (file: File | Blob) => {
    try {
      setAppState("loading");
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);

      try {
        const b64 = await resizeAndEncodeImage(file);
        setBase64Image(b64);
      } catch (e) {
        console.warn("Failed to create base64 preview for storage", e);
      }

      // Call the API endpoint
      const data = await processDocument(file);

      setOutputData(data);
      setAppState("success");
    } catch (error) {
      console.error("Failed to process document:", error);
      setAppState("error");
    }
  };

  const resetState = () => {
    setAppState("upload");
    setFilePreviewUrl(null);
    setOutputData(null);
  };

  const scrollToWorkspace = () => {
    setCurrentTab("scan");
    const workspace = document.getElementById("interactive-workspace");
    if (workspace) {
      workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLoadScan = (data: OutputData) => {
    // If the saved scan has a base64Image, use it! Otherwise fallback to the placeholder.
    setFilePreviewUrl(data.base64Image || "/placeholder-scan.svg");
    setOutputData(data);
    setAppState("success");
    setCurrentTab("scan");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col pb-32"> {/* pb-32 for the navigation dock */}
      <Header isHelpOpen={isHelpOpen} setIsHelpOpen={setIsHelpOpen} />

      {/* Conditional Hero Section (Only visible on initial load / 'home' tab) */}
      {currentTab === "home" && (
        <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-1000">
          <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6 bg-gradient-to-br from-white via-gray-200 to-gray-500 bg-clip-text text-transparent drop-shadow-sm">
            See the Math.<br />Hear the Meaning.
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 max-w-2xl mb-12 font-light">
            Clarify translates complex STEM materials—like visual equations, matrices, and graphs—into ultra-accessible audio descriptions instantly.
          </p>
          <button
            onClick={scrollToWorkspace}
            className="group relative flex items-center justify-center gap-3 py-5 px-10 bg-[var(--color-primary)] text-black rounded-full font-bold text-2xl transition-all duration-300 hover:scale-105 shadow-[0_0_40px_rgba(234,179,8,0.2)] hover:shadow-[0_0_60px_rgba(234,179,8,0.4)] overflow-hidden"
            aria-label="Scroll down to get started processing a document"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span>Get Started</span>
            <ArrowDown size={28} className="animate-bounce" />
          </button>
        </section>
      )}

      {/* Main Content Area based on Tab */}
      <main
        id="interactive-workspace"
        className={`flex-1 flex flex-col items-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-500 ${currentTab === "home" ? "pt-24" : "pt-32 md:pt-40"
          }`}
      >
        {/* SCAN TAB */}
        {currentTab === "scan" && (
          <>
            {appState === "upload" && (
              <UploadView onFileSelect={handleFileProcess} />
            )}

            {appState === "loading" && (
              <LoadingView />
            )}

            {appState === "success" && outputData && filePreviewUrl && (
              <OutputView
                data={{ ...outputData, base64Image }}
                previewUrl={filePreviewUrl}
                onReset={resetState}
              />
            )}

            {appState === "error" && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6 glass-panel p-12 rounded-[3rem] animate-in zoom-in-95 duration-500">
                <div
                  className="text-red-500 font-bold text-3xl flex items-center gap-4"
                  role="alert"
                >
                  <span className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></span>
                  Error Processing Document
                </div>
                <p className="text-xl text-gray-400 max-w-md">There was a problem translating this image. Please ensure it is clear and contains readable text or math.</p>
                <button
                  onClick={resetState}
                  className="mt-8 py-4 px-10 bg-white text-black rounded-full font-bold text-xl hover:scale-105 transition-transform"
                >
                  Try Again
                </button>
              </div>
            )}
          </>
        )}

        {/* LIBRARY TAB */}
        {currentTab === "library" && (
          <LibraryView onLoadScan={handleLoadScan} />
        )}

        {/* LIVE CAPTIONS TAB */}
        {currentTab === "live_captions" && (
          <LiveCaptionsView />
        )}

        {/* CODE READER TAB */}
        {currentTab === "code_reader" && (
          <CodeReaderView />
        )}

        {/* SONIFICATION TAB */}
        {currentTab === "sonify" && (
          <SonificationPlaygroundView />
        )}

      </main>

      {/* Global Navigation Dock */}
      {!isHelpOpen && (
        <NavigationDock currentTab={currentTab} onTabChange={setCurrentTab as any} />
      )}

    </div>
  );
}

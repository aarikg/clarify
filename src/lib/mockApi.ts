import { OutputData } from "./types";

export const processDocument = async (file: File | Blob | null): Promise<OutputData> => {
    if (!file) {
        throw new Error("No file provided");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze document");
    }

    return response.json();
};

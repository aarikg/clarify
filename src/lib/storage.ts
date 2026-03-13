import { OutputData } from "./types";

export interface SavedScan extends OutputData {
    id: string;
    createdAt: number;
    title: string;
    base64Image?: string; // Optional for backward compatibility with old saves
}

const STORAGE_KEY = "clarify_saved_scans";

export const saveScanToLibrary = (data: OutputData, title: string = "New Scan"): string => {
    try {
        const existingScansJson = localStorage.getItem(STORAGE_KEY);
        const existingScans: SavedScan[] = existingScansJson ? JSON.parse(existingScansJson) : [];

        const newScan: SavedScan = {
            ...data,
            id: crypto.randomUUID(), // Works in modern browsers
            createdAt: Date.now(),
            title
        };

        existingScans.unshift(newScan); // Add to beginning
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingScans));

        return newScan.id;
    } catch (error) {
        console.error("Error saving scan to local storage:", error);
        throw error;
    }
};

export const getSavedScans = (): SavedScan[] => {
    try {
        const existingScansJson = localStorage.getItem(STORAGE_KEY);
        return existingScansJson ? JSON.parse(existingScansJson) : [];
    } catch (error) {
        console.error("Error retrieving scans from local storage:", error);
        return [];
    }
};

export const deleteScan = (id: string): void => {
    try {
        const existingScansJson = localStorage.getItem(STORAGE_KEY);
        if (!existingScansJson) return;

        const existingScans: SavedScan[] = JSON.parse(existingScansJson);
        const filteredScans = existingScans.filter(scan => scan.id !== id);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredScans));
    } catch (error) {
        console.error("Error deleting scan from local storage:", error);
        throw error;
    }
};

export type AppState = "upload" | "loading" | "success" | "error";

export interface OutputData {
    document_type: string;
    summary: string;
    raw_latex: string;
    audio_optimized_text: string;
}

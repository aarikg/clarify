export type AppState = "upload" | "loading" | "success" | "error";

export interface OutputData {
    document_type: string;
    summary: string;
    raw_latex: string;
    audio_optimized_text: string;

    // Advanced Features
    interactive_steps?: string[]; // Array of strings to step through complex math
    data_points?: { x: number; y: number }[]; // Array of points for graph sonification
    nemeth_braille?: string; // Braille representation
    mathml?: string; // MathML syntax
    base64Image?: string; // Optional image data for previews
}

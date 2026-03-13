import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert file to base64
        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");

        // Determine mime type
        const mimeType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
You are an expert STEM accessibility interpreter. Your job is to analyze the provided image or PDF document and extract math, equations, graphs, or scientific text.
You MUST output your response strictly as valid, raw JSON using the exact schema below. Do not include markdown formatting or backticks around the output.

Schema:
{
  "document_type": "string" (e.g. "math_equation", "science_graph", "text_document"),
  "summary": "string" (A 1-2 sentence high-level summary of what the document contains.),
  "raw_latex": "string" (The raw extracted LaTeX or text exactly as it appears.),
  "audio_optimized_text": "string" (A highly descriptive, natural-language version specifically written to be read aloud by a screen reader or TTS engine.),
  "interactive_steps": ["string", "string"] (OPTIONAL. If the document contains a complex equation or matrix, break it down into an array of small, logical, easy-to-read steps. E.g., ["Row 1 is 5", "Row 2 is 10"]. Leave null or empty if not applicable.),
  "data_points": [{"x": number, "y": number}] (OPTIONAL. If the document is a line graph or scatter plot, extract anywhere from 10 to 50 key continuous data points (x and y numeric values) to represent the shape of the graph for audio sonification. Leave null if not a graph.),
  "nemeth_braille": "string" (OPTIONAL. Translate the math into standard Nemeth Braille code if applicable. Leave null if not math.),
  "mathml": "string" (OPTIONAL. Translate the math into clean MathML syntax. Leave null if not math.)
}
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType
                }
            }
        ]);

        const responseText = result.response.text();

        // Clean up potential markdown formatting from the output just in case
        const jsonString = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        const parsedData = JSON.parse(jsonString);

        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("Error analyzing document:", error);
        return NextResponse.json(
            { error: "Failed to analyze document", details: error.message },
            { status: 500 }
        );
    }
}

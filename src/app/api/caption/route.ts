import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API Key is missing in environment variables" }, { status: 500 });
    }

    try {
        const { text } = await req.json();

        if (!text) {
            return NextResponse.json({ error: "No text provided" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object" as any,
                    properties: {
                        latex: {
                            type: "string" as any,
                            description: "The strictly formatted LaTeX representation of the mathematical speech provided. Only output pure LaTeX math mode contents without block delimiters like $$ or \\[. If the text is plain conversational English, format it elegantly or return it as standard text within latex text blocks."
                        }
                    },
                    required: ["latex"]
                }
            }
        });

        const prompt = `You are an expert transcriber specializing in STEM, specifically mathematics, physics, and computer science. 
Your goal is to take a stream of raw, messy speech from a lecture and convert the spoken math jargon into perfectly formatted LaTeX. 

For example, if the input is: "so we have the integral from zero to infinity of x squared dx and that equals..."
Your output MUST be precisely: "\\int_{0}^{\\infty} x^2 dx ="

Focus entirely on getting the math notation perfectly correct. Ignore filler words like "um", "ah", "so".
Here is the transcribed text from the lecture:
"${text}"
`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const out = response.text();

        // Gemini should return JSON based on schema
        try {
            const parsed = JSON.parse(out);
            return NextResponse.json({ latex: parsed.latex });
        } catch (e) {
            // Fallback if parsing fails for some reason
            return NextResponse.json({ latex: out }, { status: 200 });
        }

    } catch (error) {
        console.error("Captioning error:", error);
        return NextResponse.json({ error: "Failed to parse spoken math" }, { status: 500 });
    }
}

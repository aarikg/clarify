import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API Key is missing in environment variables" }, { status: 500 });
    }

    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object" as any,
                    properties: {
                        semantic_summary: {
                            type: "string" as any,
                            description: "A high-level sentence summarizing what the code block does. E.g., 'This Python script uses a for-loop to sort an array of numbers.'"
                        },
                        logic_breakdown: {
                            type: "array" as any,
                            items: {
                                type: "string" as any
                            },
                            description: "Step-by-step logic breakdown in plain English designed to be read aloud by a screen reader. Do not read out specific punctuation like brackets or semicolons. Focus on the flow of logic."
                        }
                    },
                    required: ["semantic_summary", "logic_breakdown"]
                }
            }
        });

        const prompt = `You are an accessibility tool for blind programmers.
Analyze the following code block and provide a semantic breakdown designed for text-to-speech.

Code:
\`\`\`
${code}
\`\`\`
`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const out = response.text();

        try {
            const parsed = JSON.parse(out);
            return NextResponse.json(parsed);
        } catch (e) {
            return NextResponse.json({ error: "Failed to parse AI output" }, { status: 500 });
        }

    } catch (error) {
        console.error("Code reading error:", error);
        return NextResponse.json({ error: "Failed to process code" }, { status: 500 });
    }
}

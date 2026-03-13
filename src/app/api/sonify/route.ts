import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function POST(req: NextRequest) {
    if (!apiKey) {
        return NextResponse.json({ error: "Gemini API Key is missing" }, { status: 500 });
    }

    try {
        const { input } = await req.json();

        if (!input) {
            return NextResponse.json({ error: "No input provided" }, { status: 400 });
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "object" as any,
                    properties: {
                        data_points: {
                            type: "array" as any,
                            items: {
                                type: "object" as any,
                                properties: {
                                    x: { type: "string" as any },
                                    y: { type: "number" as any }
                                },
                                required: ["x", "y"]
                            },
                            description: "An array of 20 coordinate points representing the mathematical function or data set provided."
                        },
                        summary: {
                            type: "string" as any,
                            description: "A very brief explanation of the shape of this data (e.g. 'This is a parabola that opens upwards')."
                        }
                    },
                    required: ["data_points", "summary"]
                }
            }
        });

        const prompt = `You are a mathematical data engine. 
The user has provided either a mathematical function (like "y = x^2") or a raw data set description (like "sales data showing a sharp drop then a slow recovery").
Your job is to generate exactly 20 coordinate points (x, y) that represent this input, so it can be sonified via an audio oscillator.

Scale the Y values dynamically but keep the X values evenly spaced as strings (like "1", "2", "3").

User Input:
"${input}"
`;

        const result = await model.generateContent(prompt);
        const out = result.response.text();

        try {
            return NextResponse.json(JSON.parse(out));
        } catch (e) {
            return NextResponse.json({ error: "Failed to parse data points" }, { status: 500 });
        }

    } catch (error) {
        console.error("Sonification error:", error);
        return NextResponse.json({ error: "Failed to generate data" }, { status: 500 });
    }
}
